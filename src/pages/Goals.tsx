import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TiltCard } from '@/components/TiltCard'
import { useApiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Target, Trophy, TrendingDown, Calendar, Award, CheckCircle, RefreshCw } from 'lucide-react'

export default function Goals() {
  const apiClient = useApiClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [goals, setGoals] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      setIsLoading(true)
      // Connect to backend API endpoint as specified in architecture
      const response = await apiClient.get('/api/goals')
      setGoals(response.data.data?.goals || [])
      setBadges(response.data.data?.badges || [])
    } catch (error) {
      console.error('Error loading goals:', error)
      toast({
        title: "Error",
        description: "Failed to load goals data",
        variant: "destructive"
      })
      // Fallback to mock data
      setGoals(mockGoals)
      setBadges(mockBadges)
    } finally {
      setIsLoading(false)
    }
  }

  const mockGoals = [
    {
      id: 1,
      title: "Reduce Carbon Footprint",
      description: "Decrease monthly emissions by 20%",
      target: "20%",
      current: "15%",
      deadline: "2024-12-31",
      status: "in-progress",
      badge: "Carbon Crusher"
    },
    {
      id: 2,
      title: "Sustainable Transportation",
      description: "Use public transport or bike for 80% of trips",
      target: "80%",
      current: "65%",
      deadline: "2024-11-30",
      status: "in-progress",
      badge: "Eco Traveler"
    },
    {
      id: 3,
      title: "Green Shopping",
      description: "Purchase eco-friendly products for 90% of purchases",
      target: "90%",
      current: "90%",
      deadline: "2024-10-31",
      status: "completed",
      badge: "Green Shopper"
    }
  ]

  const mockBadges = [
    { name: "Carbon Crusher", icon: Target, earned: true },
    { name: "Eco Traveler", icon: Award, earned: true },
    { name: "Green Shopper", icon: Trophy, earned: true },
    { name: "Sustainability Master", icon: CheckCircle, earned: false },
    { name: "Eco Warrior", icon: TrendingDown, earned: false }
  ]

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
            Sustainability Goals
          </h1>
          <p className="text-carbon-600 text-lg">
            Track your progress and earn badges for your eco-friendly achievements
          </p>
        </motion.div>

        {/* Goals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {isLoading ? (
            <div className="col-span-2 flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 text-eco-500 animate-spin" />
              <span className="ml-2 text-carbon-600">Loading goals...</span>
            </div>
          ) : (
            goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <TiltCard>
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-eco-500" />
                        {goal.title}
                      </CardTitle>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        goal.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    <CardDescription>{goal.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-carbon-600">Progress</span>
                        <span className="text-sm font-medium">{goal.current} / {goal.target}</span>
                      </div>
                      <div className="w-full bg-carbon-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-eco-500 to-eco-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: goal.status === 'completed' ? '100%' : `${parseInt(goal.current)}%` 
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm text-carbon-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          <span>{goal.badge}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TiltCard>
            </motion.div>
            ))
          )}
        </div>

        {/* Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <TiltCard>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-eco-500" />
                  Achievement Badges
                </CardTitle>
                <CardDescription>
                  Unlock badges by completing sustainability goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {badges.map((badge, index) => (
                    <motion.div
                      key={badge.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`text-center p-4 rounded-lg transition-all duration-300 ${
                        badge.earned 
                          ? 'bg-gradient-to-br from-eco-100 to-eco-200 border-2 border-eco-300' 
                          : 'bg-carbon-100 border-2 border-carbon-200 opacity-50'
                      }`}
                    >
                      <badge.icon className={`h-8 w-8 mx-auto mb-2 ${
                        badge.earned ? 'text-eco-600' : 'text-carbon-400'
                      }`} />
                      <p className={`text-sm font-medium ${
                        badge.earned ? 'text-eco-800' : 'text-carbon-500'
                      }`}>
                        {badge.name}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TiltCard>
        </motion.div>

        {/* Create New Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <TiltCard>
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="h-12 w-12 text-eco-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-carbon-900 mb-2">
                    Set New Goal
                  </h3>
                  <p className="text-carbon-600 mb-4">
                    Create a new sustainability goal to track your progress
                  </p>
                  <Button className="bg-eco-500 hover:bg-eco-600">
                    Create Goal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TiltCard>
        </motion.div>
      </div>
    </div>
  )
}
