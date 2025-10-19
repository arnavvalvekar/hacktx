import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TiltCard } from '@/components/TiltCard'
import { Button } from '@/components/ui/button'
import { useApiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, BarChart3, PieChart, RefreshCw, Leaf, Target, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { nessieService } from '@/services/nessieService'
import type { CarbonFootprintData, AccountSummary, TransactionSummary } from '@/types/nessieTypes'

export default function Insights() {
  const apiClient = useApiClient()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [carbonData, setCarbonData] = useState<CarbonFootprintData[]>([])
  const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(null)
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary | null>(null)

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    try {
      setIsLoading(true)
      
      // Load Nessie mock data for insights
      const carbonFootprintData = nessieService.getCarbonFootprintData()
      const accountData = nessieService.getAccountSummary()
      const transactionData = nessieService.getTransactionSummary()
      
      setCarbonData(carbonFootprintData)
      setAccountSummary(accountData)
      setTransactionSummary(transactionData)
      
    } catch (error) {
      console.error('Error loading insights:', error)
      toast({
        title: "Error",
        description: "Failed to load insights data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate insights from carbon data
  const totalCarbonFootprint = carbonData.reduce((total, data) => total + data.carbonFootprint, 0)
  const categoryBreakdown = carbonData.reduce((acc, data) => {
    const category = data.category[0] || 'Other'
    acc[category] = (acc[category] || 0) + data.carbonFootprint
    return acc
  }, {} as Record<string, number>)

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  const averageCarbonPerTransaction = carbonData.length > 0 ? totalCarbonFootprint / carbonData.length : 0
  const totalSpent = carbonData.reduce((total, data) => total + data.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 to-carbon-50 p-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-carbon-900 mb-2">
                Carbon Insights
              </h1>
              <p className="text-carbon-600 text-lg">
                Deep dive into your carbon footprint patterns and trends
              </p>
            </div>
          </div>
        </motion.div>

        <TiltCard>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-eco-500" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadInsights}
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
                    <p className="text-carbon-600">Loading insights...</p>
                  </div>
                </div>
              ) : carbonData.length > 0 ? (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white p-4 rounded-lg border border-carbon-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="h-5 w-5 text-eco-500" />
                        <span className="font-medium">Total Carbon Footprint</span>
                      </div>
                      <p className="text-2xl font-bold text-carbon-900">{totalCarbonFootprint.toFixed(2)} kg CO₂</p>
                      <p className="text-sm text-carbon-600">From {carbonData.length} transactions</p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white p-4 rounded-lg border border-carbon-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-5 w-5 text-eco-500" />
                        <span className="font-medium">Average per Transaction</span>
                      </div>
                      <p className="text-2xl font-bold text-carbon-900">{averageCarbonPerTransaction.toFixed(2)} kg CO₂</p>
                      <p className="text-sm text-carbon-600">Per transaction</p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white p-4 rounded-lg border border-carbon-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <PieChart className="h-5 w-5 text-eco-500" />
                        <span className="font-medium">Categories</span>
                      </div>
                      <p className="text-2xl font-bold text-carbon-900">{Object.keys(categoryBreakdown).length}</p>
                      <p className="text-sm text-carbon-600">Different categories</p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white p-4 rounded-lg border border-carbon-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-eco-500" />
                        <span className="font-medium">Total Spent</span>
                      </div>
                      <p className="text-2xl font-bold text-carbon-900">${totalSpent.toFixed(2)}</p>
                      <p className="text-sm text-carbon-600">On tracked purchases</p>
                    </motion.div>
                  </div>

                  {/* Top Categories */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold text-carbon-900 mb-4">Top Carbon Categories</h3>
                    <div className="space-y-3">
                      {topCategories.map(([category, carbon], index) => (
                        <div key={category} className="bg-white p-4 rounded-lg border border-carbon-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-eco-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-eco-600">{index + 1}</span>
                              </div>
                              <div>
                                <p className="font-medium text-carbon-900">{category}</p>
                                <p className="text-sm text-carbon-600">
                                  {((carbon / totalCarbonFootprint) * 100).toFixed(1)}% of total footprint
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-carbon-900">{carbon.toFixed(2)} kg CO₂</p>
                              <p className="text-sm text-eco-600">Carbon footprint</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Recommendations */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h3 className="text-lg font-semibold text-carbon-900 mb-4">Sustainability Recommendations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-800">Good Practices</span>
                        </div>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Shopping at organic food stores</li>
                          <li>• Using public transportation</li>
                          <li>• Supporting local businesses</li>
                        </ul>
                      </div>
                      
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                          <span className="font-medium text-amber-800">Areas for Improvement</span>
                        </div>
                        <ul className="text-sm text-amber-700 space-y-1">
                          <li>• Reduce gas station visits</li>
                          <li>• Consider carpooling options</li>
                          <li>• Explore eco-friendly alternatives</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-eco-100 to-eco-200 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-eco-500 mx-auto mb-4" />
                    <p className="text-carbon-600">No insights available</p>
                    <p className="text-sm text-carbon-500">Complete some transactions to see insights</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TiltCard>
      </div>

      {/* Professional Back Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}

