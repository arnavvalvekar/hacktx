import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getNessieService } from '@/lib/nessie'
import { useApiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Users, CreditCard, User, MapPin, DollarSign, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function NessieCreator() {
  const { toast } = useToast()
  const apiClient = useApiClient()
  const [isCreating, setIsCreating] = useState(false)
  const [createdData, setCreatedData] = useState<any>(null)
  
  // Form state
  const [customerForm, setCustomerForm] = useState({
    first_name: 'John',
    last_name: 'Doe',
    street_number: '123',
    street_name: 'Main St',
    city: 'Anytown',
    state: 'NY',
    zip: '12345'
  })
  
  const [accountForm, setAccountForm] = useState({
    type: 'Checking',
    nickname: 'My Checking Account',
    rewards: 0,
    balance: 1000,
    account_number: '1234567890'
  })

  const createCustomerAndAccount = async () => {
    try {
      setIsCreating(true)
      setCreatedData(null)

      toast({
        title: "Creating Customer & Account",
        description: "Using Nessie API POST methods to create customer and account...",
      })

      const nessie = getNessieService()
      const results = {
        customer: null,
        account: null,
        transactions: []
      }

      // Step 1: Create customer using POST /customers
      const customerData = {
        first_name: customerForm.first_name,
        last_name: customerForm.last_name,
        address: {
          street_number: customerForm.street_number,
          street_name: customerForm.street_name,
          city: customerForm.city,
          state: customerForm.state,
          zip: customerForm.zip
        }
      }

      results.customer = await nessie.createCustomer(customerData)
      console.log('✅ Created customer via POST:', results.customer)

      // Step 2: Create account using POST /customers/[id]/accounts
      results.account = await nessie.createAccount(results.customer._id, accountForm)
      console.log('✅ Created account via POST:', results.account)

      // Step 3: Create sample transactions
      results.transactions = await nessie.createTestTransactions(results.account._id)
      console.log('✅ Created transactions:', results.transactions)

      setCreatedData(results)

      // Update user profile with the new IDs
      try {
        await apiClient.post('/users/profile', {
          nessieCustomerId: results.customer._id,
          nessieAccountId: results.account._id
        })
        
        toast({
          title: "Success! Customer & Account Created",
          description: `Created customer "${results.customer.first_name} ${results.customer.last_name}" and account with ${results.transactions.length} transactions. Profile updated!`,
        })
      } catch (error) {
        console.error('Error updating user profile:', error)
        toast({
          title: "Data Created, Profile Update Failed",
          description: "Customer and account created but failed to update your profile. Please manually add the IDs in Settings.",
          variant: "destructive"
        })
      }

    } catch (error) {
      console.error('Error creating customer and account:', error)
      toast({
        title: "Failed to Create Customer & Account",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Plus className="h-5 w-5" />
            Create Customer & Account with Nessie API
          </CardTitle>
          <CardDescription className="text-blue-700">
            Use POST methods to create a new customer and account in the Nessie API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Customer Form */}
            <div className="bg-white/50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Customer Information (POST /customers)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={customerForm.first_name}
                    onChange={(e) => setCustomerForm({...customerForm, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={customerForm.last_name}
                    onChange={(e) => setCustomerForm({...customerForm, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Street Number</label>
                  <input
                    type="text"
                    value={customerForm.street_number}
                    onChange={(e) => setCustomerForm({...customerForm, street_number: e.target.value})}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Street Name</label>
                  <input
                    type="text"
                    value={customerForm.street_name}
                    onChange={(e) => setCustomerForm({...customerForm, street_name: e.target.value})}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">City</label>
                  <input
                    type="text"
                    value={customerForm.city}
                    onChange={(e) => setCustomerForm({...customerForm, city: e.target.value})}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">State</label>
                  <input
                    type="text"
                    value={customerForm.state}
                    onChange={(e) => setCustomerForm({...customerForm, state: e.target.value})}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={customerForm.zip}
                    onChange={(e) => setCustomerForm({...customerForm, zip: e.target.value})}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Account Form */}
            <div className="bg-white/50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Account Information (POST /customers/&#123;id&#125;/accounts)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Account Type</label>
                  <select
                    value={accountForm.type}
                    onChange={(e) => setAccountForm({...accountForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Nickname</label>
                  <input
                    type="text"
                    value={accountForm.nickname}
                    onChange={(e) => setAccountForm({...accountForm, nickname: e.target.value})}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Initial Balance ($)</label>
                  <input
                    type="number"
                    value={accountForm.balance}
                    onChange={(e) => setAccountForm({...accountForm, balance: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={accountForm.account_number}
                    onChange={(e) => setAccountForm({...accountForm, account_number: e.target.value})}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={createCustomerAndAccount}
              disabled={isCreating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating Customer & Account...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Customer & Account
                </>
              )}
            </Button>

            {createdData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 p-4 rounded-lg"
              >
                <div className="flex items-center gap-2 text-blue-800 mb-3">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Customer & Account Created Successfully!</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Customer</span>
                    </div>
                    <div className="text-xs text-carbon-600 space-y-1">
                      <div>Name: {createdData.customer.first_name} {createdData.customer.last_name}</div>
                      <div>ID: {createdData.customer._id}</div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{createdData.customer.address.city}, {createdData.customer.address.state}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium">Account</span>
                    </div>
                    <div className="text-xs text-carbon-600 space-y-1">
                      <div>Type: {createdData.account.type}</div>
                      <div>ID: {createdData.account._id}</div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>Balance: ${createdData.account.balance}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-blue-700">
                  <strong>Next steps:</strong> Your profile has been updated with these IDs. 
                  Go to the Transactions page to see your new account and transactions!
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
