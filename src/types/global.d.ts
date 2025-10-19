// Global type declarations for JavaScript modules

declare module '@/config/app' {
  export const MOCK_MODE: boolean;
}

declare module '@/services/mockData' {
  import type { MockTransaction, MockDashboardSummary, MockTrendData, MockCategoryBreakdown } from './mockTypes';
  
  export function getTransactions(): Promise<MockTransaction[]>;
  export function getDashboardSummary(): Promise<MockDashboardSummary>;
  export function getTrends(): Promise<MockTrendData[]>;
  export function getCategoryBreakdown(): Promise<MockCategoryBreakdown[]>;
}
