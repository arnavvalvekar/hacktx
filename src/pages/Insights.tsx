import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TiltCard } from '@/components/TiltCard'
import { Button } from '@/components/ui/button'
import { useApiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { TrendingUp, BarChart3, PieChart, RefreshCw } from 'lucide-react'

export default function Insights() {
  const apiClient = useApiClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [insights, setInsights] = useState<any>(null)

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    try {
      setIsLoading(true)
      // Connect to backend API endpoint as specified in architecture
      const response = await apiClient.get('/api/emissions/aggregate')
      setInsights(response.data.data || null)
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
            Carbon Insights
          </h1>
          <p className="text-carbon-600 text-lg">
            Deep dive into your carbon footprint patterns and trends
          </p>
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
              ) : insights ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-carbon-200">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-eco-500" />
                      <span className="font-medium">Total Emissions</span>
                    </div>
                    <p className="text-2xl font-bold text-carbon-900">{insights.total_emissions || '0.00'} kg CO₂</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-carbon-200">
                    <div className="flex items-center gap-2 mb-2">
                      <PieChart className="h-5 w-5 text-eco-500" />
                      <span className="font-medium">Categories</span>
                    </div>
                    <p className="text-2xl font-bold text-carbon-900">{insights.categories?.length || 0}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-carbon-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-eco-500" />
                      <span className="font-medium">Trend</span>
                    </div>
                    <p className="text-2xl font-bold text-carbon-900">{insights.trend || 'Stable'}</p>
                  </div>
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
    </div>
  )
}

