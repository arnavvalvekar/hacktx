// Carbon emission factors and calculation utilities

export interface CarbonFactor {
  category: string
  factor: number // kg CO2e per dollar
  confidence: 'high' | 'medium' | 'low'
  source: string
}

export interface UnitFactor {
  category: string
  unit: string
  factor: number // kg CO2e per unit
  confidence: 'high' | 'medium' | 'low'
  source: string
}

// Spend-based emission factors (kg CO2e per $1 spent)
export const SPEND_FACTORS: CarbonFactor[] = [
  { category: 'fuel', factor: 0.27, confidence: 'high', source: 'EPA' },
  { category: 'groceries', factor: 0.095, confidence: 'medium', source: 'EXIOBASE' },
  { category: 'travel', factor: 0.18, confidence: 'high', source: 'ICAO' },
  { category: 'retail', factor: 0.065, confidence: 'medium', source: 'EXIOBASE' },
  { category: 'food', factor: 0.17, confidence: 'medium', source: 'Lifecycle studies' },
  { category: 'utilities', factor: 0.12, confidence: 'high', source: 'EPA' },
  { category: 'transportation', factor: 0.15, confidence: 'medium', source: 'EPA' },
  { category: 'entertainment', factor: 0.035, confidence: 'low', source: 'Estimated' },
  { category: 'healthcare', factor: 0.045, confidence: 'low', source: 'Estimated' },
  { category: 'education', factor: 0.025, confidence: 'low', source: 'Estimated' }
]

// Unit-based emission factors
export const UNIT_FACTORS: UnitFactor[] = [
  { category: 'gasoline', unit: 'gallon', factor: 8.89, confidence: 'high', source: 'EPA' },
  { category: 'diesel', unit: 'gallon', factor: 10.16, confidence: 'high', source: 'EPA' },
  { category: 'electricity', unit: 'kWh', factor: 0.4, confidence: 'high', source: 'EPA' },
  { category: 'natural_gas', unit: 'therm', factor: 5.3, confidence: 'high', source: 'EPA' },
  { category: 'air_travel', unit: 'passenger-mile', factor: 0.255, confidence: 'high', source: 'ICAO' },
  { category: 'beef', unit: 'kg', factor: 27.0, confidence: 'high', source: 'Lifecycle studies' },
  { category: 'dairy', unit: 'kg', factor: 3.2, confidence: 'high', source: 'Lifecycle studies' },
  { category: 'poultry', unit: 'kg', factor: 6.9, confidence: 'high', source: 'Lifecycle studies' },
  { category: 'vegetables', unit: 'kg', factor: 2.0, confidence: 'medium', source: 'Lifecycle studies' }
]

// Merchant category mappings
export const MERCHANT_CATEGORIES: Record<string, string> = {
  // Gas stations
  'shell': 'fuel',
  'exxon': 'fuel',
  'chevron': 'fuel',
  'bp': 'fuel',
  'mobil': 'fuel',
  'speedway': 'fuel',
  'citgo': 'fuel',
  'valero': 'fuel',
  
  // Airlines
  'american airlines': 'travel',
  'delta': 'travel',
  'united': 'travel',
  'southwest': 'travel',
  'jetblue': 'travel',
  'alaska airlines': 'travel',
  'spirit': 'travel',
  'frontier': 'travel',
  
  // Grocery stores
  'whole foods': 'groceries',
  'kroger': 'groceries',
  'safeway': 'groceries',
  'publix': 'groceries',
  'wegmans': 'groceries',
  'trader joe': 'groceries',
  'costco': 'groceries',
  'walmart': 'retail',
  'target': 'retail',
  
  // Food & beverage
  'starbucks': 'food',
  'mcdonalds': 'food',
  'subway': 'food',
  'chipotle': 'food',
  'panera': 'food',
  'dunkin': 'food',
  
  // Retail
  'amazon': 'retail',
  'ebay': 'retail',
  'best buy': 'retail',
  'home depot': 'retail',
  'lowes': 'retail',
  'apple': 'retail',
  'nike': 'retail',
  'adidas': 'retail'
}

export function normalizeMerchantName(merchant: string): string {
  return merchant.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
}

export function categorizeMerchant(merchant: string): string {
  const normalized = normalizeMerchantName(merchant)
  
  // Direct match
  if (MERCHANT_CATEGORIES[normalized]) {
    return MERCHANT_CATEGORIES[normalized]
  }
  
  // Partial match
  for (const [key, category] of Object.entries(MERCHANT_CATEGORIES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return category
    }
  }
  
  // Default fallback
  return 'retail'
}

export function calculateSpendBasedEmissions(amount: number, category: string): {
  emissions: number
  confidence: 'high' | 'medium' | 'low'
  method: string
} {
  const factor = SPEND_FACTORS.find(f => f.category === category)
  
  if (!factor) {
    // Use average retail factor as fallback
    const fallbackFactor = SPEND_FACTORS.find(f => f.category === 'retail')!
    return {
      emissions: amount * fallbackFactor.factor,
      confidence: 'low',
      method: 'spend-based (fallback)'
    }
  }
  
  return {
    emissions: amount * factor.factor,
    confidence: factor.confidence,
    method: 'spend-based'
  }
}

export function calculateUnitBasedEmissions(amount: number, unit: string, category: string): {
  emissions: number
  confidence: 'high' | 'medium' | 'low'
  method: string
} {
  const factor = UNIT_FACTORS.find(f => f.category === category && f.unit === unit)
  
  if (!factor) {
    // Fallback to spend-based calculation
    return calculateSpendBasedEmissions(amount, category)
  }
  
  return {
    emissions: amount * factor.factor,
    confidence: factor.confidence,
    method: 'unit-based'
  }
}

export function calculateHybridEmissions(
  amount: number, 
  category: string, 
  unit?: string, 
  unitAmount?: number
): {
  emissions: number
  confidence: 'high' | 'medium' | 'low'
  method: string
} {
  // If we have unit information, prefer unit-based calculation
  if (unit && unitAmount) {
    const unitResult = calculateUnitBasedEmissions(unitAmount, unit, category)
    if (unitResult.confidence === 'high') {
      return unitResult
    }
  }
  
  // Otherwise, use spend-based calculation
  return calculateSpendBasedEmissions(amount, category)
}

export function getCarbonFootprintExplanation(
  merchant: string,
  amount: number,
  emissions: number,
  method: string,
  confidence: 'high' | 'medium' | 'low'
): string {
  const confidenceText = {
    high: 'high confidence',
    medium: 'medium confidence',
    low: 'low confidence'
  }[confidence]
  
  const methodText = {
    'unit-based': 'based on physical units (gallons, kWh, etc.)',
    'spend-based': 'based on spending amount and category averages',
    'hybrid': 'using a combination of unit and spend data'
  }[method] || 'using available data'
  
  return `Estimated ${emissions.toFixed(1)} kg CO₂e emissions from $${amount.toFixed(2)} spent at ${merchant} (${confidenceText}, ${methodText})`
}

