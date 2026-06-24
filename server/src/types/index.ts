export interface User {
  id: string;
  email: string;
  fullName: string;
  preferredLanguage: string;
  createdAt: Date;
}

export interface UserMedication {
  id: string;
  userId: string;
  name: string;
  dosage?: string;
  activeIngredient?: string;
  form?: string;
  instructions?: string;
  prescribedBy?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  userId: string;
  medicationId: string;
  time: string;
  frequency: string;
  daysOfWeek?: number[];
  isActive: boolean;
}

export interface AnalysisReport {
  id: string;
  userId: string;
  medicationId?: string;
  medications: Record<string, unknown>;
  symptoms?: string;
  notes?: string;
  results: Record<string, unknown>;
  riskLevel: string;
  safetyScore: number;
  createdAt: Date;
}

export interface ScanHistory {
  id: string;
  userId: string;
  detectedMedications: unknown[];
  analysisResults?: Record<string, unknown>;
  createdAt: Date;
}

export interface AIRequest {
  medications: string[];
  symptoms?: string;
  notes?: string;
  language: 'ar' | 'en';
  verifiedInfo?: Record<string, unknown>;
}

export interface AIResponse {
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

export interface AuthRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    preferredLanguage: string;
  };
  token: string;
}
