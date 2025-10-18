'use client'

import { useState } from 'react'
import { Search, Filter, Calendar, DollarSign, Leaf } from 'lucide-react'
import { Transaction } from '@/types'

interface TransactionListProps {
  transactions: Transaction[]
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'emissions'>('date')

  const categories = ['all', ...new Set(transactions.map(t => t.category))]

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.date.getTime() - a.date.getTime()
        case 'amount':
          return b.amount - a.amount
        case 'emissions':
          return b.carbonEmissions - a.carbonEmissions
        default:
          return 0
      }
    })

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'unit-based': return 'text-blue-600 bg-blue-100'
      case 'spend-based': return 'text-purple-600 bg-purple-100'
      case 'hybrid': return 'text-indigo-600 bg-indigo-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-carbon-900 mb-2">
          Transaction History
        </h1>
        <p className="text-carbon-600">
          View and analyze your carbon footprint by transaction
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search merchants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'emissions')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="emissions">Sort by Emissions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-carbon-700">Merchant</th>
                <th className="text-left py-3 px-4 font-medium text-carbon-700">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-carbon-700">Category</th>
                <th className="text-left py-3 px-4 font-medium text-carbon-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-carbon-700">Emissions</th>
                <th className="text-left py-3 px-4 font-medium text-carbon-700">Method</th>
                <th className="text-left py-3 px-4 font-medium text-carbon-700">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-carbon-900">{transaction.merchant}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="font-medium">{transaction.amount.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize text-carbon-700">{transaction.category}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-carbon-700">
                        {transaction.date.toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Leaf className="h-4 w-4 text-primary-600 mr-1" />
                      <span className="font-medium text-primary-600">
                        {transaction.carbonEmissions.toFixed(1)} kg CO₂e
                      </span>
                      {transaction.verified && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(transaction.method)}`}>
                      {transaction.method}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(transaction.confidence)}`}>
                      {transaction.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-carbon-500">
            No transactions found matching your criteria.
          </div>
        )}
      </div>
    </div>
  )
}
