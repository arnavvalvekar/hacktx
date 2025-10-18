// Carbon emission factors and calculation utilities
// Note: These are illustrative factors for demo purposes

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

// Unit-based emission factors (kg CO2e per unit)
export const unitFactors: Record<string, number> = {
  // Fuel
  'gasoline_gallon': 8.89,      // EPA 2023
  'diesel_gallon': 10.16,       // EPA 2023
  'electricity_kwh': 0.4,       // US average grid intensity
  'natural_gas_therm': 5.3,     // EPA 2023
  
  // Transportation
  'flight_passenger_mile': 0.255, // ICAO 2023
  'ridehailing_mile': 0.4,      // Estimated
  
  // Food (per kg)
  'beef_kg': 27.0,              // Lifecycle studies
  'dairy_kg': 3.2,              // Lifecycle studies
  'poultry_kg': 6.9,            // Lifecycle studies
  'vegetables_kg': 2.0,         // Lifecycle studies
  'grains_kg': 1.4,             // Lifecycle studies
}

// Spend-based emission factors (kg CO2e per $1 spent)
export const spendFactors: Record<string, number> = {
  'fuel': 0.27,           // High confidence - direct fuel purchases
  'groceries': 0.095,     // Medium confidence - EXIOBASE derived
  'dining': 0.17,         // Medium confidence - food service
  'travel': 0.18,         // High confidence - transportation
  'retail': 0.065,        // Medium confidence - general retail
  'utilities': 0.12,      // High confidence - energy consumption
  'electronics': 0.07,    // Medium confidence - manufacturing
  'clothing': 0.05,       // Medium confidence - textile industry
  'entertainment': 0.035, // Low confidence - estimated
  'healthcare': 0.045,    // Low confidence - estimated
  'education': 0.025,     // Low confidence - estimated
}

// Merchant category mappings for automatic categorization
export const merchantCategories: Record<string, string> = {
  // Gas stations
  'shell': 'fuel',
  'exxon': 'fuel',
  'chevron': 'fuel',
  'bp': 'fuel',
  'mobil': 'fuel',
  'speedway': 'fuel',
  'citgo': 'fuel',
  'valero': 'fuel',
  'gas': 'fuel',
  'fuel': 'fuel',
  
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
  'starbucks': 'dining',
  'mcdonalds': 'dining',
  'subway': 'dining',
  'chipotle': 'dining',
  'panera': 'dining',
  'dunkin': 'dining',
  
  // Retail
  'amazon': 'retail',
  'ebay': 'retail',
  'best buy': 'electronics',
  'apple': 'electronics',
  'nike': 'clothing',
  'adidas': 'clothing',
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
  for (const [key, category] of Object.entries(merchantCategories)) {
    if (normalized.includes(key)) {
      return category
    }
  }
  
  // Default fallback
  return 'retail'
}

export function calculateUnitBasedEmissions(
  amount: number, 
  unit: string, 
  category: string
): {
  emissions: number
  confidence: 'high' | 'medium' | 'low'
  method: string
  notes: string[]
} {
  const factor = unitFactors[unit]
  
  if (!factor) {
    // Fallback to spend-based calculation
    return calculateSpendBasedEmissions(amount, category)
  }
  
  return {
    emissions: amount * factor,
    confidence: 'high',
    method: 'unit',
    notes: [`Unit factor applied: ${unit} = ${factor} kg CO₂e per unit`]
  }
}

export function calculateSpendBasedEmissions(
  amount: number, 
  category: string
): {
  emissions: number
  confidence: 'high' | 'medium' | 'low'
  method: string
  notes: string[]
} {
  const factor = spendFactors[category]
  
  if (!factor) {
    // Use average retail factor as fallback
    const fallbackFactor = spendFactors['retail']
    return {
      emissions: amount * fallbackFactor,
      confidence: 'low',
      method: 'spend',
      notes: [`Fallback factor applied: retail = ${fallbackFactor} kg CO₂e per $`]
    }
  }
  
  const confidence = factor > 0.15 ? 'high' : factor > 0.08 ? 'medium' : 'low'
  
  return {
    emissions: amount * factor,
    confidence,
    method: 'spend',
    notes: [`Spend factor applied: ${category} = ${factor} kg CO₂e per $`]
  }
}

