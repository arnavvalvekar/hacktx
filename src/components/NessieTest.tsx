import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getNessieService } from '@/lib/nessie'
import { useToast } from '@/components/ui/use-toast'
import { Database, Users, CreditCard, DollarSign, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

export default function NessieTest() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)

  const testNessieAPI = async () => {
    try {
      setIsLoading(true)
      setTestResults(null)

      const nessie = getNessieService()
      const results = {
        customers: [],
        accounts: [],
        transactions: [],
        error: null
      }

      toast({
        title: "Testing Nessie API",
        description: "Querying Capital One Nessie API...",
      })

      try {
        // Test 1: Get customers
        results.customers = await nessie.getCustomers()
        console.log('✅ Customers loaded:', results.customers)
      } catch (error) {
        console.error('❌ Error loading customers:', error)
        results.error = error.message
      }

      try {
        // Test 2: Get accounts for first customer
        if (results.customers.length > 0) {
          const customerId = results.customers[0]._id
          results.accounts = await nessie.getCustomerAccounts(customerId)
          console.log('✅ Accounts loaded:', results.accounts)
        }
      } catch (error) {
        console.error('❌ Error loading accounts:', error)
        results.error = error.message
      }

      try {
        // Test 3: Get transactions for first account
        if (results.accounts.length > 0) {
          const accountId = results.accounts[0]._id
          results.transactions = await nessie.getAccountTransactions(accountId)
          console.log('✅ Transactions loaded:', results.transactions)
        }
      } catch (error) {
        console.error('❌ Error loading transactions:', error)
        results.error = error.message
      }

      setTestResults(results)

      if (results.error) {
        toast({
          title: "API Test Failed",
          description: results.error,
          variant: "destructive"
        })
      } else {
        toast({
          title: "API Test Successful",
          description: `Found ${results.customers.length} customers, ${results.accounts.length} accounts, ${results.transactions.length} transactions`,
        })
      }

    } catch (error) {
      console.error('Nessie API test error:', error)
      toast({
        title: "Test Failed",
        description: "Unable to connect to Nessie API",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Nessie API Test
          </CardTitle>
          <CardDescription>
            Test your Capital One Nessie API integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              onClick={testNessieAPI}
              disabled={isLoading}
              className="bg-eco-500 hover:bg-eco-600 text-white"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing API...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Test Real API
                </>
              )}
            </Button>
            
          </div>

          {testResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {testResults.isMockData && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Using Mock Data</span>
                  </div>
                </div>
              )}

              {testResults.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Error: {testResults.error}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Customers */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Customers ({testResults.customers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testResults.customers.length > 0 ? (
                      <div className="space-y-2">
                        {testResults.customers.slice(0, 3).map((customer: any) => (
                          <div key={customer._id} className="text-xs">
                            <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                            <div className="text-carbon-500">ID: {customer._id.slice(-8)}</div>
                          </div>
                        ))}
                        {testResults.customers.length > 3 && (
                          <div className="text-xs text-carbon-500">
                            +{testResults.customers.length - 3} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-carbon-500">No customers found</div>
                    )}
                  </CardContent>
                </Card>

                {/* Accounts */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Accounts ({testResults.accounts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testResults.accounts.length > 0 ? (
                      <div className="space-y-2">
                        {testResults.accounts.slice(0, 3).map((account: any) => (
                          <div key={account._id} className="text-xs">
                            <div className="font-medium">{account.type}</div>
                            <div className="text-carbon-500">
                              ${account.balance?.toFixed(2) || '0.00'} • ID: {account._id.slice(-8)}
                            </div>
                          </div>
                        ))}
                        {testResults.accounts.length > 3 && (
                          <div className="text-xs text-carbon-500">
                            +{testResults.accounts.length - 3} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-carbon-500">No accounts found</div>
                    )}
                  </CardContent>
                </Card>

                {/* Transactions */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Transactions ({testResults.transactions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testResults.transactions.length > 0 ? (
                      <div className="space-y-2">
                        {testResults.transactions.slice(0, 3).map((transaction: any) => (
                          <div key={transaction._id} className="text-xs">
                            <div className="font-medium">
                              ${transaction.amount?.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-carbon-500">
                              {transaction.merchant_name || transaction.description || 'Purchase'}
                            </div>
                          </div>
                        ))}
                        {testResults.transactions.length > 3 && (
                          <div className="text-xs text-carbon-500">
                            +{testResults.transactions.length - 3} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-carbon-500">No transactions found</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Raw Data (for debugging) */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-carbon-600">
                  View Raw API Response
                </summary>
                <pre className="mt-2 p-3 bg-carbon-50 rounded-lg text-xs overflow-auto max-h-64">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </details>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
