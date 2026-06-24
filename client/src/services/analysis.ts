import api from './api';
import type { AnalysisReport, AnalysisResult } from '../types';

export const analysisService = {
  async getAll(limit?: number, offset?: number) {
    const q = new URLSearchParams();
    if (limit) q.set('limit', String(limit));
    if (offset) q.set('offset', String(offset));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return api.get(`/analysis${qs}`);
  },

  async getById(id: string) {
    return api.get(`/analysis/${id}`);
  },

  async analyze(data: { medications: string[]; symptoms?: string; notes?: string; language: string }) {
    return api.post('/analysis/analyze', data);
  },

  async delete(id: string) {
    return api.delete(`/analysis/${id}`);
  },
};
