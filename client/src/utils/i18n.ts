import { translations, type TranslationKey } from '../constants/i18n/translations';

type Language = 'ar' | 'en';

const translationsMap = translations as Record<Language, Record<TranslationKey, string>>;

export const useTranslation = () => {
  const getDefaultLanguage = (): Language => {
    return 'ar';
  };

  const t = (key: TranslationKey, language: Language = getDefaultLanguage()): string => {
    return translationsMap[language]?.[key] || translationsMap['en']?.[key] || key;
  };

  return { t, getDefaultLanguage };
};
