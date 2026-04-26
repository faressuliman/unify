// Detect whether a piece of free-form text is written in Arabic so we can
// render it with the correct visual direction regardless of the current UI
// language. Without this, an Arabic name authored while the UI was in
// Arabic would render misaligned when an English visitor browses the site.

const ARABIC_RANGE_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export const containsArabic = (text: string | undefined | null): boolean => {
  if (!text) return false;
  return ARABIC_RANGE_REGEX.test(text);
};

export type TextScript = "ar" | "en";

export const detectScript = (text: string | undefined | null): TextScript =>
  containsArabic(text) ? "ar" : "en";

// Direction safe to set on `dir=...` attributes and CSS classes. Returns
// "rtl" for Arabic text, "ltr" otherwise. Empty / null inputs fall back to
// "ltr" since they have nothing to mis-render.
export const directionFor = (text: string | undefined | null): "rtl" | "ltr" =>
  containsArabic(text) ? "rtl" : "ltr";
