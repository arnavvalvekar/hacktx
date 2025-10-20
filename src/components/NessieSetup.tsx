import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TiltCard } from '@/components/TiltCard'
import { useApiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Database, Key, User, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'

interface NessieSetupProps {
  userProfile: any
  onConfigSaved: () => void
}

export default function NessieSetup({ userProfile, onConfigSaved }: NessieSetupProps) {
  const apiClient = useApiClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [customerId, setCustomerId] = useState(userProfile?.nessieCustomerId || '')
  const [accountId, setAccountId] = useState(userProfile?.nessieAccountId || '')

  const handleSaveConfig = async () => {
    if (!customerId || !accountId) {
      toast({
        title: "Validation Error",
        description: "Please enter both Customer ID and Account ID",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      await apiClient.post('/users/profile', {
        nessieCustomerId: customerId,
        nessieAccountId: accountId
      })
      
      toast({
        title: "Success",
        description: "Nessie configuration saved successfully",
      })
      
      onConfigSaved()
    } catch (error) {
      console.error('Error saving Nessie config:', error)
      toast({
        title: "Error",
        description: "Failed to save Nessie configuration",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTestData = async () => {
    try {
      setIsLoading(true)
      toast({
        title: "Creating Test Data",
        description: "Setting up test customer and account...",
      })

      // This would typically call your backend to create test data
      // For now, we'll just set some example IDs
      setCustomerId('test_customer_123')
      setAccountId('test_account_456')
      
      toast({
        title: "Test Data Created",
        description: "Test customer and account IDs have been generated",
      })
    } catch (error) {
      console.error('Error creating test data:', error)
      toast({
        title: "Error",
        description: "Failed to create test data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <TiltCard>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Nessie API Status
            </CardTitle>
            <CardDescription>
              Current configuration status for Capital One Nessie API integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {userProfile?.nessieCustomerId ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-sm">
                  {userProfile?.nessieCustomerId ? 'Connected' : 'Not configured'}
                </span>
              </div>
              {userProfile?.nessieCustomerId && (
                <div className="text-xs text-carbon-600 space-y-1">
                  <div>Customer ID: {userProfile.nessieCustomerId}</div>
                  <div>Account ID: {userProfile.nessieAccountId}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TiltCard>

      {/* Configuration Form */}
      <TiltCard>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Enter your Nessie API customer and account IDs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-carbon-700 mb-2">
                  Customer ID
                </label>
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Enter your Nessie customer ID"
                  className="w-full px-3 py-2 border border-carbon-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-carbon-700 mb-2">
                  Account ID
                </label>
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Enter your Nessie account ID"
                  className="w-full px-3 py-2 border border-carbon-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveConfig}
                  disabled={isLoading}
                  className="bg-eco-500 hover:bg-eco-600 text-white"
                >
                  {isLoading ? 'Saving...' : 'Save Configuration'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleCreateTestData}
                  disabled={isLoading}
                  className="border-eco-300 text-eco-700 hover:bg-eco-50"
                >
                  Create Test Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TiltCard>

      {/* Setup Instructions */}
      <TiltCard>
        <Card className="glass-card border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <User className="h-5 w-5" />
              Setup Instructions
            </CardTitle>
            <CardDescription className="text-blue-700">
              Follow these steps to configure your Nessie API integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                <span>Get your Capital One Nessie API key from <a href="https://api.nessieisreal.com/" target="_blank" rel="noopener noreferrer" className="underline">api.nessieisreal.com</a></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                <span>Create a test customer using the Nessie API</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                <span>Create a test account for your customer</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                <span>Enter the Customer ID and Account ID above</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">5</span>
                <span>Click "Save Configuration" to connect your account</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TiltCard>
    </div>
  )
}
