// Form Data Types
export interface CurrentPlanData {
  supplier: string;
  rate: number; // cents per kWh
  contractEndDate?: string;
  contractLength?: number; // months
  earlyTerminationFee?: number; // Early termination fee in dollars ($0-$2000)
}

export interface UserPreferences {
  costPriority: number; // 0-100
  renewablePriority: number; // 0-100, must sum to 100 with costPriority

  // New preference criteria
  supplierDiversity?: 'prefer-variety' | 'prefer-best' | 'no-preference'; // NEW
  priceStability?: 'fixed-only' | 'variable-ok' | 'no-preference'; // NEW
  planComplexity?: 'simple-only' | 'complex-ok' | 'no-preference'; // NEW
  supplierReputation?: 'high-only' | 'any-ok' | 'no-preference'; // NEW
}

export interface EnergyPlanFormData {
  currentPlan: CurrentPlanData;
  xmlFile?: File;
  preferences: UserPreferences;
}

// Usage Data Types
export interface MonthlyUsage {
  month: string; // '2024-01'
  totalKwh: number;
  daysWithData: number;
  averageDaily: number;
}

export interface ParsedUsageData {
  monthlyTotals: MonthlyUsage[];
  dataQuality: 'good' | 'fair' | 'poor';
  dateRange: {
    start: string;
    end: string;
  };
}

// Supplier & Plan Types
export interface Supplier {
  id: string;
  name: string;
  rating: number; // 1-5
  signupUrl?: string; // URL for enrolling with this supplier
}

// Signup URL mapping for Texas energy suppliers
export const SUPPLIER_SIGNUP_URLS: Record<string, string> = {
  'Reliant Energy': 'https://www.powertochoose.org/',
  'TXU Energy': 'https://www.powertochoose.org/',
  'Direct Energy': 'https://www.powertochoose.org/',
  'Green Mountain Energy': 'https://www.powertochoose.org/',
  'Cirro Energy': 'https://www.powertochoose.org/',
  'Champion Energy': 'https://www.powertochoose.org/',
  'Gexa Energy': 'https://www.powertochoose.org/',
  'Just Energy': 'https://www.powertochoose.org/',
  // Default fallback for any supplier not listed
  'default': 'https://www.powertochoose.org/'
};

export interface Plan {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  rate: number; // cents per kWh (for fixed-rate plans)
  renewablePercentage: number; // 0-100
  fees: {
    delivery: number;
    admin: number;
  };
  rateStructure?: RateStructure; // Advanced rate structure (optional for backward compatibility)
}

export type RateStructure = {
  type: 'fixed' | 'tiered' | 'tou' | 'variable' | 'seasonal';
  fixed?: {
    ratePerKwh: number; // cents
  };
  tiered?: {
    tiers: Array<{
      minKwh: number;
      maxKwh: number;
      ratePerKwh: number; // cents
    }>;
  };
  tou?: {
    peakHours: { start: string; end: string; ratePerKwh: number }; // "16:00-21:00"
    offPeakRatePerKwh: number;
    superOffPeakRatePerKwh?: number; // overnight
  };
  variable?: {
    baseRatePerKwh: number;
    marketAdjustment: 'ercot' | 'custom';
    caps: { min: number; max: number }; // rate caps/floors in cents
    seasonalMultipliers?: {
      summer: number; // June-September multiplier
      winter: number; // October-May multiplier
    };
  };
  seasonal?: {
    winterRatePerKwh: number;
    summerRatePerKwh: number;
    seasonalMonths: {
      winter: number[]; // month numbers (0-11)
      summer: number[]; // month numbers (0-11)
    };
  };
};

export interface PlanWithCosts extends Plan {
  annualCost: number;
  savings: number;
  score: number;
}

// Contract and Scenario Types
export interface ContractTerms {
  earlyTerminationFee: number; // In dollars
  contractEndDate?: string; // MM/YYYY format
}

export interface CostScenario {
  type: 'stay-current' | 'switch-now' | 'wait-and-switch';
  annualCost: number; // Expected annual cost in dollars
  netSavings: number; // Compared to stay-current baseline (can be negative)
  description: string; // Human-readable description
}

export interface PlanWithScenarios extends PlanWithCosts {
  scenarios: CostScenario[];
  recommendedScenario?: CostScenario; // The scenario with lowest annual cost
}

// Recommendation Types
export interface Recommendation {
  plan: PlanWithScenarios;
  explanation: string;
}

export interface ProcessingResult {
  success: boolean;
  recommendations?: Recommendation[];
  error?: string;
  dataQuality?: ParsedUsageData['dataQuality'];
}

// Firebase & User Account Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastLoginAt: Date;
  gdprConsent: GDPRConsent;
}

export interface SavedRecommendation {
  id: string;
  userId: string;
  formData: EnergyPlanFormData;
  recommendations: Recommendation[];
  createdAt: Date;
  pdfUrl?: string;
}

export interface UsageDataRecord {
  id: string;
  userId: string;
  parsedData: ParsedUsageData;
  originalXmlHash: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: 'data_export' | 'data_deletion' | 'consent_change' | 'recommendation_saved';
  timestamp: Date;
  details: any;
  ipAddress?: string;
}

// GDPR Compliance Types
export interface GDPRConsent {
  analytics: boolean;
  marketing: boolean;
  dataProcessing: boolean; // Required for core functionality
  dataStorage: boolean;
  lastUpdated: Date;
  version: string;
}

export interface DataExportResult {
  data: any;
  exportedAt: string;
  format: 'json' | 'pdf';
  includesPersonalData: boolean;
}

export interface DataDeletionResult {
  deletedCollections: string[];
  deletedAt: string;
  userId: string;
}

// Advanced Rate Structure Types
export interface TieredRate {
  tiers: Array<{
    minKwh: number;
    maxKwh: number;
    ratePerKwh: number; // cents
  }>;
}

export interface TOURate {
  peakHours: { start: string; end: string; rate: number }; // "16:00-21:00"
  offPeakRate: number;
  superOffPeakRate: number; // overnight
}

export interface VariableRate {
  baseRate: number;
  marketAdjustment: 'ercot' | 'custom';
  caps: { min: number; max: number };
  seasonalMultipliers?: {
    summer: number; // June-September
    winter: number; // October-May
  };
}

export interface SeasonalRate {
  winterRate: number;
  summerRate: number;
  seasonalMonths: {
    winter: number[]; // month numbers (0-11)
    summer: number[]; // month numbers (0-11)
  };
}

// PDF Export Types
export interface PDFOptions {
  includeCharts: boolean;
  includeBranding: boolean;
  format: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

export interface PDFGenerationResult {
  success: boolean;
  url?: string;
  error?: string;
  generationTime: number;
}

