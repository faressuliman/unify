// ─────────────────────────────────────────────────────────────────────────────
// Latin → Arabic transliteration helpers used to render user-supplied content
// (names, locations) in Arabic when the UI is in RTL mode.
//
// Pure letter-by-letter transliteration produces nonsense for proper nouns
// ("Ahmed" → "اهميد", "Alexandria" → "اليكساندريا"), so the implementation
// below is dictionary-first:
//
//   1. Multi-word phrases (e.g. "San Stefano", "Sharm El Sheikh") are matched
//      and replaced as whole tokens.
//   2. Each remaining Latin word is looked up in a curated dictionary of
//      common Arabic given names and Egyptian places.
//   3. Anything still unmatched falls back to a phoneme-based letter map.
//
// The aim is "good enough" cross-script display, not academic transliteration.
// ─────────────────────────────────────────────────────────────────────────────

import { EGYPTIAN_CITIES, EGYPTIAN_CITIES_AR } from '../data/cities';

const ARABIC_RANGE_REGEX =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export const containsArabic = (text: string): boolean =>
  ARABIC_RANGE_REGEX.test(text);

const escapeRegex = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── Curated dictionaries ─────────────────────────────────────────────────────

// City names from the official dropdown (kept in lockstep with `data/cities.ts`).
const CITY_DICT: Record<string, string> = EGYPTIAN_CITIES.reduce(
  (acc, en, idx) => {
    const ar = EGYPTIAN_CITIES_AR[idx];
    if (ar) acc[en.toLowerCase()] = ar;
    return acc;
  },
  {} as Record<string, string>,
);

// Common Egyptian neighborhoods/landmarks people enter as the "specific
// location" (last seen / found). Lowercased keys; values are the typical
// Arabic spellings.
const PLACE_DICT: Record<string, string> = {
  // Alexandria neighborhoods
  'san stefano': 'سان ستيفانو',
  'sidi gaber': 'سيدي جابر',
  'sidi bishr': 'سيدي بشر',
  'sidi beshr': 'سيدي بشر',
  'smouha': 'سموحة',
  'stanley': 'ستانلي',
  'gleem': 'جليم',
  'glym': 'جليم',
  'mandara': 'المندرة',
  'maamoura': 'المعمورة',
  'el maamoura': 'المعمورة',
  'asafra': 'العصافرة',
  'el asafra': 'العصافرة',
  'miami': 'ميامي',
  'roushdy': 'رشدي',
  'cleopatra': 'كليوباترا',
  'sporting': 'سبورتنج',
  'camp shezar': 'كامب شيزار',
  'raml station': 'محطة الرمل',
  'mahatet el raml': 'محطة الرمل',
  'manshia': 'المنشية',
  'el manshia': 'المنشية',
  'bahary': 'بحري',
  'el labban': 'اللبان',
  'agamy': 'العجمي',
  'agami': 'العجمي',
  'el agamy': 'العجمي',
  'borg el arab': 'برج العرب',
  'abu qir': 'أبو قير',
  'abu kir': 'أبو قير',
  'montaza': 'المنتزه',
  'el montaza': 'المنتزه',
  'corniche': 'الكورنيش',
  'el corniche': 'الكورنيش',
  'el max': 'المكس',
  'kafr abdo': 'كفر عبده',
  'fleming': 'فلمنج',
  'louran': 'لوران',
  'bolkly': 'بولكلي',
  'saba pasha': 'سابا باشا',
  'tharwat': 'ثروت',
  'mostafa kamel': 'مصطفى كامل',
  // Cairo neighborhoods
  'nasr city': 'مدينة نصر',
  'madinet nasr': 'مدينة نصر',
  'maadi': 'المعادي',
  'heliopolis': 'مصر الجديدة',
  'masr el gedida': 'مصر الجديدة',
  'misr el gedida': 'مصر الجديدة',
  'zamalek': 'الزمالك',
  'el zamalek': 'الزمالك',
  'dokki': 'الدقي',
  'el dokki': 'الدقي',
  'mohandessin': 'المهندسين',
  'el mohandessin': 'المهندسين',
  'agouza': 'العجوزة',
  'el agouza': 'العجوزة',
  'sheikh zayed': 'الشيخ زايد',
  'fifth settlement': 'التجمع الخامس',
  'el tagamoa el khames': 'التجمع الخامس',
  'rehab': 'الرحاب',
  'el rehab': 'الرحاب',
  'shubra': 'شبرا',
  'helwan': 'حلوان',
  'downtown': 'وسط البلد',
  'wost el balad': 'وسط البلد',
  'tahrir': 'التحرير',
  'tahrir square': 'ميدان التحرير',
  'attaba': 'العتبة',
  'el attaba': 'العتبة',
  'abbassia': 'العباسية',
  'ramsis': 'رمسيس',
  'ramses': 'رمسيس',
  'ain shams': 'عين شمس',
  'matareya': 'المطرية',
  'el matareya': 'المطرية',
  'el marg': 'المرج',
  'imbaba': 'إمبابة',
  'boulaq': 'بولاق',
  'sayeda zeinab': 'السيدة زينب',
  'el sayeda zeinab': 'السيدة زينب',
  'manial': 'المنيل',
  'el manial': 'المنيل',
  'garden city': 'جاردن سيتي',
  'old cairo': 'مصر القديمة',
  'masr el qadima': 'مصر القديمة',
  'mokattam': 'المقطم',
  'el mokattam': 'المقطم',
  'obour': 'العبور',
  'el obour': 'العبور',
  'shorouk': 'الشروق',
  'el shorouk': 'الشروق',
  'badr': 'بدر',
  // Misc
  'sharm el sheikh': 'شرم الشيخ',
  'el alamein': 'العلمين',
  'new alamein': 'العلمين الجديدة',
  'north coast': 'الساحل الشمالي',
  'sahel': 'الساحل',
  'el sahel': 'الساحل',
  'red sea': 'البحر الأحمر',
  'mediterranean': 'البحر المتوسط',
  'sinai': 'سيناء',
  'south sinai': 'جنوب سيناء',
  'north sinai': 'شمال سيناء',
  'delta': 'الدلتا',
  'upper egypt': 'صعيد مصر',
  'port tawfik': 'بورتوفيق',
  'port fouad': 'بورفؤاد',
  'moharam bek': 'محرم بك',
  'new qena': 'قنا الجديدة',
  'tagamoa el khames': 'تجمع الخامس',
  'tajamou el khamis': 'تجمع الخامس',
  'tajamou el khames': 'تجمع الخامس',
};

