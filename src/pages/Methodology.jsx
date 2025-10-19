import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TiltCard } from '@/components/TiltCard'
import { Leaf, Calculator, TrendingUp, Target, Info } from 'lucide-react'

export default function Methodology() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 to-carbon-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-carbon-900 mb-2">
            Methodology
          </h1>
          <p className="text-carbon-600 text-lg">
            How we estimate your carbon footprint from financial transactions
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Overview */}
          <TiltCard>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-eco-500" />
                  Overview
                </CardTitle>
                <CardDescription>
                  Our approach to carbon footprint estimation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-carbon-700">
                  For this application, we estimate CO₂e emissions by mapping each transaction to a category 
                  (via MCC or manual tagging) and multiplying the spend amount by a category-specific 
                  emission factor (kgCO₂e per $). If the category is unknown, we use a general spend factor.
                </p>
                <p className="text-carbon-700">
                  Each transaction displays its estimation method and confidence level to provide transparency 
                  about the accuracy of our calculations.
                </p>
                <div className="bg-eco-50 p-4 rounded-lg border border-eco-200">
                  <p className="text-sm text-eco-800 font-medium mb-2">Production Implementation</p>
                  <p className="text-sm text-eco-700">
                    In production, replace the estimator with a real carbon data provider 
                    (e.g., Climatiq, Connect.Earth) and attach provenance IDs & uncertainty ranges.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TiltCard>

          {/* Emission Factors */}
          <TiltCard>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-eco-500" />
                  Emission Factors
                </CardTitle>
                <CardDescription>
                  CO₂e per dollar spent by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { category: "Restaurant", factor: "0.80", description: "Food service & dining" },
                    { category: "Grocery", factor: "0.45", description: "Supermarkets & food stores" },
                    { category: "Fashion", factor: "1.60", description: "Clothing & apparel" },
                    { category: "Electronics", factor: "0.70", description: "Tech & gadgets" },
                    { category: "Transport", factor: "2.50", description: "Gas, rideshare, transit" },
                    { category: "Travel", factor: "3.20", description: "Flights, hotels, tourism" },
                    { category: "Entertainment", factor: "0.55", description: "Movies, events, games" },
                    { category: "Utilities", factor: "0.30", description: "Electricity, water, gas" },
                    { category: "General", factor: "0.35", description: "Default for unknown categories" },
                  ].map((item, index) => (
                    <div key={item.category} className="flex justify-between items-center p-3 bg-white rounded-lg border border-carbon-200">
                      <div>
                        <p className="font-medium text-carbon-900">{item.category}</p>
                        <p className="text-sm text-carbon-600">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-eco-600">{item.factor} kg/$</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TiltCard>

          {/* Eco Score */}
          <TiltCard>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-eco-500" />
                  Eco Score Calculation
                </CardTitle>
                <CardDescription>
                  How we calculate your sustainability score (0-100)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-carbon-700">
                  The Eco Score blends four key metrics to provide a comprehensive sustainability rating:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      metric: "Carbon Intensity", 
                      weight: "50%", 
                      description: "kg CO₂e per $ spent (lower is better)",
                      details: "Baseline range: 0.3-1.5 kg/$ → 0-100 score"
                    },
                    { 
                      metric: "Month-over-Month Improvement", 
                      weight: "30%", 
                      description: "Reduction in emissions vs last month",
                      details: "Positive % change = better score"
                    },
                    { 
                      metric: "Category Mix", 
                      weight: "10%", 
                      description: "Rewards sustainable spending patterns",
                      details: "Bonus: Grocery, Utilities, Entertainment. Penalty: Travel, Transport, Fashion"
                    },
                    { 
                      metric: "Low-Carbon Streak", 
                      weight: "10%", 
                      description: "Consecutive days with ≤6kg daily emissions",
                      details: "Each day = +10 points (max 100)"
                    },
                  ].map((item, index) => (
                    <div key={item.metric} className="p-4 bg-white rounded-lg border border-carbon-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-carbon-900">{item.metric}</h4>
                        <span className="text-sm font-bold text-eco-600 bg-eco-100 px-2 py-1 rounded">
                          {item.weight}
                        </span>
                      </div>
                      <p className="text-sm text-carbon-700 mb-2">{item.description}</p>
                      <p className="text-xs text-carbon-600">{item.details}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TiltCard>

          {/* MCC Mapping */}
          <TiltCard>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-eco-500" />
                  MCC to Category Mapping
                </CardTitle>
                <CardDescription>
                  How we categorize transactions using Merchant Category Codes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { mcc: "5812", category: "Restaurant", description: "Eating places and restaurants" },
                    { mcc: "5411", category: "Grocery", description: "Grocery stores, supermarkets" },
                    { mcc: "5651", category: "Fashion", description: "Clothing stores" },
                    { mcc: "5732", category: "Electronics", description: "Electronics stores" },
                    { mcc: "4111", category: "Transport", description: "Transportation services" },
                    { mcc: "4511", category: "Travel", description: "Airlines, air carriers" },
                    { mcc: "7999", category: "Entertainment", description: "Recreation services" },
                    { mcc: "4900", category: "Utilities", description: "Utilities" },
                  ].map((item, index) => (
                    <div key={item.mcc} className="flex justify-between items-center p-3 bg-white rounded-lg border border-carbon-200">
                      <div>
                        <p className="font-medium text-carbon-900">MCC {item.mcc}</p>
                        <p className="text-sm text-carbon-600">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-eco-100 text-eco-700 rounded text-sm font-medium">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TiltCard>

          {/* Limitations */}
          <TiltCard>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-eco-500" />
                  Limitations & Future Improvements
                </CardTitle>
                <CardDescription>
                  Current constraints and planned enhancements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">Current Limitations</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Spend-based factors are simplified approximations</li>
                      <li>• No consideration for geographic variations in emission factors</li>
                      <li>• Limited MCC coverage (only major categories)</li>
                      <li>• No real-time carbon intensity data</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Planned Improvements</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Integration with real carbon data providers (Climatiq, Connect.Earth)</li>
                      <li>• Geographic-specific emission factors</li>
                      <li>• Enhanced MCC mapping with subcategories</li>
                      <li>• Real-time carbon intensity updates</li>
                      <li>• Uncertainty quantification and confidence intervals</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TiltCard>
        </div>
      </div>
    </div>
  )
}