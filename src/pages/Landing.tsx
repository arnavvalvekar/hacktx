import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { 
  Leaf, 
  Zap, 
  Shield,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Target,
  Award,
  Eye,
  Brain,
  Heart,
  Lightbulb,
  TrendingUp,
  BarChart3,
  Globe,
  Users,
  Star,
  Play,
  Menu,
  X
} from 'lucide-react'

// Typewriter effect component
const TypewriterText = ({ text, delay = 50 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, delay)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, delay])

  return (
    <span>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Leaf className="h-8 w-8 text-eco-500" />
              <span className="text-2xl font-bold text-gray-900">EcoFin</span>
            </button>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-eco-500 transition-colors">Features</a>
              <a href="#mission" className="text-gray-600 hover:text-eco-500 transition-colors">Mission</a>
            </div>
            <button
              onClick={() => {
                console.log('Get Started button clicked, navigating to login...')
                navigate('/login')
              }}
              className="bg-eco-500 hover:bg-eco-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
    <section className="pt-20 pb-16 bg-gradient-to-br from-eco-200 via-carbon-200 to-eco-300 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-eco-600/15 to-carbon-600/15"></div>
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-10 left-10 w-20 h-20 bg-eco-600/25 rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-carbon-600/25 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-eco-700/25 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 right-1/3 w-16 h-16 bg-carbon-700/25 rounded-full blur-xl"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Your Smart
                  <span className="text-eco-500 block">Carbon Tracker</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  <TypewriterText 
                    text="Transform your spending into positive environmental impact. Track your carbon footprint automatically and make sustainable financial decisions with confidence." 
                    delay={30} 
                  />
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    console.log('Button clicked, navigating to login...')
                    navigate('/login')
                  }}
                  className="bg-eco-500 hover:bg-eco-600 text-white px-8 py-4 text-lg rounded-lg flex items-center gap-2 transition-colors"
                >
                  Try EcoFin Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No setup required</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Secure & private</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-eco-500 rounded-full flex items-center justify-center">
                      <Leaf className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Carbon Impact</h3>
                      <p className="text-sm text-gray-500">This month</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">-15%</div>
                      <div className="text-sm text-green-700">vs last month</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">A+</div>
                      <div className="text-sm text-blue-700">Sustainability grade</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Transportation</span>
                      <span className="text-sm font-medium text-gray-900">2.3 kg CO₂</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Food & Dining</span>
                      <span className="text-sm font-medium text-gray-900">1.8 kg CO₂</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Shopping</span>
                      <span className="text-sm font-medium text-gray-900">1.2 kg CO₂</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              The Hidden Cost of Every Purchase
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              More than 67% of global greenhouse gas emissions are linked to consumer spending, 
              yet most people have no idea how their purchases impact the environment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: AlertTriangle,
                title: '67% of emissions',
                description: 'Linked to unaware consumer spending',
                color: 'text-red-500',
                bg: 'bg-red-50'
              },
              {
                icon: Eye,
                title: 'No visibility',
                description: 'Consumers can\'t track their carbon footprint',
                color: 'text-orange-500',
                bg: 'bg-orange-50'
              },
              {
                icon: Target,
                title: 'Hard to act',
                description: 'Spending data disconnected from environmental impact',
                color: 'text-yellow-500',
                bg: 'bg-yellow-50'
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`${item.bg} rounded-2xl p-8 text-center`}
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <item.icon className={`h-8 w-8 ${item.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Everything you need to make sustainable choices
            </h2>
            <p className="text-xl text-gray-600">
              Our platform automatically tracks your carbon footprint and provides 
              personalized insights to help you reduce your environmental impact.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Automated Tracking',
                description: 'Instantly see the CO₂ impact of your spending with no manual input required.',
                color: 'text-blue-500'
              },
              {
                icon: Shield,
                title: 'Secure Bank Integration',
                description: 'Connect safely through the Nessie API to analyze your real transactions.',
                color: 'text-green-500'
              },
              {
                icon: Brain,
                title: 'Smart Insights',
                description: 'Get personalized breakdowns of which purchases contribute most to your footprint.',
                color: 'text-purple-500'
              },
              {
                icon: Lightbulb,
                title: 'Actionable Tips',
                description: 'Discover greener alternatives and ways to offset your emissions.',
                color: 'text-yellow-500'
              },
              {
                icon: BarChart3,
                title: 'Visual Dashboard',
                description: 'Interactive charts help you visualize your carbon impact over time.',
                color: 'text-indigo-500'
              },
              {
                icon: Award,
                title: 'Achievement System',
                description: 'Earn badges and streaks for lowering your emissions each month.',
                color: 'text-red-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <feature.icon className={`h-12 w-12 ${feature.color} mb-6`} />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-white">
        <div className="container mx-auto px-4">
            <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="w-20 h-20 bg-eco-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Our Mission</h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                At <strong>EcoFin</strong>, we believe that every purchase has an environmental cost. 
                Our mission is to bridge the gap between finance and sustainability by creating 
                an empowering platform that helps individuals understand the true impact of their spending.
              </p>
              <p>
                We make carbon tracking simple, transparent, and accessible—turning everyday 
                purchases into opportunities for positive climate action.
              </p>
              <p>
                By fostering awareness, providing actionable insights, and gamifying sustainable choices, 
                EcoFin helps users take control of their carbon footprint and contribute to a greener, 
                more conscious world.
              </p>
              </div>
            </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-eco-500">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to make every dollar count?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already reducing their carbon footprint 
              while improving their financial health.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-white text-eco-500 hover:bg-gray-50 px-8 py-4 text-lg"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
            <Leaf className="h-6 w-6 text-eco-500" />
            <span className="text-xl font-bold">EcoFin Carbon</span>
          </div>
              <p className="text-gray-400">
                Built for Capital One Hackathon | HackTX 2024
              </p>
              <p className="text-gray-400 mt-2">
                Bridging finance and sustainability for a greener future.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <div className="space-y-2">
                <a href="#features" className="block text-gray-400 hover:text-white">Features</a>
                <a href="#" className="block text-gray-400 hover:text-white">API</a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <div className="space-y-2">
                <a href="#mission" className="block text-gray-400 hover:text-white">Mission</a>
                <a href="#" className="block text-gray-400 hover:text-white">About</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2024 EcoFin. Built for Capital One Hackathon. Making sustainable finance accessible to everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

