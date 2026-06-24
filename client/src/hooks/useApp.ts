import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Language } from '../types';

export const STORAGE_KEYS = {
  LANGUAGE: 'medihealth_language',
  ONBOARDING: 'medihealth_onboarding_seen',
  AUTH_TOKEN: 'auth_token',
  USER: 'medihealth_user',
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('ar');

  const setAppLanguage = useCallback(async (lang: Language) => {
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    setLanguage(lang);
  }, []);

  const toggleLanguage = useCallback(async () => {
    const next = language === 'ar' ? 'en' : 'ar';
    await setAppLanguage(next);
    return next;
  }, [language, setAppLanguage]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE).then((saved) => {
      if (saved === 'en' || saved === 'ar') setLanguage(saved);
    });
  }, []);

  return { language, setAppLanguage, toggleLanguage };
};

export const useOnboarding = () => {
  const [seen, setSeen] = useState(false);

  const markAsSeen = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
    setSeen(true);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING).then((saved) => {
      setSeen(saved === 'true');
    });
  }, []);

  return { seen, markAsSeen };
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; fullName: string; preferredLanguage: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const setAuthData = useCallback(async (userData: typeof user & { token: string }) => {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, userData.token],
      [STORAGE_KEYS.USER, JSON.stringify(userData)],
    ]);
    setUser({ id: userData.id, email: userData.email, fullName: userData.fullName, preferredLanguage: userData.preferredLanguage });
    setIsAuthenticated(true);
  }, []);

  const clearAuth = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER]);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } catch { /* ignore */ }
      }
      setLoading(false);
    };
    bootstrap();
  }, []);

  return { isAuthenticated, user, loading, setAuthData, clearAuth };
};
