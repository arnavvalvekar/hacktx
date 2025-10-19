// Type declarations for mock CO₂ data
export interface MockTransaction {
  id: string;
  date: string;
  merchant: string;
  mcc: string;
  amount: number;
  category: string;
  co2e_kg: number;
  method: string;
  confidence: string;
}

export interface MockDashboardSummary {
  today_kg: number;
  mtd_kg: number;
  eco_score: number;
  eco_details: {
    intensity: number;
    improvement: number;
    mix: number;
    streak: number;
  };
  tx_count: number;
}

export interface MockTrendData {
  date: string;
  value: number;
}

export interface MockCategoryBreakdown {
  category: string;
  value: number;
  pct: number;
}