export function calculateHybridEmissions(
  amount: number,
  merchant: string,
  meta?: {
    units?: number
    unitType?: string
    distanceKm?: number
  },
  country: string = 'US'
): {
  emissions: number
  confidence: 'high' | 'medium' | 'low'
  method: 'unit' | 'specialized' | 'spend'
  category: string
  notes: string[]
} {
  const category = categorizeMerchant(merchant)
  const notes: string[] = []
  
  // 1. Unit-based calculation (highest priority)
  if (meta?.units && meta?.unitType) {
    const unitKey = `${meta.unitType}_${meta.unitType.includes('gallon') ? 'gallon' : 
                      meta.unitType.includes('kwh') ? 'kwh' : 
                      meta.unitType.includes('mile') ? 'mile' : 'kg'}`
    
    const unitResult = calculateUnitBasedEmissions(meta.units, unitKey, category)
    if (unitResult.confidence === 'high') {
      return {
        ...unitResult,
        category,
        notes: [...notes, ...unitResult.notes]
      }
    }
  }
  
  // 2. Specialized logic for known merchants
  if (isSpecializedMerchant(merchant)) {
    const specializedResult = calculateSpecializedEmissions(amount, merchant, meta)
    return {
      ...specializedResult,
      category,
      notes: [...notes, ...specializedResult.notes]
    }
  }
  
  // 3. Spend-based calculation (fallback)
  const spendResult = calculateSpendBasedEmissions(amount, category)
  return {
    ...spendResult,
    category,
    notes: [...notes, ...spendResult.notes]
  }
}

function isSpecializedMerchant(merchant: string): boolean {
  const specializedMerchants = [
    'shell', 'exxon', 'chevron', 'bp', 'mobil',
    'american airlines', 'delta', 'united', 'southwest',
    'uber', 'lyft', 'whole foods', 'starbucks'
  ]
  
  const normalized = normalizeMerchantName(merchant)
  return specializedMerchants.some(sm => normalized.includes(sm))
}

function calculateSpecializedEmissions(
  amount: number,
  merchant: string,
  meta?: any
): {
  emissions: number
  confidence: 'high' | 'medium' | 'low'
  method: 'specialized'
  notes: string[]
} {
  const normalized = normalizeMerchantName(merchant)
  const notes: string[] = []
  
  // Gas station logic
  if (normalized.includes('shell') || normalized.includes('exxon') || 
      normalized.includes('chevron') || normalized.includes('gas')) {
    // Estimate gallons based on amount (assuming $3.50/gallon average)
    const estimatedGallons = amount / 3.5
    const emissions = estimatedGallons * unitFactors['gasoline_gallon']
    
    return {
      emissions,
      confidence: 'medium',
      method: 'specialized',
      notes: [`Estimated ${estimatedGallons.toFixed(1)} gallons from $${amount.toFixed(2)}`]
    }
  }
  
  // Airline logic
  if (normalized.includes('airlines') || normalized.includes('southwest') || 
      normalized.includes('delta') || normalized.includes('united')) {
    // Estimate passenger-miles based on amount (assuming $0.15/mile average)
    const estimatedMiles = amount / 0.15
    const emissions = estimatedMiles * unitFactors['flight_passenger_mile']
    
    return {
      emissions,
      confidence: 'medium',
      method: 'specialized',
      notes: [`Estimated ${estimatedMiles.toFixed(0)} passenger-miles from $${amount.toFixed(2)}`]
    }
  }
  
  // Default specialized fallback
  return {
    emissions: amount * 0.1, // Conservative estimate
    confidence: 'low',
    method: 'specialized',
    notes: ['Specialized logic applied with conservative estimate']
  }
}

