import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { authService, type User } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, lang?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
    } catch {
      setUser(null);
      await api.setToken(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await api.init();
      const stored = await AsyncStorage.getItem('user');
      if (api.hasToken() && stored) {
        setUser(JSON.parse(stored));
        await refreshUser();
      }
      setIsLoading(false);
    })();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
  };

  const register = async (email: string, password: string, fullName: string, lang = 'ar') => {
    const data = await api.post('/auth/register', {
      email,
      password,
      fullName,
      preferredLanguage: lang,
    });
    await api.setToken(data.token);
    setUser(data.user);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('onboarding_complete');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
