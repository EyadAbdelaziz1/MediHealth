import api from './api';
import type { Reminder } from '../types';

export const reminderService = {
  async getAll() {
    return api.get('/reminders');
  },

  async getByMedication(medicationId: string) {
    return api.get(`/reminders/medication/${medicationId}`);
  },

  async create(data: { medicationId: string; time: string; frequency: string; daysOfWeek?: number[] }) {
    return api.post('/reminders', data);
  },

  async update(id: string, data: Partial<Reminder>) {
    return api.patch(`/reminders/${id}`, data);
  },

  async delete(id: string) {
    return api.delete(`/reminders/${id}`);
  },

  async complete(id: string, status: string = 'taken') {
    return api.post(`/reminders/${id}/complete`, { status });
  },
};