// Common Arabic given names + surnames as romanised in Egypt. Multiple Latin
// spellings of the same Arabic name are mapped to the canonical form.
const NAME_DICT: Record<string, string> = {
  // Male
  'ahmed': 'أحمد',
  'ahmad': 'أحمد',
  'hannah': 'هنا',
  'hana': 'هنا',
  'zaher': 'زاهر',
  'asser': 'اسر',
  'yassin': 'ياسين',
  'ramadan': 'رمضان',
  'mohamed': 'محمد',
  'mohammed': 'محمد',
  'muhammad': 'محمد',
  'mohammad': 'محمد',
  'mahmoud': 'محمود',
  'mahmood': 'محمود',
  'hussein': 'حسين',
  'hussain': 'حسين',
  'husein': 'حسين',
  'hosny': 'حسني',
  'hosni': 'حسني',
  'hassan': 'حسن',
  'hasan': 'حسن',
  'ali': 'علي',
  'aly': 'علي',
  'omar': 'عمر',
  'amr': 'عمرو',
  'osama': 'أسامة',
  'usama': 'أسامة',
  'khaled': 'خالد',
  'khalid': 'خالد',
  'tarek': 'طارق',
  'tariq': 'طارق',
  'tarik': 'طارق',
  'mostafa': 'مصطفى',
  'moustafa': 'مصطفى',
  'mustafa': 'مصطفى',
  'youssef': 'يوسف',
  'yousef': 'يوسف',
  'yusuf': 'يوسف',
  'ibrahim': 'إبراهيم',
  'ebrahim': 'إبراهيم',
  'karim': 'كريم',
  'kareem': 'كريم',
  'sherif': 'شريف',
  'shereef': 'شريف',
  'hamza': 'حمزة',
  'adam': 'آدم',
  'adel': 'عادل',
  'anas': 'أنس',
  'amir': 'أمير',
  'ameer': 'أمير',
  'ammar': 'عمار',
  'sami': 'سامي',
  'samir': 'سمير',
  'sameer': 'سمير',
  'walid': 'وليد',
  'waleed': 'وليد',
  'wael': 'وائل',
  'rami': 'رامي',
  'ramy': 'رامي',
  'fady': 'فادي',
  'fadi': 'فادي',
  'george': 'جورج',
  'mina': 'مينا',
  'mark': 'مارك',
  'peter': 'بيتر',
  'mario': 'ماريو',
  'tony': 'توني',
  'kirollos': 'كيرلس',
  'beshoy': 'بيشوي',
  'bishoy': 'بيشوي',
  'magdy': 'مجدي',
  'magdi': 'مجدي',
  'medhat': 'مدحت',
  'sayed': 'سيد',
  'sayyed': 'سيد',
  'el sayed': 'السيد',
  'abdallah': 'عبدالله',
  'abdullah': 'عبدالله',
  'abdelrahman': 'عبدالرحمن',
  'abdul rahman': 'عبدالرحمن',
  'abd el rahman': 'عبدالرحمن',
  'abdo': 'عبده',
  'abdou': 'عبده',
  'abdelaziz': 'عبدالعزيز',
  'abdul aziz': 'عبدالعزيز',
  'gamal': 'جمال',
  'galal': 'جلال',
  'salah': 'صلاح',
  'saleh': 'صالح',
  'salem': 'سالم',
  'salim': 'سليم',
  'selim': 'سليم',
  'nader': 'نادر',
  'naser': 'ناصر',
  'nasser': 'ناصر',
  'fares': 'فارس',
  'faris': 'فارس',
  'ezz': 'عز',
  'ezz eldin': 'عزالدين',
  'fouad': 'فؤاد',
  'fuad': 'فؤاد',
  'maged': 'ماجد',
  'majed': 'ماجد',
  'majd': 'مجد',
  'hany': 'هاني',
  'hani': 'هاني',
  'haitham': 'هيثم',
  'islam': 'إسلام',
  'baha': 'بهاء',
  'eslam': 'إسلام',
  'ehab': 'إيهاب',
  'sabri': 'صبري',
  'sabry': 'صبري',
  'shady': 'شادي',
  'shadi': 'شادي',
  'shehab': 'شهاب',
  'taha': 'طه',
  'yahia': 'يحيى',
  'yahya': 'يحيى',
  'zaki': 'زكي',
  'zaky': 'زكي',
  'zakaria': 'زكريا',
  'zeyad': 'زياد',
  'ziad': 'زياد',
  'ziyad': 'زياد',
  'elzahed': 'الزاهد',
  'seif': 'سيف',
  'saif': 'سيف',
  'sayf': 'سيف',
  'ashraf': 'اشرف',
  'ashruf': 'اشرف',
  'bilal': 'بلال',
  'belal': 'بلال',
  'younes': 'يونس',
  'younis': 'يونس',
  'nermeen': 'نرمين',
  'nermin': 'نرمين',
  'nermine': 'نرمين',
  'morsi': 'مرسي',
  'morsy': 'مرسي',
  'mursi': 'مرسي',
  'tantawi': 'طنطاوي',
  'tantawy': 'طنطاوي',
  'shafik': 'شفيق',
  'shafiq': 'شفيق',
  'badr': 'بدر',
  'helmy': 'حلمي',
  'helmi': 'حلمي',
  'lotfy': 'لطفي',
  'lotfi': 'لطفي',
  'lutfi': 'لطفي',
  'gaber': 'جابر',
  'jabir': 'جابر',
  'rizk': 'رزق',
  'rizq': 'رزق',
  'eid': 'عيد',
  // Female
  'fatma': 'فاطمة',
  'fatima': 'فاطمة',
  'fatema': 'فاطمة',
  'aisha': 'عائشة',
  'aysha': 'عائشة',
  'aicha': 'عائشة',
  'mariam': 'مريم',
  'maryam': 'مريم',
  'sara': 'سارة',
  'sarah': 'سارة',
  'nour': 'نور',
  'noor': 'نور',
  'salma': 'سلمى',
  'yasmine': 'ياسمين',
  'yasmin': 'ياسمين',
  'jasmine': 'ياسمين',
  'layla': 'ليلى',
  'laila': 'ليلى',
  'leila': 'ليلى',
  'heba': 'هبة',
  'hiba': 'هبة',
  'dina': 'دينا',
  'hagar': 'هاجر',
  'hajar': 'هاجر',
  'rania': 'رانيا',
  'ranya': 'رانيا',
  'reem': 'ريم',
  'rim': 'ريم',
  'rana': 'رنا',
  'menna': 'منة',
  'mennah': 'منة',
  'mennat allah': 'منة الله',
  'menatallah': 'منةالله',
  'shahd': 'شهد',
  'shahed': 'شهد',
  'malak': 'ملك',
  'farah': 'فرح',
  'farida': 'فريدة',
  'fareeda': 'فريدة',
  'amira': 'أميرة',
  'ameera': 'أميرة',
  'asmaa': 'أسماء',
  'asma': 'أسماء',
  'eman': 'إيمان',
  'iman': 'إيمان',
  'ghada': 'غادة',
  'hala': 'هالة',
  'hanan': 'حنان',
  'hanaa': 'هناء',
  'huda': 'هدى',
  'hoda': 'هدى',
  'hadeer': 'هدير',
  'hadir': 'هدير',
  'jana': 'جنى',
  'lina': 'لينا',
  'lara': 'لارا',
  'maya': 'مايا',
  'mai': 'مي',
  'may': 'مي',
  'nada': 'ندى',
  'nadia': 'نادية',
  'nahla': 'نهلة',
  'naima': 'نعيمة',
  'nesma': 'نسمة',
  'nesreen': 'نسرين',
  'nesrin': 'نسرين',
  'nahed': 'ناهد',
  'nahid': 'ناهد',
  'rahma': 'رحمة',
  'rawan': 'روان',
  'rawda': 'روضة',
  'safaa': 'صفاء',
  'samar': 'سمر',
  'samia': 'سامية',
  'shaimaa': 'شيماء',
  'shaima': 'شيماء',
  'shereen': 'شيرين',
  'sherine': 'شيرين',
  'shirin': 'شيرين',
  'soha': 'سها',
  'somaya': 'سمية',
  'sumaya': 'سمية',
  'wafaa': 'وفاء',
  'walaa': 'ولاء',
  'yara': 'يارا',
  'youmna': 'يمنى',
  'zeina': 'زينة',
  'zina': 'زينة',
  'zainab': 'زينب',
  'zeinab': 'زينب',
  // Connector words
  'el': 'ال',
  'al': 'ال',
  'abd': 'عبد',
  'abdel': 'عبد',
  'abdul': 'عبد',
  'abu': 'أبو',
  'bin': 'بن',
  'ibn': 'ابن',
  'om': 'أم',
  'umm': 'أم',
};

