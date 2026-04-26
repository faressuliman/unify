// Lightweight Arabic ↔ Latin transliteration helpers used to make name search
// work across both scripts. The maps prioritise common Egyptian Arabic
// spellings rather than strict academic transliteration.

const ARABIC_RANGE_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export const containsArabic = (text) => {
  if (typeof text !== "string") return false;
  return ARABIC_RANGE_REGEX.test(text);
};

export const detectScript = (text) => {
  if (containsArabic(text)) return "ar";
  return "en";
};

// Ordered: longer keys first so multi-letter combos like "sh" win over "s".
const ARABIC_TO_LATIN = [
  ["ث", "th"],
  ["ذ", "th"],
  ["ش", "sh"],
  ["خ", "kh"],
  ["غ", "gh"],
  ["ا", "a"],
  ["أ", "a"],
  ["إ", "i"],
  ["آ", "aa"],
  ["ب", "b"],
  ["ت", "t"],
  ["ج", "g"],
  ["ح", "h"],
  ["د", "d"],
  ["ر", "r"],
  ["ز", "z"],
  ["س", "s"],
  ["ص", "s"],
  ["ض", "d"],
  ["ط", "t"],
  ["ظ", "z"],
  ["ع", "a"],
  ["ف", "f"],
  ["ق", "q"],
  ["ك", "k"],
  ["ل", "l"],
  ["م", "m"],
  ["ن", "n"],
  ["ه", "h"],
  ["و", "w"],
  ["ي", "y"],
  ["ى", "a"],
  ["ة", "a"],
  ["ء", ""],
  ["ؤ", "o"],
  ["ئ", "e"],
  ["ـ", ""],
  ["،", ","],
  ["؛", ";"],
  ["؟", "?"],
];

const ARABIC_DIACRITICS = /[\u064B-\u0652\u0670\u0640]/g;

export const arabicToLatin = (text) => {
  if (!text) return "";
  let out = String(text).replace(ARABIC_DIACRITICS, "");
  for (const [ar, en] of ARABIC_TO_LATIN) {
    out = out.split(ar).join(en);
  }
  return out.replace(/\s+/g, " ").trim().toLowerCase();
};

// Approximate Latin → Arabic. We map common digraphs first, then single
// letters. This is a best-effort fallback used only for search; create-time
// posts are written in Arabic naturally so they keep their original glyphs.
const LATIN_TO_ARABIC = [
  ["sh", "ش"],
  ["kh", "خ"],
  ["gh", "غ"],
  ["th", "ث"],
  ["aa", "ا"],
  ["ee", "ي"],
  ["oo", "و"],
  ["ph", "ف"],
  ["ch", "تش"],
  ["a", "ا"],
  ["b", "ب"],
  ["c", "ك"],
  ["d", "د"],
  ["e", "ي"],
  ["f", "ف"],
  ["g", "ج"],
  ["h", "ه"],
  ["i", "ي"],
  ["j", "ج"],
  ["k", "ك"],
  ["l", "ل"],
  ["m", "م"],
  ["n", "ن"],
  ["o", "و"],
  ["p", "ب"],
  ["q", "ق"],
  ["r", "ر"],
  ["s", "س"],
  ["t", "ت"],
  ["u", "و"],
  ["v", "ف"],
  ["w", "و"],
  ["x", "كس"],
  ["y", "ي"],
  ["z", "ز"],
];

export const latinToArabic = (text) => {
  if (!text) return "";
  let out = String(text).toLowerCase();
  for (const [en, ar] of LATIN_TO_ARABIC) {
    out = out.split(en).join(ar);
  }
  return out.replace(/\s+/g, " ").trim();
};

// Build a normalized-Latin index entry that also collapses doubled letters
// so "ahmed" and "ahmd" / "mohammad" and "mohamed" still match coarsely.
export const normalizeLatin = (text) => {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/(.)\1+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
};

// Strip short vowels so "ahmed" and "أحمد" (which transliterates to "ahmd")
// converge on the same consonant skeleton "hmd". This is what makes the
// cross-script name search forgiving without needing a full NLP stack.
const VOWELS_REGEX = /[aeiouy]/g;

export const toConsonantSkeleton = (text) => {
  if (!text) return "";
  return normalizeLatin(text)
    .replace(VOWELS_REGEX, "")
    .replace(/(.)\1+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
};

// Generate a Latin search key for a string regardless of input script. The
// key is the consonant skeleton because that's what we want to match against
// from queries written in either Arabic or Latin script.
export const toSearchKey = (text) => {
  if (!text) return "";
  const latin = containsArabic(text) ? arabicToLatin(text) : text;
  return toConsonantSkeleton(latin);
};

// Escape regex meta characters so user input can be used inside `new RegExp`.
export const escapeRegex = (text) =>
  String(text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
