import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en } from '../data/english';

type Language = 'en' | 'ar';

const translations: Record<Language, Record<string, string>> = {
  en: en.translations,
  ar: {},
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
  const [arabicTranslations, setArabicTranslations] = useState<Record<string, string> | null>(null);

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

  useEffect(() => {
    if (language !== 'ar' || arabicTranslations) {
      return;
    }

    void import('../data/arabic').then(({ ar }) => {
      setArabicTranslations(ar.translations);
    });
  }, [language, arabicTranslations]);

  const activeTranslations = useMemo(() => {
    if (language === 'ar') {
      return arabicTranslations ?? translations.en;
    }
    return translations.en;
  }, [language, arabicTranslations]);

  const t = (key: string): string => {
    return activeTranslations[key] || translations.en[key] || key;
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
