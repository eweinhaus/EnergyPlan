// Form Data Types
export interface CurrentPlanData {
  supplier: string;
  rate: number; // cents per kWh
  contractEndDate?: string;
  contractLength?: number; // months
}

export interface UserPreferences {
  costPriority: number; // 0-100
  renewablePriority: number; // 0-100, must sum to 100 with costPriority
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
}

export interface Plan {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  rate: number; // cents per kWh
  renewablePercentage: number; // 0-100
  fees: {
    delivery: number;
    admin: number;
  };
}

export interface PlanWithCosts extends Plan {
  annualCost: number;
  savings: number;
  score: number;
}

// Recommendation Types
export interface Recommendation {
  plan: PlanWithCosts;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ProcessingResult {
  success: boolean;
  recommendations?: Recommendation[];
  error?: string;
  dataQuality?: ParsedUsageData['dataQuality'];
}

