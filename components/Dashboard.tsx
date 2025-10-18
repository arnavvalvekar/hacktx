'use client'

import { Leaf, TrendingUp, Calendar, Zap } from 'lucide-react'
import { CarbonData, Transaction } from '@/types'

interface DashboardProps {
  carbonData: CarbonData | null
  transactions: Transaction[]
}

export default function Dashboard({ carbonData, transactions }: DashboardProps) {
  if (!carbonData) {
    return <div className="text-center py-8">Loading carbon data...</div>
  }

  const recentTransactions = transactions.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-carbon-900 mb-2">
          Carbon Footprint Dashboard
        </h1>
        <p className="text-carbon-600">
          Track your environmental impact through financial transactions
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-carbon-600">Total Emissions</p>
              <p className="text-2xl font-bold text-carbon-900">
                {carbonData.totalEmissions.toFixed(1)} kg CO₂e
              </p>
            </div>
            <Leaf className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-carbon-600">Daily Average</p>
              <p className="text-2xl font-bold text-carbon-900">
                {carbonData.dailyAverage.toFixed(1)} kg CO₂e
              </p>
            </div>
            <Calendar className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-carbon-600">Monthly Projection</p>
              <p className="text-2xl font-bold text-carbon-900">
                {carbonData.monthlyProjection.toFixed(0)} kg CO₂e
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-carbon-600">Data Quality</p>
              <p className="text-2xl font-bold text-carbon-900">
                {carbonData?.verifiedTransactions}/{carbonData?.totalTransactions}
              </p>
              <p className="text-xs text-carbon-500 capitalize">
                {carbonData?.dataQuality} quality
              </p>
            </div>
            <Zap className="h-8 w-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-carbon-900 mb-4">
            Emissions by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(carbonData.categoryBreakdown).map(([category, emissions]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="capitalize text-carbon-700">{category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(emissions / carbonData.totalEmissions) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-carbon-900 w-16 text-right">
                    {emissions.toFixed(1)} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-carbon-900 mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-carbon-900">{transaction.merchant}</p>
                  <p className="text-sm text-carbon-600">
                    ${transaction.amount.toFixed(2)} • {transaction.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary-600">
                    {transaction.carbonEmissions.toFixed(1)} kg CO₂e
                  </p>
                  <p className="text-xs text-carbon-500 capitalize">
                    {transaction.confidence} confidence
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