// ── General vocabulary: colors, clothing, descriptors ────────────────────────
// These are common English words that appear in clothing/physical descriptions
// and should be TRANSLATED (not phonetically transliterated).

const VOCAB_DICT: Record<string, string> = {
  // ── Colors ──────────────────────────────────────────────────────────────
  'black': 'أسود',
  'white': 'أبيض',
  'red': 'أحمر',
  'blue': 'أزرق',
  'green': 'أخضر',
  'yellow': 'أصفر',
  'orange': 'برتقالي',
  'purple': 'بنفسجي',
  'violet': 'بنفسجي',
  'pink': 'وردي',
  'brown': 'بني',
  'gray': 'رمادي',
  'grey': 'رمادي',
  'navy': 'كحلي',
  'beige': 'بيج',
  'khaki': 'كاكي',
  'cream': 'كريمي',
  'gold': 'ذهبي',
  'silver': 'فضي',
  'dark': 'داكن',
  'light': 'فاتح',
  'bright': 'زاهي',
  'all': 'كامل',
  // ── Clothing items ────────────────────────────────────────────────────────
  'outfit': 'طقم',
  'clothing': 'ملابس',
  'clothes': 'ملابس',
  'shirt': 'قميص',
  't-shirt': 'تيشيرت',
  'tshirt': 'تيشيرت',
  'shirts': 'قمصان',
  'top': 'توب',
  'blouse': 'بلوزة',
  'pants': 'بنطلون',
  'trousers': 'بنطلون',
  'jeans': 'جينز',
  'shorts': 'شورت',
  'dress': 'فستان',
  'skirt': 'تنورة',
  'jacket': 'جاكيت',
  'coat': 'معطف',
  'hoodie': 'هودي',
  'sweater': 'سويتر',
  'pullover': 'بلوفر',
  'jumper': 'جمبر',
  'vest': 'صدرية',
  'suit': 'بدلة',
  'uniform': 'يونيفورم',
  'shoes': 'حذاء',
  'shoe': 'حذاء',
  'boots': 'بوط',
  'boot': 'بوط',
  'sneakers': 'حذاء رياضي',
  'sandals': 'صندل',
  'sandal': 'صندل',
  'slippers': 'شبشب',
  'scarf': 'وشاح',
  'hat': 'قبعة',
  'cap': 'كاب',
  'glasses': 'نظارة',
  'sunglasses': 'نظارة شمسية',
  'bag': 'شنطة',
  'backpack': 'شنطة ظهر',
  'hijab': 'حجاب',
  'headscarf': 'حجاب',
  'abaya': 'عباءة',
  'galabeya': 'جلابية',
  'galabiya': 'جلابية',
  'thobe': 'جلابية',
  'niqab': 'نقاب',
  'gloves': 'قفازات',
  'socks': 'شراب',
  'belt': 'حزام',
  'tie': 'كرافتة',
  'watch': 'ساعة',
  'bracelet': 'إسوارة',
  'necklace': 'قلادة',
  'ring': 'خاتم',
  // ── Descriptors & modifiers ───────────────────────────────────────────────
  'long': 'طويل',
  'short': 'قصير',
  'loose': 'فضفاض',
  'tight': 'ضيق',
  'slim': 'ضيق',
  'casual': 'كاجوال',
  'formal': 'رسمي',
  'plain': 'سادة',
  'solid': 'سادة',
  'striped': 'مخطط',
  'printed': 'مطبوع',
  'embroidered': 'مطرز',
  'torn': 'ممزق',
  'ripped': 'ممزق',
  'worn': 'متآكل',
  'new': 'جديد',
  'old': 'قديم',
  'clean': 'نظيف',
  'dirty': 'متسخ',
  'wet': 'مبلول',
  'patterned': 'مزخرف',
  'checkered': 'مربعات',
  'floral': 'زهري',
  'denim': 'جينز',
  'leather': 'جلد',
  'wool': 'صوف',
  'cotton': 'قطن',
  'linen': 'كتان',
  'silk': 'حرير',
  'velvet': 'مخمل',
  'oversized': 'واسع',
  'full': 'كامل',
  'half': 'نصف',
  'sleeveless': 'بدون أكمام',
  'hooded': 'بقلنسوة',
  'zippered': 'بسحاب',
  'buttoned': 'بأزرار',
  // ── Conjunctions / filler words used in clothing descriptions ─────────────
  'and': 'و',
  'with': 'مع',
  'wearing': 'يرتدي',
  'dressed': 'مرتدياً',
  'in': 'في',
  'a': '',
  'an': '',
  'the': 'ال',
  'has': 'لديه',
  'have': 'لديه',
};

