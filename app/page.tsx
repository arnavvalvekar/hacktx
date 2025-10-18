'use client'

import { useState, useEffect } from 'react'
import Dashboard from '@/components/Dashboard'
import TransactionList from '@/components/TransactionList'
import CarbonInsights from '@/components/CarbonInsights'
import DataCollection from '@/components/DataCollection'
import Navigation from '@/components/Navigation'
import { Transaction, CarbonData } from '@/types'

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [carbonData, setCarbonData] = useState<CarbonData | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'insights' | 'contribute'>('dashboard')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time like real data fetching
    const timer = setTimeout(() => {
      loadMockData()
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const loadMockData = () => {
    // Enhanced mock data inspired by wampusfyi's crowdsourced approach
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        merchant: 'Shell Gas Station',
        amount: 45.50,
        category: 'fuel',
        date: new Date('2024-01-15'),
        carbonEmissions: 12.3,
        confidence: 'high',
        method: 'unit-based',
        location: 'Austin, TX',
        verified: true
      },
      {
        id: '2',
        merchant: 'Whole Foods Market',
        amount: 89.20,
        category: 'groceries',
        date: new Date('2024-01-14'),
        carbonEmissions: 8.5,
        confidence: 'medium',
        method: 'spend-based',
        location: 'Austin, TX',
        verified: true
      },
      {
        id: '3',
        merchant: 'Southwest Airlines',
        amount: 250.00,
        category: 'travel',
        date: new Date('2024-01-13'),
        carbonEmissions: 45.2,
        confidence: 'high',
        method: 'unit-based',
        location: 'Austin to Dallas',
        verified: true
      },
      {
        id: '4',
        merchant: 'Amazon',
        amount: 67.99,
        category: 'retail',
        date: new Date('2024-01-12'),
        carbonEmissions: 5.8,
        confidence: 'medium',
        method: 'spend-based',
        location: 'Online',
        verified: false
      },
      {
        id: '5',
        merchant: 'Starbucks',
        amount: 12.45,
        category: 'food',
        date: new Date('2024-01-11'),
        carbonEmissions: 2.1,
        confidence: 'medium',
        method: 'spend-based',
        location: 'Austin, TX',
        verified: true
      },
      {
        id: '6',
        merchant: 'Austin Energy',
        amount: 125.30,
        category: 'utilities',
        date: new Date('2024-01-10'),
        carbonEmissions: 15.0,
        confidence: 'high',
        method: 'unit-based',
        location: 'Austin, TX',
        verified: true
      },
      {
        id: '7',
        merchant: 'Uber',
        amount: 18.75,
        category: 'transportation',
        date: new Date('2024-01-09'),
        carbonEmissions: 2.8,
        confidence: 'high',
        method: 'unit-based',
        location: 'Austin, TX',
        verified: true
      }
    ]

    // Enhanced carbon data with more comprehensive analytics
    const mockCarbonData: CarbonData = {
      totalEmissions: 91.7,
      dailyAverage: 13.1,
      monthlyProjection: 393.0,
      categoryBreakdown: {
        fuel: 12.3,
        groceries: 8.5,
        travel: 45.2,
        retail: 5.8,
        food: 2.1,
        utilities: 15.0,
        transportation: 2.8
      },
      trends: {
        weekly: [12.5, 15.8, 18.2, 14.6, 16.1, 11.3, 13.1],
        monthly: [385, 420, 398, 393]
      },
      verifiedTransactions: 6,
      totalTransactions: 7,
      dataQuality: 'high'
    }

    setTransactions(mockTransactions)
    setCarbonData(mockCarbonData)
  }

  const handleDataSubmission = (newTransaction: Omit<Transaction, 'id'>) => {
    // Simulate adding new transaction to the dataset
    const transaction: Transaction = {
      ...newTransaction,
      id: (transactions.length + 1).toString(),
      verified: false // New submissions need verification
    }
    
    setTransactions(prev => [transaction, ...prev])
    
    // Update carbon data
    if (carbonData) {
      const updatedCarbonData = {
        ...carbonData,
        totalEmissions: carbonData.totalEmissions + transaction.carbonEmissions,
        categoryBreakdown: {
          ...carbonData.categoryBreakdown,
          [transaction.category]: (carbonData.categoryBreakdown[transaction.category] || 0) + transaction.carbonEmissions
        },
        totalTransactions: carbonData.totalTransactions + 1
      }
      setCarbonData(updatedCarbonData)
    }
  }

  const renderActiveTab = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-carbon-600">Loading your carbon footprint data...</p>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard carbonData={carbonData} transactions={transactions} />
      case 'transactions':
        return <TransactionList transactions={transactions} />
      case 'insights':
        return <CarbonInsights carbonData={carbonData} />
      case 'contribute':
        return <DataCollection onSubmit={handleDataSubmission} />
      default:
        return <Dashboard carbonData={carbonData} transactions={transactions} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        {renderActiveTab()}
      </main>
    </div>
  )
}
