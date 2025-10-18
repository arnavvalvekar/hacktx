'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, Target, Lightbulb } from 'lucide-react'
import { CarbonData } from '@/types'

interface CarbonInsightsProps {
  carbonData: CarbonData | null
}

export default function CarbonInsights({ carbonData }: CarbonInsightsProps) {
  if (!carbonData) {
    return <div className="text-center py-8">Loading insights...</div>
  }

  // Prepare data for charts
  const weeklyData = carbonData.trends.weekly.map((emissions, index) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
    emissions
  }))

  const monthlyData = carbonData.trends.monthly.map((emissions, index) => ({
    month: `Month ${index + 1}`,
    emissions
  }))

  const pieData = Object.entries(carbonData.categoryBreakdown).map(([category, emissions]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: emissions,
    percentage: ((emissions / carbonData.totalEmissions) * 100).toFixed(1)
  }))

  const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

  // Calculate insights
  const avgWeeklyEmissions = carbonData.trends.weekly.reduce((a, b) => a + b, 0) / 7
  const highestCategory = Object.entries(carbonData.categoryBreakdown).reduce((a, b) => 
    carbonData.categoryBreakdown[a[0]] > carbonData.categoryBreakdown[b[0]] ? a : b
  )

  const getInsights = () => {
    const insights = []
    
    if (carbonData.dailyAverage > 20) {
      insights.push({
        type: 'warning',
        icon: TrendingUp,
        title: 'High Daily Emissions',
        description: 'Your daily average is above the recommended 20 kg CO₂e. Consider reducing high-emission activities.'
      })
    }

    if (highestCategory[1] > carbonData.totalEmissions * 0.4) {
      insights.push({
        type: 'info',
        icon: Target,
        title: `${highestCategory[0].charAt(0).toUpperCase() + highestCategory[0].slice(1)} Dominates`,
        description: `${highestCategory[0]} accounts for ${((highestCategory[1] / carbonData.totalEmissions) * 100).toFixed(1)}% of your emissions.`
      })
    }

    if (carbonData.dailyAverage < 15) {
      insights.push({
        type: 'success',
        icon: TrendingDown,
        title: 'Great Progress!',
        description: 'You\'re maintaining a low carbon footprint. Keep up the sustainable habits!'
      })
    }

    insights.push({
      type: 'tip',
      icon: Lightbulb,
      title: 'Carbon Reduction Tips',
      description: 'Consider carpooling, buying local produce, and reducing air travel to lower your footprint.'
    })

    return insights
  }

  const insights = getInsights()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-carbon-900 mb-2">
          Carbon Insights & Analytics
        </h1>
        <p className="text-carbon-600">
          Deep dive into your carbon footprint patterns and trends
        </p>
      </div>

      {/* Weekly Trend Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-carbon-900 mb-4">
          Weekly Emissions Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)} kg CO₂e`, 'Emissions']}
              labelFormatter={(label) => `Day: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="emissions" 
              stroke="#22c55e" 
              strokeWidth={3}
              dot={{ fill: '#22c55e', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-carbon-900 mb-4">
            Emissions by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)} kg CO₂e`, 'Emissions']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Comparison */}
        <div className="card">
          <h3 className="text-lg font-semibold text-carbon-900 mb-4">
            Monthly Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)} kg CO₂e`, 'Emissions']} />
              <Bar dataKey="emissions" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="card">
        <h3 className="text-lg font-semibold text-carbon-900 mb-4">
          Personalized Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon
            const getInsightColor = (type: string) => {
              switch (type) {
                case 'warning': return 'border-red-200 bg-red-50'
                case 'success': return 'border-green-200 bg-green-50'
                case 'info': return 'border-blue-200 bg-blue-50'
                case 'tip': return 'border-yellow-200 bg-yellow-50'
                default: return 'border-gray-200 bg-gray-50'
              }
            }
            
            return (
              <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                <div className="flex items-start space-x-3">
                  <IconComponent className="h-5 w-5 text-carbon-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-carbon-900">{insight.title}</h4>
                    <p className="text-sm text-carbon-600 mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <h4 className="text-sm font-medium text-carbon-600 mb-2">Average Weekly</h4>
          <p className="text-2xl font-bold text-carbon-900">
            {(avgWeeklyEmissions * 7).toFixed(1)} kg CO₂e
          </p>
        </div>
        <div className="card text-center">
          <h4 className="text-sm font-medium text-carbon-600 mb-2">Highest Category</h4>
          <p className="text-2xl font-bold text-carbon-900 capitalize">
            {highestCategory[0]}
          </p>
          <p className="text-sm text-carbon-600">
            {highestCategory[1].toFixed(1)} kg CO₂e
          </p>
        </div>
        <div className="card text-center">
          <h4 className="text-sm font-medium text-carbon-600 mb-2">Annual Projection</h4>
          <p className="text-2xl font-bold text-carbon-900">
            {(carbonData.monthlyProjection * 12).toFixed(0)} kg CO₂e
          </p>
        </div>
      </div>
    </div>
  )
}