// Multi-word clothing/descriptor phrases
const VOCAB_PHRASES: Record<string, string> = {
  'all black': 'أسود بالكامل',
  'all white': 'أبيض بالكامل',
  'all black outfit': 'طقم أسود كامل',
  'all white outfit': 'طقم أبيض كامل',
  'black outfit': 'طقم أسود',
  'white outfit': 'طقم أبيض',
  'black shirt': 'قميص أسود',
  'white shirt': 'قميص أبيض',
  'black pants': 'بنطلون أسود',
  'blue jeans': 'جينز أزرق',
  'black jeans': 'جينز أسود',
  'dark blue': 'أزرق داكن',
  'light blue': 'أزرق فاتح',
  'dark green': 'أخضر داكن',
  'light green': 'أخضر فاتح',
  'dark red': 'أحمر داكن',
  'light pink': 'وردي فاتح',
  'hot pink': 'وردي فوشيا',
  'navy blue': 'أزرق كحلي',
  'off white': 'أبيض مكسور',
  'dark gray': 'رمادي داكن',
  'light gray': 'رمادي فاتح',
  't shirt': 'تيشيرت',
  'blue t shirt': 'تيشيرت أزرق',
  'blue t-shirt': 'تيشيرت أزرق',
  'blue tshirt': 'تيشيرت أزرق',
  'sun glasses': 'نظارة شمسية',
  'running shoes': 'حذاء رياضي',
  'sports shoes': 'حذاء رياضي',
  'leather jacket': 'جاكيت جلد',
  'denim jacket': 'جاكيت جينز',
  'long sleeves': 'أكمام طويلة',
  'short sleeves': 'أكمام قصيرة',
  'long sleeve': 'كم طويل',
  'short sleeve': 'كم قصير',
  'head scarf': 'حجاب',
  'rain coat': 'معطف مطر',
  'track suit': 'بدلة رياضية',
  'tracksuit': 'بدلة رياضية',
  'sweat pants': 'بنطلون رياضي',
  'sweat shirt': 'سويتر',
};

