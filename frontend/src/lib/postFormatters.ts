// ─────────────────────────────────────────────────────────────────────────────
// Localized formatting helpers shared by every page that renders a post card
// (Search, RecentUpdates, Profile, …). All consumers map raw `BackendPost`s
// into the `ProfileData` shape expected by the cards/modals; doing it here
// keeps that mapping consistent and language-aware so toggling the language
// re-renders the same card with translated copy instead of stale English.
// ─────────────────────────────────────────────────────────────────────────────

import type { BackendPost } from './api';
import { toArabicDisplay, toRTLDisplay } from './transliterate';

// ── Time ─────────────────────────────────────────────────────────────────────

export const humanizeTimeAgo = (
  dateString: string | undefined,
  isRTL: boolean,
): string => {
  if (!dateString) {
    return isRTL ? 'تم النشر مؤخراً' : 'Recently posted';
  }
  const now = Date.now();
  const then = new Date(dateString).getTime();
  if (Number.isNaN(then)) {
    return isRTL ? 'تم النشر مؤخراً' : 'Recently posted';
  }

  const diffMs = Math.max(now - then, 0);
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (isRTL) {
    if (diffHours < 1) return 'أقل من ساعة';
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `منذ ${diffDays} يوم`;
    const diffMonths = Math.floor(diffDays / 30);
    return `منذ ${diffMonths} شهر`;
  }

  if (diffHours < 1) return 'Less than 1 hour ago';
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
};

// ── Gender / age ─────────────────────────────────────────────────────────────

const GENDER_AR: Record<string, string> = {
  male: 'ذكر',
  female: 'أنثى',
  unknown: 'غير معروف',
};

const GENDER_EN: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  unknown: 'Unknown',
};

export const formatGender = (
  gender: string | undefined,
  isRTL: boolean,
): string => {
  const fallback = isRTL ? 'غير معروف' : 'Unknown';
  if (!gender) return fallback;
  const map = isRTL ? GENDER_AR : GENDER_EN;
  return map[gender.toLowerCase()] ?? fallback;
};

const AGE_UNIT_AR: Record<string, string> = {
  years: 'سنة',
  year: 'سنة',
  months: 'شهر',
  month: 'شهر',
  days: 'يوم',
  day: 'يوم',
};

export const formatAge = (
  age: number | undefined,
  ageUnit: string | undefined,
  isRTL: boolean,
): string | undefined => {
  if (!age) return undefined;
  const unitKey = (ageUnit || 'years').toLowerCase();
  const unit = isRTL ? AGE_UNIT_AR[unitKey] ?? 'سنة' : ageUnit ?? 'years';
  return `${age} ${unit}`;
};

export const formatPersonDetails = (
  gender: string | undefined,
  age: number | undefined,
  ageUnit: string | undefined,
  isRTL: boolean,
): string => {
  const genderText = formatGender(gender, isRTL);
  const ageText =
    formatAge(age, ageUnit, isRTL) ?? (isRTL ? 'عمر غير معروف' : 'Unknown age');
  const sep = isRTL ? '، ' : ', ';
  return `${genderText}${sep}${ageText}`;
};

// ── Physical description ─────────────────────────────────────────────────────

const COLOR_AR: Record<string, string> = {
  black: 'أسود',
  brown: 'بني',
  blonde: 'أشقر',
  blond: 'أشقر',
  red: 'أحمر',
  gray: 'رمادي',
  grey: 'رمادي',
  white: 'أبيض',
  blue: 'أزرق',
  green: 'أخضر',
  hazel: 'عسلي',
  auburn: 'كستنائي',
};

const localiseColor = (color: string | undefined, isRTL: boolean): string | undefined => {
  if (!color) return undefined;
  if (!isRTL) return color;
  return COLOR_AR[color.trim().toLowerCase()] ?? toRTLDisplay(color, true);
};

export const formatPhysicalDescription = (
  hairColour: string | undefined,
  eyeColour: string | undefined,
  isRTL: boolean,
): string => {
  const hair = localiseColor(hairColour, isRTL);
  const eyes = localiseColor(eyeColour, isRTL);
  const sep = isRTL ? '، ' : ', ';

  if (isRTL) {
    const parts: string[] = [];
    if (hair) parts.push(`شعر ${hair}`);
    if (eyes) parts.push(`عيون ${eyes}`);
    return parts.join(sep);
  }

  const parts: string[] = [];
  if (hair) parts.push(`${hair} hair`);
  if (eyes) parts.push(`${eyes} eyes`);
  return parts.join(sep);
};

// ── Location ─────────────────────────────────────────────────────────────────

/**
 * Combine a "specific location" (last seen / found) and a city, joined by
 * a comma when they differ. Uses `toRTLDisplay` so:
 *   - Latin locations are transliterated to Arabic in RTL mode.
 *   - Arabic locations are preserved as-is in English mode (the poster
 *     chose to write in Arabic and we respect that).
 */
export const buildLocation = (
  specific: string | undefined,
  city: string | undefined,
  isRTL: boolean,
): string => {
  const sep = isRTL ? '، ' : ', ';
  // Localise each part independently before joining so mixed-script entries
  // (e.g. Arabic specific + English city) are each handled correctly.
  const localSpecific = toRTLDisplay(specific, isRTL);
  const localCity = toRTLDisplay(city, isRTL);
  if (
    localSpecific &&
    localCity &&
    localSpecific.trim().toLowerCase() !== localCity.trim().toLowerCase()
  ) {
    return `${localSpecific}${sep}${localCity}`;
  }
  return localSpecific || localCity || (isRTL ? 'موقع غير معروف' : 'Unknown location');
};

// ── Map a backend post → ProfileData fields used by the cards ───────────────

export interface MappedPostFields {
  name: string;
  location: string;
  city?: string;
  timeAgo: string;
  details: string;
  age?: string;
  physicalDescription: string;
  clothingDescription?: string;
  lastSeenLocationDetails?: string;
  foundLocationDetails?: string;
  reportDate?: string;
  postedBy?: string;
  postUserId?: string;
}

export const mapPostFields = (
  post: BackendPost,
  isRTL: boolean,
): MappedPostFields => {
  const userIdValue = post.userId;
  const postedByRaw =
    typeof userIdValue === 'object' && userIdValue !== null
      ? userIdValue.name
      : undefined;
  const postUserId =
    typeof userIdValue === 'object' && userIdValue !== null
      ? userIdValue._id
      : typeof userIdValue === 'string'
        ? userIdValue
        : undefined;

  const specific =
    post.postType === 'missing' ? post.lastSeenLocation : post.foundLocation;

  return {
    name: toArabicDisplay(post.name, isRTL),
    location: buildLocation(specific, post.city, isRTL),
    city: toRTLDisplay(post.city, isRTL) || undefined,
    timeAgo: humanizeTimeAgo(post.createdAt, isRTL),
    details: formatPersonDetails(post.gender, post.age, post.ageUnit, isRTL),
    age: formatAge(post.age, post.ageUnit, isRTL),
    physicalDescription: formatPhysicalDescription(
      post.hairColour,
      post.eyeColour,
      isRTL,
    ),
    clothingDescription: toRTLDisplay(post.clothesDescription, isRTL) || undefined,
    lastSeenLocationDetails: toRTLDisplay(post.lastSeenLocation, isRTL) || undefined,
    foundLocationDetails: toRTLDisplay(post.foundLocation, isRTL) || undefined,
    reportDate: post.createdAt
      ? new Date(post.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')
      : undefined,
    postedBy: toArabicDisplay(postedByRaw, isRTL) || undefined,
    postUserId,
  };
};
