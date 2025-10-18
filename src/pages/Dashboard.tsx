import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TiltCard } from '@/components/TiltCard'
import { CarbonOrbit } from '@/components/CarbonOrbit'
import { useApiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Leaf, TrendingUp, Calendar, Zap, RefreshCw } from 'lucide-react'
import { formatCarbon, calculateEcoScore } from '@/lib/utils'

export default function Dashboard() {
  const apiClient = useApiClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [emissionsSummary, setEmissionsSummary] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load user profile
      const profileResponse = await apiClient.get('/users/profile')
      setUserProfile(profileResponse.data.data)
      
      // Load emissions summary
      const emissionsResponse = await apiClient.get('/emissions/summary?window=week')
      setEmissionsSummary(emissionsResponse.data.data)
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncTransactions = async () => {
    try {
      if (!userProfile?.nessieCustomerId || !userProfile?.nessieAccountId) {
        toast({
          title: "Setup Required",
          description: "Please configure your Capital One account first",
          variant: "destructive"
        })
        return
      }

      const response = await apiClient.get(
        `/transactions/sync?customerId=${userProfile.nessieCustomerId}&accountId=${userProfile.nessieAccountId}`
      )
      
      toast({
        title: "Success",
        description: `Synced ${response.data.data.synced} transactions`,
        variant: "success"
      })
      
      // Reload dashboard data
      await loadDashboardData()
      
    } catch (error) {
      console.error('Error syncing transactions:', error)
      toast({
        title: "Error",
        description: "Failed to sync transactions",
        variant: "destructive"
      })
    }
  }

  const handleCalculateEmissions = async () => {
    try {
      await apiClient.post('/emissions/calc', {})
      
      toast({
        title: "Success",
        description: "Emissions calculated successfully",
        variant: "success"
      })
      
      // Reload dashboard data
      await loadDashboardData()
      
    } catch (error) {
      console.error('Error calculating emissions:', error)
      toast({
        title: "Error",
        description: "Failed to calculate emissions",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-eco-50 to-carbon-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-eco-500 mx-auto mb-4" />
          <p className="text-carbon-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const totalEmissions = emissionsSummary?.totalKg || 0
  const ecoScore = calculateEcoScore(totalEmissions, 'week')
  
  // Prepare data for CarbonOrbit chart
  const orbitData = Object.entries(emissionsSummary?.categoryBreakdown || {})
    .map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value as number,
      color: ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'][index % 6]
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 to-carbon-50 p-8">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-carbon-900 mb-2">
            Welcome back, <span className="gradient-text">{userProfile?.name || 'User'}</span>
          </h1>
          <p className="text-carbon-600 text-lg">
            Track your carbon footprint and make sustainable financial decisions
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              icon: Leaf, 
              title: 'Total Emissions', 
              value: formatCarbon(totalEmissions), 
              change: '+0%' 
            },
            { 
              icon: TrendingUp, 
              title: 'Weekly Average', 
              value: formatCarbon(totalEmissions / 7), 
              change: '+0%' 
            },
            { 
              icon: Calendar, 
              title: 'Transactions', 
              value: emissionsSummary?.transactionCount || '0', 
              change: '+0' 
            },
            { 
              icon: Zap, 
              title: 'Eco Score', 
              value: ecoScore.grade, 
              change: '+0',
              color: ecoScore.color
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <TiltCard>
                <Card className="glass-card hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-carbon-600">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-eco-500" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${stat.color || 'text-carbon-900'}`}>
                      {stat.value}
                    </div>
                    <p className="text-xs text-eco-600 mt-1">
                      {stat.change} from last week
                    </p>
                  </CardContent>
                </Card>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Carbon Orbit Chart */}
          <CarbonOrbit data={orbitData} totalEmissions={totalEmissions} />

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <TiltCard>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage your carbon footprint
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="eco" 
                    className="w-full justify-start"
                    onClick={handleSyncTransactions}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Import Transactions
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleCalculateEmissions}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Calculate Emissions
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/insights'}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Insights
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/transactions'}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Transaction History
                  </Button>
                </CardContent>
              </Card>
            </TiltCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