// Combined dictionary for the lookup pass. Vocabulary (clothing/colors) is
// included first so generic words like "black" / "outfit" are translated
// correctly; city and place names then override any ambiguous tokens.
const FULL_DICT: Record<string, string> = {
  ...VOCAB_DICT,
  ...VOCAB_PHRASES,
  ...NAME_DICT,
  ...PLACE_DICT,
  ...CITY_DICT,
};

const MULTI_WORD_KEYS = Object.keys(FULL_DICT)
  .filter((k) => k.includes(' '))
  .sort((a, b) => b.length - a.length);

// ── Arabic → Latin (for displaying Arabic-entered names in English view) ─────

// Build a reverse lookup from NAME_DICT so e.g. "نرمين" → "Nermeen".
// Only the first English key seen for each Arabic value is kept; for names
// with multiple romanisations the one that sorts first alphabetically wins
// (e.g. "ahmed" beats "ahmad" — both are fine English spellings).
const REVERSE_NAME_DICT: Record<string, string> = (() => {
  const rev: Record<string, string> = {};
  for (const [en, ar] of Object.entries(NAME_DICT)) {
    if (!rev[ar]) rev[ar] = en[0].toUpperCase() + en.slice(1);
  }
  return rev;
})();

// Also build a reverse for place names so "الإسكندرية" → "Alexandria" etc.
const REVERSE_PLACE_DICT: Record<string, string> = (() => {
  const rev: Record<string, string> = {};
  for (const [en, ar] of Object.entries({ ...PLACE_DICT, ...CITY_DICT })) {
    if (!rev[ar]) {
      rev[ar] = en
        .split(' ')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ');
    }
  }
  return rev;
})();

