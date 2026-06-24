import { Client, Databases, Users, ID, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

export const databases = new Databases(client);
export const users = new Users(client);
export { client, ID, Query };

export const DB_ID = process.env.APPWRITE_DATABASE_ID || '';

export const COLLECTIONS = {
  USER_PROFILES: 'user_profiles',
  MEDICATIONS: 'medications',
  USER_MEDICATIONS: 'user_medications',
  REMINDERS: 'reminders',
  REMINDER_COMPLETIONS: 'reminder_completions',
  ANALYSIS_REPORTS: 'analysis_reports',
  SCAN_HISTORIES: 'scan_histories',
  PASSWORD_RESETS: 'password_resets',
} as const;
