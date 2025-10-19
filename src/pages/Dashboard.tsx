import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TiltCard } from '@/components/TiltCard'
import { CarbonOrbit } from '@/components/CarbonOrbit'
import { useApiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { LogoutButton } from '@/components/LogoutButton'
import { useAuth0 } from '@auth0/auth0-react'
import { Leaf, TrendingUp, Calendar, Zap, RefreshCw, DollarSign, CreditCard, MessageCircle, Settings, Target, Plus, CheckCircle, Award } from 'lucide-react'
import { formatCarbon } from '@/lib/utils'
import { nessieService } from '@/services/nessieService'
import type { AccountSummary, TransactionSummary } from '@/types/nessieTypes'
// @ts-ignore - JavaScript module
import { MOCK_MODE } from '@/config/app'
// @ts-ignore - JavaScript module  
import { getDashboardSummary, getCategoryBreakdown, getTransactions } from '@/services/mockData'

export default function Dashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const apiClient = useApiClient()
  const { toast } = useToast()
  const { user } = useAuth0()
  const [isLoading, setIsLoading] = useState(true)
  const [emissionsSummary, setEmissionsSummary] = useState<any>(null)
  const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(null)
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'goals'>('overview')
  const [goals, setGoals] = useState<Array<{
    id: string
    title: string
    description: string
    targetValue: number
    currentValue: number
    unit: string
    category: string
    completed: boolean
    createdAt: Date
  }>>([])
  const [newGoal, setNewGoal] = useState({ title: '', description: '', targetValue: 0, unit: 'kg CO2e', category: 'carbon' })
  const [mockSummary, setMockSummary] = useState<any>(null)

  useEffect(() => {
    loadDashboardData()
    loadGoals()
    
    // Handle URL parameters
    const tab = searchParams.get('tab')
    if (tab === 'goals') {
      setActiveTab('goals')
    }
    
    // Check for pre-filled goal from coach
    const prefillGoal = localStorage.getItem('ecofin-prefill-goal')
    if (prefillGoal) {
      try {
        const goal = JSON.parse(prefillGoal)
        setNewGoal({
          title: goal.title,
          description: goal.description,
          targetValue: goal.targetValue,
          unit: goal.unit,
          category: goal.category
        })
        setActiveTab('goals')
        localStorage.removeItem('ecofin-prefill-goal') // Clear after use
        
        toast({
          title: "Goal Ready! 🎯",
          description: "Customize your goal details below and click 'Add Goal' to save it.",
        })
      } catch (error) {
        console.error('Error parsing pre-filled goal:', error)
      }
    }
    
    // Listen for goal creation events from coach
    const handleGoalCreated = () => {
      loadGoals()
    }
    
    window.addEventListener('goalCreated', handleGoalCreated)
    
    return () => {
      window.removeEventListener('goalCreated', handleGoalCreated)
    }
  }, [searchParams])

  const loadGoals = () => {
    try {
      const savedGoals = localStorage.getItem('ecofin-goals')
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals).map((goal: any) => ({
          ...goal,
          createdAt: new Date(goal.createdAt)
        }))
        setGoals(parsedGoals)
      } else {
        // Default goals for Vishal
        const defaultGoals = [
          {
            id: '1',
            title: 'Reduce Monthly Carbon Footprint',
            description: 'Lower my carbon emissions by 20% this month',
            targetValue: 20,
            currentValue: 8,
            unit: '%',
            category: 'carbon',
            completed: false,
            createdAt: new Date()
          },
          {
            id: '2',
            title: 'Sustainable Transportation',
            description: 'Use public transport or bike for 15 days this month',
            targetValue: 15,
            currentValue: 7,
            unit: 'days',
            category: 'transportation',
            completed: false,
            createdAt: new Date()
          }
        ]
        setGoals(defaultGoals)
        localStorage.setItem('ecofin-goals', JSON.stringify(defaultGoals))
      }
    } catch (error) {
      console.error('Error loading goals:', error)
    }
  }

  const addGoal = () => {
    if (!newGoal.title.trim()) return
    
    const goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetValue: newGoal.targetValue,
      currentValue: 0,
      unit: newGoal.unit,
      category: newGoal.category,
      completed: false,
      createdAt: new Date()
    }
    
    const updatedGoals = [...goals, goal]
    setGoals(updatedGoals)
    localStorage.setItem('ecofin-goals', JSON.stringify(updatedGoals))
    
    setNewGoal({ title: '', description: '', targetValue: 0, unit: 'kg CO2e', category: 'carbon' })
    toast({
      title: "Goal Added",
      description: "Your new sustainability goal has been added!",
    })
  }

  const toggleGoalComplete = (goalId: string) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    )
    setGoals(updatedGoals)
    localStorage.setItem('ecofin-goals', JSON.stringify(updatedGoals))
  }

  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId)
    setGoals(updatedGoals)
    localStorage.setItem('ecofin-goals', JSON.stringify(updatedGoals))
    toast({
      title: "Goal Deleted",
      description: "Goal has been removed successfully.",
    })
  }

  const calculateSustainabilityGrade = () => {
    const totalCarbon = nessieService.getTotalCarbonFootprint()
    const transactionCount = transactionSummary?.totalTransactions || 0
    
    if (transactionCount === 0) return { grade: 'N/A', score: 0, color: '#6b7280' }
    
    // Calculate average carbon per transaction
    const avgCarbonPerTransaction = totalCarbon / transactionCount
    
    // Grade based on average carbon per transaction (lower is better)
    let grade: string
    let score: number
    let color: string
    
    if (avgCarbonPerTransaction <= 1.5) {
      grade = 'A+'
      score = 95
      color = '#22c55e' // Green
    } else if (avgCarbonPerTransaction <= 2.5) {
      grade = 'A'
      score = 90
      color = '#22c55e' // Green
    } else if (avgCarbonPerTransaction <= 4.0) {
      grade = 'B+'
      score = 85
      color = '#84cc16' // Light green
    } else if (avgCarbonPerTransaction <= 5.5) {
      grade = 'B'
      score = 80
      color = '#84cc16' // Light green
    } else if (avgCarbonPerTransaction <= 7.0) {
      grade = 'C+'
      score = 75
      color = '#eab308' // Yellow
    } else if (avgCarbonPerTransaction <= 9.0) {
      grade = 'C'
      score = 70
      color = '#eab308' // Yellow
    } else if (avgCarbonPerTransaction <= 12.0) {
      grade = 'D'
      score = 60
      color = '#f97316' // Orange
    } else {
      grade = 'F'
      score = 50
      color = '#ef4444' // Red
    }
    
    return { grade, score, color }
  }

  const loadDashboardData = async () => {
    try {
      console.log('🔍 DASHBOARD DEBUG: Starting to load dashboard data');
      setIsLoading(true)
      
      if (MOCK_MODE) {
        console.log('🔍 DASHBOARD DEBUG: Using mock data mode');
        // Load mock data
        const mockSummary = await getDashboardSummary();
        const mockBreakdown = await getCategoryBreakdown();
        
        // Set mock emissions summary
        setEmissionsSummary({
          totalKg: mockSummary.mtd_kg,
          categoryBreakdown: mockBreakdown.reduce((acc: any, item: any) => {
            acc[item.category.toLowerCase()] = item.value;
            return acc;
          }, {})
        });
        
        // Set mock account and transaction data
        setAccountSummary({
          totalBalance: 5000,
          accountCount: 1,
          accounts: [{
            _id: 'mock-account',
            customer_id: 'mock-customer',
            nickname: 'Main Account',
            type: 'Checking',
            account_number: '****1234',
            balance: 5000,
            rewards: 150
          }]
        });
        
        setTransactionSummary({
          totalTransactions: mockSummary.tx_count,
          totalSpent: 0,
          totalDeposited: 0,
          recentTransactions: (await getTransactions()).slice(0, 5).map((tx: any) => ({
            _id: tx.id,
            description: tx.merchant,
            amount: tx.amount,
            date: tx.date,
            type: 'purchase',
            status: 'completed',
            account_id: 'mock-account'
          }))
        });
        
        setMockSummary(mockSummary);
        
        console.log('✅ DASHBOARD DEBUG: Mock data loaded successfully');
      } else {
        console.log('🔍 DASHBOARD DEBUG: Loading user profile...');
        // Load user profile
        const profileResponse = await apiClient.get('/users/profile')
        console.log('✅ DASHBOARD DEBUG: User profile loaded:', profileResponse.data);
        
        console.log('🔍 DASHBOARD DEBUG: Loading emissions summary...');
        // Load emissions summary
        const emissionsResponse = await apiClient.get('/emissions/summary?window=week')
        console.log('✅ DASHBOARD DEBUG: Emissions summary loaded:', emissionsResponse.data);
        setEmissionsSummary(emissionsResponse.data.data)
        
        console.log('🔍 DASHBOARD DEBUG: Loading Nessie mock data...');
        // Load Nessie mock data
        const accountData = nessieService.getAccountSummary()
        const transactionData = nessieService.getTransactionSummary()
        
        console.log('✅ DASHBOARD DEBUG: Nessie data loaded:', {
          accountData,
          transactionData
        });
        
        setAccountSummary(accountData)
        setTransactionSummary(transactionData)
        
        console.log('✅ DASHBOARD DEBUG: Dashboard data loaded successfully');
      }
      
    } catch (error) {
      console.error('❌ DASHBOARD ERROR: Error loading dashboard data:', error);
      console.error('❌ DASHBOARD ERROR: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
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
      // Skip account configuration - just reload mock data
      toast({
        title: "Success",
        description: "Data refreshed successfully",
        variant: "success"
      })
      
      // Reload dashboard data
      await loadDashboardData()
      
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive"
      })
    }
  }

  const handleCalculateEmissions = async () => {
    try {
      // Skip API call - just refresh mock data
      toast({
        title: "Success",
        description: "Emissions data refreshed successfully",
        variant: "success"
      })
      
      // Reload dashboard data
      await loadDashboardData()
      
    } catch (error) {
      console.error('Error refreshing emissions:', error)
      toast({
        title: "Error",
        description: "Failed to refresh emissions data",
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
        {/* Professional Banking Header */}
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
                  Financial Dashboard
                </h1>
                <p className="text-gray-600 text-sm">
                  Welcome back, {user?.name || 'User'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Account Status</p>
                  <p className="text-sm font-medium text-green-600">Active</p>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 border-gray-300"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <LogoutButton className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Logout
                </LogoutButton>
              </div>
            </div>
          </div>
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
              icon: DollarSign, 
              title: 'Total Balance', 
              value: `$${accountSummary?.totalBalance.toLocaleString() || '0'}`, 
              change: '+0%' 
            },
            { 
              icon: Calendar, 
              title: 'Transactions', 
              value: transactionSummary?.totalTransactions.toString() || '0', 
              change: '+0' 
            },
            { 
              icon: Award, 
              title: 'Sustainability Grade', 
              value: calculateSustainabilityGrade().grade, 
              change: `${calculateSustainabilityGrade().score}/100`,
              color: calculateSustainabilityGrade().color
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-semibold ${stat.color || 'text-gray-900'}`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {stat.change} from last week
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CO₂ Stats */}
        {MOCK_MODE && mockSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { 
                icon: Leaf, 
                title: "Today's CO₂e", 
                value: `${mockSummary.today_kg} kg`, 
                change: 'Live data' 
              },
              { 
                icon: Calendar, 
                title: "MTD CO₂e", 
                value: `${mockSummary.mtd_kg} kg`, 
                change: 'This month' 
              },
              { 
                icon: Award, 
                title: "Eco Score", 
                value: mockSummary.eco_score, 
                change: `Intensity ${mockSummary.eco_details.intensity}/100 · MoM ${mockSummary.eco_details.improvement}/100`,
                color: mockSummary.eco_score >= 80 ? '#22c55e' : mockSummary.eco_score >= 60 ? '#eab308' : '#ef4444'
              },
              { 
                icon: TrendingUp, 
                title: "# Transactions", 
                value: mockSummary.tx_count.toString(), 
                change: 'Last 60 days' 
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
                        {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Carbon Orbit Chart with Goals Tab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Portfolio Analytics
                  </CardTitle>
                  <div className="flex bg-gray-50 rounded-md p-1">
                    <Button
                      variant={activeTab === 'overview' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('overview')}
                      className={activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}
                    >
                      Overview
                    </Button>
                    <Button
                      variant={activeTab === 'goals' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('goals')}
                      className={activeTab === 'goals' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}
                    >
                      <Target className="mr-1 h-3 w-3" />
                      Goals
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'overview' ? (
                  <div className="h-80">
                    <CarbonOrbit data={orbitData} totalEmissions={totalEmissions} />
                  </div>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {/* Add New Goal Form */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Goal
                      </h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Goal title (e.g., Reduce carbon by 20%)"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <textarea
                          placeholder="Description (optional)"
                          value={newGoal.description}
                          onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="number"
                            placeholder="Target value"
                            value={newGoal.targetValue}
                            onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <select
                            value={newGoal.unit}
                            onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="kg CO2e">kg CO2e</option>
                            <option value="%">%</option>
                            <option value="days">days</option>
                            <option value="$">$</option>
                            <option value="times">times</option>
                          </select>
                          <select
                            value={newGoal.category}
                            onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="carbon">Carbon Emissions</option>
                            <option value="transportation">Transportation</option>
                            <option value="food">Food & Dining</option>
                            <option value="shopping">Shopping</option>
                            <option value="utilities">Utilities</option>
                            <option value="general">General</option>
                          </select>
                        </div>
                        <Button
                          onClick={addGoal}
                          disabled={!newGoal.title.trim()}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Goal
                        </Button>
                      </div>
                    </div>

                    {/* Goals List */}
                    <div className="space-y-3">
                      {goals.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Target className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>No goals yet. Add your first sustainability goal above!</p>
                        </div>
                      ) : (
                        goals.map((goal) => (
                          <div
                            key={goal.id}
                            className={`p-4 rounded-lg border transition-all ${
                              goal.completed 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleGoalComplete(goal.id)}
                                  className={`p-1 h-6 w-6 rounded-full ${
                                    goal.completed 
                                      ? 'bg-green-500 text-white hover:bg-green-600' 
                                      : 'border-2 border-gray-300 hover:border-gray-500'
                                  }`}
                                >
                                  {goal.completed && <CheckCircle className="h-3 w-3" />}
                                </Button>
                                <div className="flex-1">
                                  <h5 className={`font-medium ${goal.completed ? 'line-through text-green-600' : 'text-gray-900'}`}>
                                    {goal.title}
                                  </h5>
                                  {goal.description && (
                                    <p className={`text-sm mt-1 ${goal.completed ? 'text-green-500' : 'text-gray-600'}`}>
                                      {goal.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      goal.completed 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-eco-100 text-eco-700'
                                    }`}>
                                      Target: {goal.targetValue} {goal.unit}
                                    </span>
                                    <span className="text-xs text-carbon-500">
                                      Progress: {goal.currentValue}/{goal.targetValue} {goal.unit}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteGoal(goal.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

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
                    Refresh Data
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleCalculateEmissions}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Emissions Data
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/insights')}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Insights
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/transactions')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Transaction History
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/coach')}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    AI Eco Coach
                  </Button>
                </CardContent>
              </Card>
            </TiltCard>
          </motion.div>
        </div>

        {/* Goals Overview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <TiltCard>
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-carbon-900 mb-2 flex items-center">
                      <Target className="mr-3 h-6 w-6 text-eco-500" />
                      Your Sustainability Goals
                    </CardTitle>
                    <CardDescription className="text-carbon-600">
                      Track your progress towards a more sustainable lifestyle
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('goals')}
                    className="border-eco-500 text-eco-600 hover:bg-eco-50"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Goal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {goals.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="mx-auto h-16 w-16 text-carbon-300 mb-4" />
                    <h3 className="text-lg font-semibold text-carbon-700 mb-2">No Goals Yet</h3>
                    <p className="text-carbon-500 mb-4">Start your sustainability journey by setting your first goal!</p>
                    <Button
                      onClick={() => setActiveTab('goals')}
                      className="bg-eco-500 hover:bg-eco-600 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Goal
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goals.slice(0, 6).map((goal) => (
                      <div
                        key={goal.id}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                          goal.completed 
                            ? 'bg-green-50 border-green-200 shadow-green-100' 
                            : 'bg-white border-eco-200 hover:border-eco-300 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleGoalComplete(goal.id)}
                              className={`p-1 h-6 w-6 rounded-full ${
                                goal.completed 
                                  ? 'bg-green-500 text-white hover:bg-green-600' 
                                  : 'border-2 border-eco-300 hover:border-eco-500'
                              }`}
                            >
                              {goal.completed && <CheckCircle className="h-3 w-3" />}
                            </Button>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              goal.completed 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-eco-100 text-eco-700'
                            }`}>
                              {goal.category}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteGoal(goal.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                          >
                            ×
                          </Button>
                        </div>
                        
                        <h4 className={`font-semibold mb-2 ${
                          goal.completed ? 'line-through text-green-600' : 'text-carbon-900'
                        }`}>
                          {goal.title}
                        </h4>
                        
                        {goal.description && (
                          <p className={`text-sm mb-3 ${
                            goal.completed ? 'text-green-500' : 'text-carbon-600'
                          }`}>
                            {goal.description}
                          </p>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-carbon-500">Progress</span>
                            <span className="font-medium">
                              {goal.currentValue}/{goal.targetValue} {goal.unit}
                            </span>
                          </div>
                          <div className="w-full bg-carbon-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                goal.completed ? 'bg-green-500' : 'bg-eco-500'
                              }`}
                              style={{
                                width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-carbon-500">
                            {goal.completed 
                              ? '🎉 Goal Achieved!' 
                              : `${Math.round((goal.currentValue / goal.targetValue) * 100)}% Complete`
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {goals.length > 6 && (
                      <div className="p-4 rounded-lg border-2 border-dashed border-eco-300 bg-eco-50 flex items-center justify-center">
                        <div className="text-center">
                          <Target className="mx-auto h-8 w-8 text-eco-400 mb-2" />
                          <p className="text-sm text-eco-600 font-medium">
                            +{goals.length - 6} more goals
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab('goals')}
                            className="mt-2 text-eco-600 hover:text-eco-700"
                          >
                            View All
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TiltCard>
        </motion.div>

        {/* Accounts and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Accounts Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <TiltCard>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5 text-eco-500" />
                    Your Accounts
                  </CardTitle>
                  <CardDescription>
                    Account balances and details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {accountSummary?.accounts.map((account) => (
                    <div key={account._id} className="flex items-center justify-between p-3 bg-eco-50 rounded-lg">
                      <div>
                        <p className="font-medium text-carbon-900">{account.nickname}</p>
                        <p className="text-sm text-carbon-600">{account.type} • {account.account_number}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${account.balance >= 0 ? 'text-carbon-900' : 'text-red-600'}`}>
                          ${account.balance.toLocaleString()}
                        </p>
                        <p className="text-xs text-eco-600">{account.rewards} rewards</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TiltCard>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <TiltCard>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-eco-500" />
                    Recent Transactions
                  </CardTitle>
                  <CardDescription>
                    Latest financial activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {transactionSummary?.recentTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between p-2 bg-eco-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          transaction.type === 'deposit' ? 'bg-green-500' : 
                          transaction.type === 'purchase' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-carbon-900">{transaction.description}</p>
                          <p className="text-xs text-carbon-600">
                            {new Date(transaction.date).toLocaleDateString()} • {transaction.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-carbon-600 capitalize">{transaction.status}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TiltCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