const REVERSE_DICT: Record<string, string> = {
  ...REVERSE_PLACE_DICT,
  ...REVERSE_NAME_DICT,
};

// Ordered: longer digraph-producing entries first so "ش" → "sh" before any
// single letter that would consume only one character.
const ARABIC_TO_LATIN_LETTERS: [string, string][] = [
  ['ث', 'th'], ['ذ', 'th'], ['ش', 'sh'], ['خ', 'kh'], ['غ', 'gh'],
  ['آ', 'aa'],
  ['أ', 'a'], ['إ', 'i'], ['ا', 'a'],
  ['ب', 'b'], ['ت', 't'], ['ج', 'j'], ['ح', 'h'], ['د', 'd'],
  ['ر', 'r'], ['ز', 'z'], ['س', 's'], ['ص', 's'], ['ض', 'd'],
  ['ط', 't'], ['ظ', 'z'], ['ع', 'a'], ['ف', 'f'], ['ق', 'q'],
  ['ك', 'k'], ['ل', 'l'], ['م', 'm'], ['ن', 'n'], ['ه', 'h'],
  ['و', 'w'], ['ي', 'y'], ['ى', 'a'], ['ة', 'a'],
  ['ء', ''], ['ؤ', 'o'], ['ئ', 'e'], ['ـ', ''],
  ['،', ','], ['؛', ';'], ['؟', '?'],
];

const ARABIC_DIACRITICS_RE = /[\u064B-\u0652\u0670\u0640]/g;

const letterArabicToLatin = (word: string): string => {
  let out = word.replace(ARABIC_DIACRITICS_RE, '');
  for (const [ar, lat] of ARABIC_TO_LATIN_LETTERS) {
    out = out.split(ar).join(lat);
  }
  return out;
};

/** Convert an Arabic word to its best-available Latin representation. */
const deArabiciseWord = (word: string): string => {
  if (!word) return word;
  if (!containsArabic(word)) return word;
  if (REVERSE_DICT[word]) return REVERSE_DICT[word];
  const result = letterArabicToLatin(word);
  // Capitalise first letter of the result
  return result ? result[0].toUpperCase() + result.slice(1) : result;
};

