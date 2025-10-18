import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatCarbon(kg: number): string {
  if (kg < 1) {
    return `${(kg * 1000).toFixed(0)}g CO₂e`
  }
  return `${kg.toFixed(1)}kg CO₂e`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return formatDate(d)
}

export function calculateEcoScore(totalEmissions: number, period: 'week' | 'month' = 'week'): {
  score: number
  grade: string
  color: string
} {
  // Benchmark: 20kg CO2e per week is considered good
  const benchmark = period === 'week' ? 20 : 80
  const ratio = totalEmissions / benchmark
  
  let score: number
  let grade: string
  let color: string
  
  if (ratio <= 0.5) {
    score = 95
    grade = 'A+'
    color = 'text-eco-500'
  } else if (ratio <= 0.75) {
    score = 85
    grade = 'A'
    color = 'text-eco-500'
  } else if (ratio <= 1.0) {
    score = 75
    grade = 'B'
    color = 'text-yellow-500'
  } else if (ratio <= 1.5) {
    score = 60
    grade = 'C'
    color = 'text-orange-500'
  } else if (ratio <= 2.0) {
    score = 40
    grade = 'D'
    color = 'text-red-500'
  } else {
    score = 20
    grade = 'F'
    color = 'text-red-600'
  }
  
  return { score, grade, color }
}

export function generateInsight(emissions: number, category: string): string {
  const insights = {
    high: [
      `Consider reducing ${category} spending by 20% to save ~${(emissions * 0.2).toFixed(1)}kg CO₂e per week`,
      `Switch to more sustainable ${category} options to cut emissions by up to 30%`,
      `Your ${category} emissions are above average. Try local alternatives!`
    ],
    medium: [
      `Your ${category} footprint is moderate. Small changes could make a big difference`,
      `Consider bulk buying for ${category} to reduce packaging emissions`,
      `Look for eco-friendly ${category} brands to lower your impact`
    ],
    low: [
      `Great job! Your ${category} emissions are well below average`,
      `Keep up the sustainable ${category} choices!`,
      `Your ${category} footprint is excellent - consider sharing your tips!`
    ]
  }
  
  const level = emissions > 10 ? 'high' : emissions > 5 ? 'medium' : 'low'
  const categoryInsights = insights[level]
  return categoryInsights[Math.floor(Math.random() * categoryInsights.length)]
}

