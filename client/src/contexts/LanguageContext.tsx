import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, type TranslationKey } from '../constants/i18n/translations';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  t: (key: TranslationKey) => string;
  setLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuth();
  const [language, setLang] = useState<Language>('ar');

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('language');
      const lang = (user?.preferredLanguage as Language) || (stored as Language) || 'ar';
      setLang(lang);
      applyRTL(lang);
    })();
  }, [user?.preferredLanguage]);

  const applyRTL = (lang: Language) => {
    const rtl = lang === 'ar';
    if (I18nManager.isRTL !== rtl) {
      I18nManager.allowRTL(rtl);
      I18nManager.forceRTL(rtl);
    }
  };

  const setLanguage = useCallback(
    async (lang: Language) => {
      setLang(lang);
      await AsyncStorage.setItem('language', lang);
      applyRTL(lang);
      if (user) {
        try {
          const data = await api.patch('/profile', { preferredLanguage: lang });
          setUser(data.user);
        } catch {
          // ignore
        }
      }
    },
    [user, setUser]
  );

  const t = useCallback(
    (key: TranslationKey) => translations[language][key] || translations.en[key] || key,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, isRTL: language === 'ar', t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