/**
 * Convert Arabic text to Latin script, dictionary-first.
 * Used when the UI is in English mode but stored data is in Arabic.
 */
export const arabicToLatin = (text: string): string => {
  if (!text) return '';
  // Split on Arabic word boundaries (keeping spaces and punctuation)
  return text
    .split(/(\s+|[,،;؛?؟.!:]+)/)
    .map((segment) => (containsArabic(segment) ? deArabiciseWord(segment) : segment))
    .join('');
};

// ── Letter-based fallback (used only for unknown words) ──────────────────────

const LATIN_TO_ARABIC: [string, string][] = [
  ['sh', 'ش'], ['kh', 'خ'], ['gh', 'غ'], ['th', 'ث'],
  ['aa', 'ا'], ['ee', 'ي'], ['oo', 'و'], ['ph', 'ف'], ['ch', 'تش'],
  ['a', 'ا'], ['b', 'ب'], ['c', 'ك'], ['d', 'د'], ['e', 'ي'],
  ['f', 'ف'], ['g', 'ج'], ['h', 'ه'], ['i', 'ي'], ['j', 'ج'],
  ['k', 'ك'], ['l', 'ل'], ['m', 'م'], ['n', 'ن'], ['o', 'و'],
  ['p', 'ب'], ['q', 'ق'], ['r', 'ر'], ['s', 'س'], ['t', 'ت'],
  ['u', 'و'], ['v', 'ف'], ['w', 'و'], ['x', 'كس'], ['y', 'ي'],
  ['z', 'ز'],
];

const letterTransliterate = (word: string): string => {
  let out = word.toLowerCase();
  for (const [lat, ar] of LATIN_TO_ARABIC) {
    out = out.split(lat).join(ar);
  }
  return out;
};

const transliterateWord = (word: string): string => {
  if (!word) return word;
  if (containsArabic(word)) return word;
  const lc = word.toLowerCase();
  if (FULL_DICT[lc]) return FULL_DICT[lc];
  return letterTransliterate(word);
};

/** Convert an arbitrary Latin string to approximate Arabic, dictionary-first. */
export const latinToArabic = (text: string): string => {
  if (!text) return '';

  // Pass 1: replace multi-word phrases (longest first so "san stefano" wins
  // over "stefano" alone, and "sharm el sheikh" wins over "sharm").
  let work = text;
  for (const key of MULTI_WORD_KEYS) {
    const re = new RegExp(`\\b${escapeRegex(key)}\\b`, 'gi');
    work = work.replace(re, FULL_DICT[key]);
  }

  // Pass 2: split into Latin word tokens vs everything else and translate
  // each Latin word individually. Non-Latin characters (Arabic, digits,
  // spaces, punctuation) flow through untouched.
  return work
    .split(/([A-Za-z]+)/)
    .map((segment) =>
      /^[A-Za-z]+$/.test(segment) ? transliterateWord(segment) : segment,
    )
    .join('');
};

/**
 * Localise a **name** for the current UI language (bidirectional):
 *   - isRTL = true  → Latin  → Arabic  (e.g. "Ahmed"   → "أحمد")
 *   - isRTL = false → Arabic → Latin   (e.g. "نرمين"   → "Nermeen")
 * Text that already matches the target script is returned unchanged.
 * Falsy input returns an empty string.
 */
export const toArabicDisplay = (
  text: string | undefined | null,
  isRTL: boolean,
): string => {
  if (!text) return '';

  if (isRTL) {
    if (containsArabic(text) && !/[A-Za-z]/.test(text)) return text;
    return latinToArabic(text);
  } else {
    if (!containsArabic(text)) return text;
    return arabicToLatin(text);
  }
};

/**
 * Localise a **location / free-text** value (one-directional):
 *   - isRTL = true  → Latin → Arabic  (e.g. "San Stefano" → "سان ستيفانو")
 *   - isRTL = false → keep text exactly as stored (Arabic submitted locations
 *                     stay Arabic; English submitted locations stay English).
 * Falsy input returns an empty string.
 */
export const toRTLDisplay = (
  text: string | undefined | null,
  isRTL: boolean,
): string => {
  if (!text) return '';
  if (!isRTL) return text;
  if (containsArabic(text) && !/[A-Za-z]/.test(text)) return text;
  return latinToArabic(text);
};
