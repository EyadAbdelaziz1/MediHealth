import api from './api';

export const scanService = {
  async extract(imageData: string) {
    return api.post('/scan/extract', { imageData });
  },

  async analyze(data: { imageData?: string; medications?: string[]; symptoms?: string; notes?: string; language?: string }) {
    return api.post('/scan/analyze', data);
  },

  async getHistory(limit?: number) {
    const q = limit ? `?limit=${limit}` : '';
    return api.get(`/scan${q}`);
  },
};
