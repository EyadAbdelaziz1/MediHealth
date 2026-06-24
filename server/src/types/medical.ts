export type RiskLevel = 'low' | 'moderate' | 'high';
export type SafetyCategory = 'safe' | 'monitor' | 'warning' | 'high_risk';
export type Language = 'ar' | 'en';

export interface MedicationInteraction {
  drug: string;
  severity: RiskLevel;
  description: string;
}

export interface SideEffect {
  symptom: string;
  likelihood: string;
  description: string;
}

export interface FoodInteraction {
  food: string;
  advice: string;
}

export interface AIAnalysisResult {
  score: number;
  riskLevel: RiskLevel;
  safetyCategory: SafetyCategory;
  interactions: MedicationInteraction[];
  sideEffects: SideEffect[];
  foodInteractions: FoodInteraction[];
  safetyConcerns: string[];
  recommendations: string[];
  disclaimer: string;
  verificationAvailable: boolean;
  verificationMessage?: string;
}

export interface MedicationInfo {
  medication: string;
  summary?: string;
  warnings?: string[];
  precautions?: string[];
  sources: string[];
  timestamp: number;
}

export interface MedicationWarnings {
  medication: string;
  warnings: unknown[];
  timestamp: number;
}

export interface InteractionPair {
  drug1: string;
  drug2: string;
  severity: RiskLevel;
  description: string;
}

export interface MedicationInteractionsResult {
  pairs: InteractionPair[];
  checkedAt: number;
  source: string;
}

export interface MedicalArticleSnippet {
  source: string;
  url: string;
  title: string;
  content: string;
}

export interface MedicalArticleResult {
  query: string;
  snippets: MedicalArticleSnippet[];
  timestamp: number;
}

export interface MedicalContext {
  context: string;
  verificationAvailable: boolean;
  sourcesUsed: string[];
}

export interface ExtractedMedication {
  name: string;
  dosage: string;
  activeIngredient: string;
  warnings?: string[];
}

export function scoreToCategory(score: number): SafetyCategory {
  if (score >= 80) return 'safe';
  if (score >= 60) return 'monitor';
  if (score >= 40) return 'warning';
  return 'high_risk';
}

export function categoryLabel(category: SafetyCategory, language: Language): string {
  const labels: Record<SafetyCategory, Record<Language, string>> = {
    safe: { ar: 'آمن', en: 'Safe' },
    monitor: { ar: 'مراقبة', en: 'Monitor' },
    warning: { ar: 'تحذير', en: 'Warning' },
    high_risk: { ar: 'خطر مرتفع', en: 'High Risk' },
  };
  return labels[category][language];
}
