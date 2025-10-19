import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TiltCard } from '@/components/TiltCard'
import { Button } from '@/components/ui/button'
import { useApiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { BarChart3, RefreshCw, CreditCard, Receipt, TrendingUp, Calendar } from 'lucide-react'
import { nessieService } from '@/services/nessieService'
import type { Transaction, CarbonFootprintData } from '@/types/nessieTypes'

export default function Transactions() {
  const apiClient = useApiClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [carbonData, setCarbonData] = useState<CarbonFootprintData[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('all')

  useEffect(() => {
    loadTransactions()
  }, [selectedAccount])

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      
      // Load Nessie mock data
      let nessieTransactions: Transaction[] = []
      
      if (selectedAccount === 'all') {
        // Get all transactions from all accounts
        const accounts = nessieService.getAccounts()
        const allTransactions: Transaction[] = []
        accounts.forEach(account => {
          allTransactions.push(...nessieService.getTransactionsByAccountId(account._id))
        })
        
        // Remove duplicates by creating a Map with unique IDs
        const uniqueTransactions = new Map()
        allTransactions.forEach(transaction => {
          uniqueTransactions.set(transaction._id, transaction)
        })
        nessieTransactions = Array.from(uniqueTransactions.values())
      } else {
        // Get transactions for specific account
        nessieTransactions = nessieService.getTransactionsByAccountId(selectedAccount)
      }
      
      setTransactions(nessieTransactions)
      
      // Load carbon footprint data
      const carbonFootprintData = nessieService.getCarbonFootprintData()
      setCarbonData(carbonFootprintData)
      
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
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="px-3 py-2 border border-carbon-200 rounded-lg bg-white text-carbon-900"
                  >
                    <option value="all">All Accounts</option>
                    {nessieService.getAccounts().map(account => (
                      <option key={account._id} value={account._id}>
                        {account.nickname} ({account.type})
                      </option>
                    ))}
                  </select>
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
                <div className="text-sm text-carbon-600">
                  {transactions.length} transactions
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
                  {transactions.map((transaction, index) => {
                    const carbonInfo = carbonData.find(c => c.transactionId === transaction._id)
                    return (
                      <motion.div
                        key={transaction._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-carbon-200 hover:shadow-md transition-shadow"
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
                            <p className="font-medium text-carbon-900">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-sm text-carbon-500">
                              <Calendar className="h-3 w-3" />
                              {new Date(transaction.date).toLocaleDateString()}
                              <span className="capitalize">• {transaction.type}</span>
                              {carbonInfo && (
                                <span className="text-eco-600">• {carbonInfo.merchant}</span>
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
                            <p className="text-carbon-600 capitalize">{transaction.status}</p>
                            {carbonInfo && (
                              <p className="text-eco-600">{carbonInfo.carbonFootprint.toFixed(2)} kg CO₂</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
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

