import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  fullName: string;
  preferredLanguage: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(
    email: string,
    password: string,
    fullName: string,
    preferredLanguage = 'ar'
  ): Promise<AuthResponse> {
    const data = await api.post('/auth/register', { email, password, fullName, preferredLanguage });
    await api.setToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await api.post('/auth/login', { email, password });
    await api.setToken(data.token);
    return data;
  },

  async logout() {
    await api.setToken(null);
  },

  async forgotPassword(email: string) {
    return api.post('/auth/forgot-password', { email });
  },

  async resetPassword(email: string, code: string, newPassword: string) {
    return api.post('/auth/reset-password', { email, code, newPassword });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return api.post('/auth/change-password', { currentPassword, newPassword });
  },

  isLoggedIn() {
    return api.hasToken();
  },
};
