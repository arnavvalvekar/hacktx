export interface Transaction {
  id: string
  merchant: string
  amount: number
  category: string
  date: Date
  carbonEmissions: number
  confidence: 'high' | 'medium' | 'low'
  method: 'unit-based' | 'spend-based' | 'hybrid'
  location?: string
  verified: boolean
  submittedBy?: string
  notes?: string
}

export interface CarbonData {
  totalEmissions: number
  dailyAverage: number
  monthlyProjection: number
  categoryBreakdown: Record<string, number>
  trends: {
    weekly: number[]
    monthly: number[]
  }
  verifiedTransactions: number
  totalTransactions: number
  dataQuality: 'high' | 'medium' | 'low'
  lastUpdated: Date
}

export interface CarbonFactor {
  category: string
  factor: number // kg CO2e per dollar
  confidence: 'high' | 'medium' | 'low'
  source: string
}

export interface MerchantMapping {
  merchant: string
  category: string
  confidence: number
}
