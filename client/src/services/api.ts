import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE =
  __DEV__
    ? Platform.OS === 'android'
      ? 'http://10.0.2.2:3000/api'
      : 'http://localhost:3000/api'
    : 'https://medihealth-api.railway.app/api';

class ApiClient {
  private token: string | null = null;

  async init() {
    this.token = await AsyncStorage.getItem('auth_token');
  }

  async setToken(token: string | null) {
    this.token = token;
    if (token) await AsyncStorage.setItem('auth_token', token);
    else await AsyncStorage.removeItem('auth_token');
  }

  async get(route: string) {
    const res = await fetch(`${API_BASE}${route}`, { headers: this.getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  async post(route: string, body: unknown) {
    const res = await fetch(`${API_BASE}${route}`, {
      method: 'POST',
      headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  async put(route: string, body: unknown) {
    const res = await fetch(`${API_BASE}${route}`, {
      method: 'PUT',
      headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  async patch(route: string, body: unknown) {
    const res = await fetch(`${API_BASE}${route}`, {
      method: 'PATCH',
      headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  async delete(route: string) {
    const res = await fetch(`${API_BASE}${route}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  private getHeaders() {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    return headers;
  }

  hasToken() {
    return !!this.token;
  }
}

export const api = new ApiClient();
export default api;
