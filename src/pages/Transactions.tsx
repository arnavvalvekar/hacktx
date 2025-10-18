import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TiltCard } from '@/components/TiltCard'
import { Button } from '@/components/ui/button'
import { useApiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { BarChart3, RefreshCw } from 'lucide-react'

export default function Transactions() {
  const apiClient = useApiClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      // Connect to backend API endpoint as specified in architecture
      const response = await apiClient.get('/api/transactions')
      setTransactions(response.data.data || [])
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
          <h1 className="text-4xl font-bold text-carbon-900 mb-2">
            Transaction History
          </h1>
          <p className="text-carbon-600 text-lg">
            View and analyze your carbon footprint by transaction
          </p>
        </motion.div>

        <TiltCard>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-eco-500" />
                Transactions
              </CardTitle>
              <CardDescription>
                Your transaction history with carbon footprint data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadTransactions}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-eco-100 to-eco-200 rounded-lg">
                  <div className="text-center">
                    <RefreshCw className="h-16 w-16 text-eco-500 mx-auto mb-4 animate-spin" />
                    <p className="text-carbon-600">Loading transactions...</p>
                  </div>
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((transaction, index) => (
                    <motion.div
                      key={transaction.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-carbon-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-eco-100 rounded-full flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-eco-600" />
                        </div>
                        <div>
                          <p className="font-medium text-carbon-900">{transaction.merchant || 'Transaction'}</p>
                          <p className="text-sm text-carbon-500">{transaction.date || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-carbon-900">${transaction.amount || '0.00'}</p>
                        <p className="text-sm text-eco-600">{transaction.co2_kg || '0.00'} kg CO₂</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-eco-100 to-eco-200 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-eco-500 mx-auto mb-4" />
                    <p className="text-carbon-600">No transactions found</p>
                    <p className="text-sm text-carbon-500">Sync your accounts to see transactions</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TiltCard>
      </div>
    </div>
  )
}

