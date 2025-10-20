import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getNessieService } from '@/lib/nessie'
import { useApiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Users, CreditCard, DollarSign, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function CreateTestData() {
  const { toast } = useToast()
  const apiClient = useApiClient()
  const [isCreating, setIsCreating] = useState(false)
  const [createdData, setCreatedData] = useState<any>(null)

  const createTestData = async () => {
    try {
      setIsCreating(true)
      setCreatedData(null)

      toast({
        title: "Creating Test Data",
        description: "Setting up customer, account, and sample transactions...",
      })

      const nessie = getNessieService()
      const results = {
        customer: null,
        account: null,
        transactions: []
      }

      // Step 1: Create test customer using POST /customers
      results.customer = await nessie.createTestCustomer()
      console.log('✅ Created customer via POST:', results.customer)

      // Step 2: Create test account using POST /customers/[id]/accounts
      results.account = await nessie.createTestAccount(results.customer._id)
      console.log('✅ Created account via POST:', results.account)

      // Step 3: Create test transactions using POST /accounts/[id]/purchases
      results.transactions = await nessie.createTestTransactions(results.account._id)
      console.log('✅ Created transactions via POST:', results.transactions)

      setCreatedData(results)

      // Update user profile with the new IDs
      try {
        await apiClient.post('/users/profile', {
          nessieCustomerId: results.customer._id,
          nessieAccountId: results.account._id
        })
        
        toast({
          title: "Test Data Created Successfully",
          description: `Created customer, account, and ${results.transactions.length} transactions. Profile updated!`,
        })
      } catch (error) {
        console.error('Error updating user profile:', error)
        toast({
          title: "Data Created, Profile Update Failed",
          description: "Test data created but failed to update your profile. Please manually add the IDs in Settings.",
          variant: "destructive"
        })
      }

    } catch (error) {
      console.error('Error creating test data:', error)
      toast({
        title: "Failed to Create Test Data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="glass-card border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Plus className="h-5 w-5" />
          Create Test Data
        </CardTitle>
        <CardDescription className="text-green-700">
          Create sample customers, accounts, and transactions for testing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-white/50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">What this creates:</h4>
            <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
              <li>Test customer with sample personal information</li>
              <li>Test checking account with $1000 balance</li>
              <li>5 sample transactions (coffee, gas, groceries, etc.)</li>
              <li>Automatically updates your profile with the new IDs</li>
            </ul>
          </div>

          <Button 
            onClick={createTestData}
            disabled={isCreating}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isCreating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creating Test Data...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Test Data
              </>
            )}
          </Button>

          {createdData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="bg-white/70 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Test Data Created Successfully!</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-2 rounded border">
                    <div className="flex items-center gap-1 text-green-700 mb-1">
                      <Users className="h-3 w-3" />
                      <span className="font-medium">Customer</span>
                    </div>
                    <div className="text-xs text-carbon-600">
                      ID: {createdData.customer._id.slice(-8)}
                    </div>
                    <div className="text-xs text-carbon-600">
                      {createdData.customer.first_name} {createdData.customer.last_name}
                    </div>
                  </div>
                  
                  <div className="bg-white p-2 rounded border">
                    <div className="flex items-center gap-1 text-green-700 mb-1">
                      <CreditCard className="h-3 w-3" />
                      <span className="font-medium">Account</span>
                    </div>
                    <div className="text-xs text-carbon-600">
                      ID: {createdData.account._id.slice(-8)}
                    </div>
                    <div className="text-xs text-carbon-600">
                      ${createdData.account.balance} balance
                    </div>
                  </div>
                  
                  <div className="bg-white p-2 rounded border">
                    <div className="flex items-center gap-1 text-green-700 mb-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-medium">Transactions</span>
                    </div>
                    <div className="text-xs text-carbon-600">
                      {createdData.transactions.length} created
                    </div>
                    <div className="text-xs text-carbon-600">
                      Total: ${createdData.transactions.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-green-700">
                <strong>Next steps:</strong> Your profile has been updated with these IDs. 
                Go to the Transactions page to see your new test data!
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
