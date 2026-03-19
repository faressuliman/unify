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
