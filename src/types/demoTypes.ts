// Type declarations for demo CO₂ data
export interface DemoTransaction {
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

export interface DemoDashboardSummary {
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

export interface DemoTrendData {
  date: string;
  value: number;
}

export interface DemoCategoryBreakdown {
  category: string;
  value: number;
  pct: number;
}
