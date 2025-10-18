'use client'

import { useState } from 'react'
import { Upload, MapPin, Calendar, DollarSign, Leaf, CheckCircle, AlertCircle } from 'lucide-react'
import { Transaction } from '@/types'
import { calculateHybridEmissions, categorizeMerchant } from '@/utils/carbonCalculator'

interface DataCollectionProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void
}

export default function DataCollection({ onSubmit }: DataCollectionProps) {
  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    category: '',
    date: '',
    location: '',
    notes: '',
    unit: '',
    unitAmount: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories = [
    'fuel', 'groceries', 'travel', 'retail', 'food', 
    'utilities', 'transportation', 'entertainment', 'healthcare', 'education'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-categorize merchant if category is empty
    if (field === 'merchant' && !formData.category) {
      const autoCategory = categorizeMerchant(value)
      setFormData(prev => ({ ...prev, category: autoCategory }))
    }
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.merchant.trim()) newErrors.merchant = 'Merchant name is required'
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.date) newErrors.date = 'Date is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Calculate carbon emissions
      const amount = parseFloat(formData.amount)
      const unitAmount = formData.unitAmount ? parseFloat(formData.unitAmount) : undefined
      
      const emissionResult = calculateHybridEmissions(
        amount,
        formData.category,
        formData.unit,
        unitAmount
      )
      
      const transaction: Omit<Transaction, 'id'> = {
        merchant: formData.merchant.trim(),
        amount,
        category: formData.category,
        date: new Date(formData.date),
        carbonEmissions: emissionResult.emissions,
        confidence: emissionResult.confidence,
        method: emissionResult.method as 'unit-based' | 'spend-based' | 'hybrid',
        location: formData.location.trim() || undefined,
        verified: false,
        submittedBy: 'Anonymous User', // In real app, this would be the logged-in user
        notes: formData.notes.trim() || undefined
      }
      
      onSubmit(transaction)
      setSubmitted(true)
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          merchant: '',
          amount: '',
          category: '',
          date: '',
          location: '',
          notes: '',
          unit: '',
          unitAmount: ''
        })
        setSubmitted(false)
      }, 3000)
      
    } catch (error) {
      console.error('Error submitting transaction:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-carbon-900 mb-2">Thank You!</h2>
          <p className="text-carbon-600 mb-4">
            Your transaction data has been submitted successfully. It will be reviewed and added to our carbon footprint database.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Impact:</strong> Your contribution helps build a more comprehensive dataset for carbon footprint tracking, 
              benefiting the entire community in making more informed environmental decisions.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-carbon-900 mb-2">
          Contribute to Our Database
        </h1>
        <p className="text-carbon-600 mb-6">
          Help us build a comprehensive carbon footprint database by sharing your transaction data. 
          Inspired by crowdsourced approaches like <a href="https://github.com/siddharth-iyer1/wampusfyi" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">wampusfyi</a>, 
          your contributions make our data more accurate and valuable for everyone.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Merchant Name */}
          <div>
            <label className="block text-sm font-medium text-carbon-700 mb-2">
              Merchant Name *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.merchant}
                onChange={(e) => handleInputChange('merchant', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.merchant ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Shell Gas Station, Whole Foods, Southwest Airlines"
              />
              {errors.merchant && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.merchant}
                </p>
              )}
            </div>
          </div>

          {/* Amount and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-carbon-700 mb-2">
                Amount ($) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.amount}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Date and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-carbon-700 mb-2">
                Transaction Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.date}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon-700 mb-2">
                Location (Optional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Austin, TX"
                />
              </div>
            </div>
          </div>

          {/* Unit Information (for more accurate calculations) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-carbon-700 mb-2">
                Unit Type (Optional)
              </label>
              <select
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select unit</option>
                <option value="gallon">Gallons (fuel)</option>
                <option value="kWh">kWh (electricity)</option>
                <option value="therm">Therms (natural gas)</option>
                <option value="passenger-mile">Passenger-miles (air travel)</option>
                <option value="kg">Kilograms (food)</option>
                <option value="mile">Miles (transportation)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon-700 mb-2">
                Unit Amount (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitAmount}
                onChange={(e) => handleInputChange('unitAmount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 10.5"
                disabled={!formData.unit}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-carbon-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Any additional details about this transaction..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-carbon-600">
              <Leaf className="h-4 w-4 inline mr-1" />
              Your data will be used to improve carbon footprint calculations for everyone
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Submit Transaction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Data Quality Information */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Data Quality & Privacy</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Verification Process:</strong> All submitted data goes through our verification process to ensure accuracy and reliability.
          </p>
          <p>
            <strong>Privacy:</strong> We only collect transaction amounts and categories - no personal financial details are stored.
          </p>
          <p>
            <strong>Impact:</strong> Your contributions help build a more accurate carbon footprint database, benefiting the entire community.
          </p>
        </div>
      </div>
    </div>
  )
}

