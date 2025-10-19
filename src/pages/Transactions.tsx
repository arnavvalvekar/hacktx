import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useApiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'
import { BarChart3, RefreshCw, CreditCard, Receipt, TrendingUp, Calendar, ArrowLeft } from 'lucide-react'
import { nessieService } from '@/services/nessieService'
import type { Transaction, CarbonFootprintData } from '@/types/nessieTypes'
// @ts-ignore - JavaScript module
import { MOCK_MODE } from '@/config/app'
// @ts-ignore - JavaScript module
import { getTransactions } from '@/services/mockData'
import type { MockTransaction } from '@/types/mockTypes'

export default function Transactions() {
  const apiClient = useApiClient()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [carbonData, setCarbonData] = useState<CarbonFootprintData[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('mock')

  useEffect(() => {
    loadTransactions()
  }, [selectedAccount])

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      
      // Always load mock transactions with CO₂ data (no account configuration needed)
      const mockTransactions = await getTransactions();
      setTransactions(mockTransactions.map((tx: MockTransaction) => ({
        _id: tx.id,
        description: tx.merchant,
        amount: tx.amount,
        date: tx.date,
        type: 'purchase',
        status: 'completed',
        category: tx.category,
        mcc: tx.mcc,
        co2e_kg: tx.co2e_kg,
        method: tx.method,
        confidence: tx.confidence,
        account_id: 'mock-account'
      })));
      
      // Set mock carbon data
      setCarbonData(mockTransactions.map((tx: MockTransaction) => ({
        transactionId: tx.id,
        merchant: tx.merchant,
        carbonFootprint: tx.co2e_kg,
        category: tx.category
      })));
      
    } catch (error) {
      console.error('Error loading transactions:', error)
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 to-carbon-50 p-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  Transaction History
                </h1>
                <p className="text-gray-600 text-sm">
                  View and analyze your spending patterns and environmental impact
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Transactions</p>
                  <p className="text-sm font-medium text-gray-900">{transactions.length}</p>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadTransactions}
                  disabled={isLoading}
                  className="text-gray-600 hover:text-gray-900 border-gray-300"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              Transaction Details
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your transaction history with environmental impact data
            </CardDescription>
          </CardHeader>
            <CardContent>
              
              {isLoading ? (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <RefreshCw className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Loading transactions...</p>
                  </div>
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction, index) => {
                    const carbonInfo = carbonData.find(c => c.transactionId === transaction._id)
                    return (
                      <motion.div
                        key={transaction._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'deposit' ? 'bg-green-100' :
                            transaction.type === 'purchase' ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            {transaction.type === 'deposit' ? <CreditCard className="h-5 w-5 text-green-600" /> :
                             transaction.type === 'purchase' ? <Receipt className="h-5 w-5 text-red-600" /> :
                             <TrendingUp className="h-5 w-5 text-blue-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {new Date(transaction.date).toLocaleDateString()}
                              <span className="capitalize">• {transaction.type}</span>
                              {transaction.category && (
                                <span className="text-blue-600">• {transaction.category}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </p>
                          <div className="text-sm">
                            <p className="text-gray-600 capitalize">{transaction.status}</p>
                            {transaction.co2e_kg && (
                              <div className="space-y-1">
                                <p className="text-blue-600 font-medium">{transaction.co2e_kg.toFixed(2)} kg CO₂</p>
                                <div className="flex gap-1">
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    transaction.method === "category" ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" : "bg-white/10 text-white/70 border-white/15"
                                  }`}>
                                    {transaction.method}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    transaction.confidence === "Medium" ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30" : 
                                    transaction.confidence === "High" ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" : 
                                    "bg-white/10 text-white/70 border-white/15"
                                  }`}>
                                    {transaction.confidence}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No transactions found</p>
                    <p className="text-sm text-gray-500">Sync your accounts to see transactions</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
      </div>

      {/* Professional Back Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}

