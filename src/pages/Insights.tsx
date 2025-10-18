import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TiltCard } from '@/components/TiltCard'
import { TrendingUp } from 'lucide-react'

export default function Insights() {
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
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-eco-100 to-eco-200 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 text-eco-500 mx-auto mb-4" />
                  <p className="text-carbon-600">Insights & Analytics</p>
                  <p className="text-sm text-carbon-500">Coming Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TiltCard>
      </div>
    </div>
  )
}

