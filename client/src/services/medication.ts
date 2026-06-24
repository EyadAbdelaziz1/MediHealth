import api from './api';
import type { UserMedication } from '../types';

export const medicationService = {
  async getAll() {
    return api.get('/medications');
  },

  async getById(id: string) {
    return api.get(`/medications/${id}`);
  },

  async create(data: Partial<UserMedication>) {
    return api.post('/medications', data);
  },

  async update(id: string, data: Partial<UserMedication>) {
    return api.put(`/medications/${id}`, data);
  },

  async delete(id: string) {
    return api.delete(`/medications/${id}`);
  },
};
