export interface AiImageCheckResult {
  passed: boolean;
  /** User-facing error reason (only set when passed === false) */
  reason: string;
}

/**
 * Calls the Python AI microservice to determine whether an image is
 * AI-generated or a real photograph.
 *
 * - Logs the full result (including confidence) to the console.
 * - Never exposes the confidence score in the returned reason string.
 * - Returns { passed: true } when the image passes (≥ 80 % human).
 * - Returns { passed: false, reason } when blocked or on error.
 *
 * Used by: SearchFiltersPanel, ClaimFamilyModal.
 * (Register uses the backend-only flow via auth.service.js)
 */
/** Minimum time (ms) the loading toast stays visible */
const MIN_DISPLAY_MS = 2500;

export async function checkAiImage(file: File): Promise<AiImageCheckResult> {
  const minDelay = new Promise<void>((resolve) => setTimeout(resolve, MIN_DISPLAY_MS));

  try {
    const fd = new FormData();
    fd.append('image', file);

    const aiServiceUrl = import.meta.env.VITE_AI_SERVICE_URL;
    const [res] = await Promise.all([
      fetch(`${aiServiceUrl}/detect-ai-image`, {
        method: 'POST',
        body: fd,
      }),
      minDelay,
    ]);

    const data = await res.json() as {
      success: boolean;
      is_ai_generated?: boolean;
      confidence?: number;
      label?: string;
      decision?: string;
      error?: string;
    };

    // Always log full details (including confidence) to the console only.
    console.log('[aiImageCheck] AI detection result:', data);

    if (!data.success) {
      return {
        passed: false,
        reason: 'Could not verify image authenticity. Please try again.',
      };
    }

    if (data.decision === 'pass') {
      return { passed: true, reason: '' };
    }

    // Blocked — do NOT include confidence in the user-facing reason.
    return {
      passed: false,
      reason:
        'The uploaded image was detected as AI-generated or has insufficient biological authenticity.',
    };
  } catch (err) {
    await minDelay;
    console.error('[aiImageCheck] Request failed:', err);
    // If the AI service is offline, fail open (let the request through)
    // so the app doesn't break — mirrors the backend behaviour.
    return { passed: true, reason: '' };
  }
}
