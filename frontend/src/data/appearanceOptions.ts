export type LocalizedOption = {
  value: string;
  label: string;
};

type Language = 'en' | 'ar';

const hairColorOptionsByLanguage: Record<Language, LocalizedOption[]> = {
  en: [
    { value: 'Black', label: 'Black' },
    { value: 'Brown', label: 'Brown' },
    { value: 'Blonde', label: 'Blonde' },
    { value: 'Red', label: 'Red' },
    { value: 'Gray', label: 'Gray' },
    { value: 'White', label: 'White' },
  ],
  ar: [
    { value: 'Black', label: 'اسود' },
    { value: 'Brown', label: 'بني' },
    { value: 'Blonde', label: 'اشقر' },
    { value: 'Red', label: 'احمر' },
    { value: 'Gray', label: 'رمادي' },
    { value: 'White', label: 'ابيض' },
  ],
};

const eyeColorOptionsByLanguage: Record<Language, LocalizedOption[]> = {
  en: [
    { value: 'Brown', label: 'Brown' },
    { value: 'Blue', label: 'Blue' },
    { value: 'Green', label: 'Green' },
    { value: 'Hazel', label: 'Hazel' },
    { value: 'Gray', label: 'Gray' },
  ],
  ar: [
    { value: 'Brown', label: 'بني' },
    { value: 'Blue', label: 'ازرق' },
    { value: 'Green', label: 'اخضر' },
    { value: 'Hazel', label: 'عسلي' },
    { value: 'Gray', label: 'رمادي' },
  ],
};

export const getHairColorOptions = (language: Language): LocalizedOption[] => {
  return hairColorOptionsByLanguage[language];
};

export const getEyeColorOptions = (language: Language): LocalizedOption[] => {
  return eyeColorOptionsByLanguage[language];
};
