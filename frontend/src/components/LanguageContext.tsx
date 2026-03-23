import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Language = 'en' | 'ar';

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.search': 'Search',
    'nav.createPost': 'Create Post',
    'nav.posterBuilder': 'Poster Builder',
    'nav.map': 'Map',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.notifications': 'Notifications',
    'nav.messages': 'Messages',
    'nav.navigationMenu': 'Navigation Menu',
    'nav.browseFeatures': 'Browse all features and pages',
    'nav.quickActions': 'Quick Actions',
    'nav.changeLanguage': 'Language',
    'nav.getStarted': 'Get Started',
    'nav.account': 'Account',
    'search.searchFormTitle': 'Search & Filter',
    'search.uploadImage': 'Upload Image for AI Recognition',
    'search.imageSearchDesc': 'Upload a photo to find potential matches using our facial recognition system.',
    'search.orUseFilters': 'OR USE FILTERS',
    'search.firstName': 'First Name',
    'search.firstNamePlaceholder': 'Enter first name',
    'search.lastName': 'Last Name',
    'search.lastNamePlaceholder': 'Enter last name',
    'search.ageMin': 'Minimum Age',
    'search.ageMinPlaceholder': 'Min age',
    'search.ageMax': 'Maximum Age',
    'search.ageMaxPlaceholder': 'Max age',
    'search.gender': 'Gender',
    'search.eyeColor': 'Eye Color',
    'search.hairColor': 'Hair Color',
    'search.dateMissing': 'Date Went Missing',
    'search.city': 'City',
    'search.location': 'Location details',
    'search.locationPlaceholder': 'Enter specific location...',
    'search.clothing': 'Clothing Description',
    'search.clothingPlaceholder': 'Describe what they were wearing...',
    'search.searchButton': 'Search',
    'search.tipLabel': 'Tip:',
    'search.tipText': 'All fields are optional. Use as many or as few criteria as you\'d like. Combining photo upload with filters will give you the most accurate results.',
  },
  ar: {
    'nav.search': 'بحث',
    'nav.createPost': 'إنشاء منشور',
    'nav.posterBuilder': 'مصمم الملصقات',
    'nav.map': 'الخريطة',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    'nav.profile': 'الملف الشخصي',
    'nav.logout': 'تسجيل الخروج',
    'nav.notifications': 'الإشعارات',
    'nav.messages': 'الرسائل',
    'nav.navigationMenu': 'قائمة التنقل',
    'nav.browseFeatures': 'تصفح جميع الميزات والصفحات',
    'nav.quickActions': 'إجراءات سريعة',
    'nav.changeLanguage': 'اللغة',
    'nav.getStarted': 'ابدأ الآن',
    'nav.account': 'الحساب',
    'search.searchFormTitle': 'بحث وتصفية',
    'search.uploadImage': 'رفع صورة للتعرف بالذكاء الاصطناعي',
    'search.imageSearchDesc': 'قم برفع صورة للعثور على تطابقات محتملة باستخدام نظام التعرف على الوجوه لدينا.',
    'search.orUseFilters': 'أو استخدم الفلاتر',
    'search.firstName': 'الاسم الأول',
    'search.firstNamePlaceholder': 'أدخل الاسم الأول',
    'search.lastName': 'اسم العائلة',
    'search.lastNamePlaceholder': 'أدخل اسم العائلة',
    'search.ageMin': 'الحد الأدنى للعمر',
    'search.ageMinPlaceholder': 'أقل عمر',
    'search.ageMax': 'الحد الأقصى للعمر',
    'search.ageMaxPlaceholder': 'أكبر عمر',
    'search.gender': 'الجنس',
    'search.eyeColor': 'لون العين',
    'search.hairColor': 'لون الشعر',
    'search.dateMissing': 'تاريخ الفقدان',
    'search.city': 'المدينة',
    'search.location': 'تفاصيل الموقع',
    'search.locationPlaceholder': 'أدخل موقعاً محدداً...',
    'search.clothing': 'وصف الملابس',
    'search.clothingPlaceholder': 'صف ما كانوا يرتدونه...',
    'search.searchButton': 'بحث',
    'search.tipLabel': 'تلميح:',
    'search.tipText': 'جميع الحقول اختيارية. استخدم أي عدد تريده من المعايير. إرفاق صورة مع الفلاتر سيعطي أدق النتائج.',
  },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return saved === 'ar' ? 'ar' : 'en';
  });

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'ar' : 'en';
      localStorage.setItem('language', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
