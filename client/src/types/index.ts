import type { TranslationKey } from '../constants/i18n/translations';

export type Language = 'ar' | 'en';

export interface RootStackParamList {
  splash: undefined;
  onboarding: undefined;
  login: undefined;
  register: undefined;
  forgotPassword: undefined;
  main: undefined;
  dashboard: undefined;
  scanner: undefined;
  analysisResults: { medications: string[]; symptoms?: string; notes?: string };
  medicationLibrary: undefined;
  medicationDetails: { id: string };
  addMedication: undefined;
  analyzeMedications: undefined;
  reminders: undefined;
  addReminder: { medicationId?: string };
  analysisHistory: undefined;
  reportDetails: { id: string };
  profile: undefined;
  settings: undefined;
  changePassword: undefined;
}

export interface UserMedication {
  id: string;
  name: string;
  dosage?: string;
  activeIngredient?: string;
  form?: string;
  instructions?: string;
  prescribedBy?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  reminders?: Reminder[];
  reports?: AnalysisReport[];
}

export interface Reminder {
  id: string;
  time: string;
  frequency: string;
  daysOfWeek?: number[];
  isActive: boolean;
  medication?: { id: string; name: string; dosage?: string };
  completions?: ReminderCompletion[];
}

export interface ReminderCompletion {
  id: string;
  completedAt: string;
  status: string;
}

export interface AnalysisReport {
  id: string;
  medications: string[];
  symptoms?: string;
  notes?: string;
  results: AnalysisResult;
  riskLevel: 'low' | 'moderate' | 'high';
  safetyScore: number;
  language: string;
  createdAt: string;
}

export interface AnalysisResult {
  score: number;
  riskLevel: 'low' | 'moderate' | 'high';
  interactions: {
    drug: string;
    severity: string;
    description: string;
  }[];
  sideEffects: {
    symptom: string;
    likelihood: string;
    description: string;
  }[];
  foodInteractions: {
    food: string;
    advice: string;
  }[];
  safetyConcerns: string[];
  recommendations: string[];
  disclaimer: string;
}

export interface ScanHistory {
  id: string;
  imageUrl?: string;
  detectedMedications: { name: string; dosage: string; activeIngredient: string }[];
  analysisResults?: AnalysisResult;
  createdAt: string;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
  bgGradient: [string, string];
}
