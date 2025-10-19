import { useState, useEffect } from 'react'
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
  BarChart3,
  Play
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
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Leaf className="h-8 w-8 text-eco-600" />
              <span className="text-2xl font-bold text-gray-900">EcoFin</span>
            </button>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-eco-600 transition-colors font-medium">Features</a>
              <a href="#mission" className="text-gray-600 hover:text-eco-600 transition-colors font-medium">Mission</a>
            </div>
            <button
              onClick={() => {
                console.log('Get Started button clicked, navigating to login...')
                navigate('/login')
              }}
              className="bg-gradient-to-r from-eco-500 to-eco-600 hover:from-eco-400 hover:to-eco-500 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-eco-500/25 font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-20 bg-gradient-to-br from-eco-800 via-eco-700 to-carbon-800 relative overflow-hidden min-h-screen flex items-center">
        {/* Darker Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-eco-900/20 to-carbon-900/20"></div>
        
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-eco-600/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-32 right-20 w-48 h-48 bg-carbon-600/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-eco-700/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-carbon-700/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-eco-500/30 rounded-full blur-2xl animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-carbon-500/30 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        </div>

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="space-y-8">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-eco-600/20 backdrop-blur-sm border border-eco-500/30 rounded-full px-4 py-2 text-eco-200 text-sm font-medium"
                >
                  <Leaf className="h-4 w-4" />
                  <span>Making Finance Sustainable</span>
                </motion.div>

                <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight">
                  Your Smart
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-eco-300 to-eco-100 block">
                    Carbon Tracker
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-200 leading-relaxed max-w-2xl">
                  <TypewriterText 
                    text="Transform your spending into positive environmental impact. Track your carbon footprint automatically and make sustainable financial decisions with confidence." 
                    delay={30} 
                  />
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  onClick={() => {
                    console.log('Button clicked, navigating to login...')
                    navigate('/login')
                  }}
                  className="group bg-gradient-to-r from-eco-500 to-eco-600 hover:from-eco-400 hover:to-eco-500 text-white px-10 py-5 text-lg rounded-xl flex items-center gap-3 transition-all duration-300 shadow-2xl hover:shadow-eco-500/25 hover:scale-105"
                >
                  <span className="font-semibold">Try EcoFin Free</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-5 text-lg rounded-xl flex items-center gap-3 transition-all duration-300"
                >
                  <Play className="h-5 w-5" />
                  <span>Watch Demo</span>
                </motion.button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex items-center gap-8 text-sm text-gray-300"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-eco-400" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-eco-400" />
                  <span>No setup required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-eco-400" />
                  <span>Secure & private</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Floating Card with Enhanced Design */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-eco-500/20 to-carbon-500/20 rounded-3xl blur-2xl"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-eco-500 to-eco-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Leaf className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Carbon Impact</h3>
                        <p className="text-sm text-gray-500">This month</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                        <div className="text-3xl font-bold text-green-700">-15%</div>
                        <div className="text-sm text-green-600 font-medium">vs last month</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                        <div className="text-3xl font-bold text-blue-700">A+</div>
                        <div className="text-sm text-blue-600 font-medium">Sustainability grade</div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Transportation</span>
                          <span className="text-sm font-bold text-gray-900">2.3 kg CO₂</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full shadow-sm" style={{ width: '40%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Food & Dining</span>
                          <span className="text-sm font-bold text-gray-900">1.8 kg CO₂</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full shadow-sm" style={{ width: '30%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Shopping</span>
                          <span className="text-sm font-bold text-gray-900">1.2 kg CO₂</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full shadow-sm" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Impact</span>
                        <span className="font-bold text-gray-900">5.3 kg CO₂</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-eco-400 rounded-full animate-float"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-carbon-400 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-gradient-to-br from-eco-50 via-carbon-50 to-eco-100 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-eco-600/5 to-carbon-600/5"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-32 h-32 bg-eco-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-carbon-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-eco-500/20 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              What's the Problem
            </h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              More than 67% of global greenhouse gas emissions are linked to consumer spending, 
              yet most people have no idea how their purchases impact the environment.
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
           {[
             {
               icon: AlertTriangle,
               title: '67% of emissions',
               description: 'Linked to unaware consumer spending',
               color: 'text-gray-700',
               bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
               border: 'border-gray-200',
               circleBg: 'bg-gradient-to-br from-eco-500 to-eco-600',
               iconColor: 'text-white'
             },
             {
               icon: Eye,
               title: 'No visibility',
               description: 'Consumers can\'t track their carbon footprint',
               color: 'text-gray-700',
               bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
               border: 'border-gray-200',
               circleBg: 'bg-gradient-to-br from-carbon-500 to-carbon-600',
               iconColor: 'text-white'
             },
             {
               icon: Target,
               title: 'Hard to act',
               description: 'Spending data disconnected from environmental impact',
               color: 'text-gray-700',
               bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
               border: 'border-gray-200',
               circleBg: 'bg-gradient-to-br from-eco-600 to-carbon-600',
               iconColor: 'text-white'
             }
           ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center max-w-sm"
              >
                {/* Large Circle */}
                <div className={`w-32 h-32 ${item.circleBg} rounded-full flex items-center justify-center mb-6 shadow-2xl relative`}>
                  <item.icon className={`h-12 w-12 ${item.iconColor}`} />
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/30 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>

                {/* Content Card */}
                <div className={`${item.bg} ${item.border} border-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                  <h3 className={`text-2xl font-bold ${item.color} mb-3`}>{item.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{item.description}</p>
                </div>

                {/* Connecting Line (hidden on mobile) */}
                {index < 2 && (
                  <div className="hidden lg:block absolute top-16 left-full w-16 h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 transform translate-x-8"></div>
                )}
              </motion.div>
            ))}
          </div>

        
        </div>
      </section>

      {/* Why EcoFin Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-carbon-50 via-eco-50 to-carbon-100 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-carbon-600/5 to-eco-600/5"></div>
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 right-20 w-40 h-40 bg-carbon-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-eco-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/3 w-24 h-24 bg-carbon-500/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-eco-500/20 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Why EcoFin
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Our platform automatically tracks your carbon footprint and provides 
              personalized insights to help you reduce your environmental impact.
            </p>
          </motion.div>

          {/* Main Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column - Primary Features */}
            <div className="space-y-8">
              {[
                {
                  icon: Zap,
                  title: 'Automated Tracking',
                  description: 'Instantly see the CO₂ impact of your spending with no manual input required.',
                  color: 'text-gray-700',
                  bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
                  border: 'border-gray-200',
                  circleBg: 'bg-gradient-to-br from-eco-500 to-eco-600',
                  iconColor: 'text-white'
                },
                {
                  icon: Shield,
                  title: 'Secure Bank Integration',
                  description: 'Connect safely through the Nessie API to analyze your real transactions.',
                  color: 'text-gray-700',
                  bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
                  border: 'border-gray-200',
                  circleBg: 'bg-gradient-to-br from-carbon-500 to-carbon-600',
                  iconColor: 'text-white'
                },
                {
                  icon: Brain,
                  title: 'Smart Insights',
                  description: 'Get personalized breakdowns of which purchases contribute most to your footprint.',
                  color: 'text-gray-700',
                  bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
                  border: 'border-gray-200',
                  circleBg: 'bg-gradient-to-br from-eco-600 to-carbon-600',
                  iconColor: 'text-white'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-6"
                >
                  {/* Icon Circle */}
                  <div className={`w-16 h-16 ${feature.circleBg} rounded-full flex items-center justify-center shadow-lg flex-shrink-0 relative`}>
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Content */}
                  <div className={`${feature.bg} ${feature.border} border-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex-1`}>
                    <h3 className={`text-xl font-bold ${feature.color} mb-3`}>{feature.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right Column - Secondary Features */}
            <div className="space-y-8">
              {[
                {
                  icon: Lightbulb,
                  title: 'Actionable Tips',
                  description: 'Discover greener alternatives and ways to offset your emissions.',
                  color: 'text-gray-700',
                  bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
                  border: 'border-gray-200',
                  circleBg: 'bg-gradient-to-br from-eco-500 to-carbon-500',
                  iconColor: 'text-white'
                },
                {
                  icon: BarChart3,
                  title: 'Visual Dashboard',
                  description: 'Interactive charts help you visualize your carbon impact over time.',
                  color: 'text-gray-700',
                  bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
                  border: 'border-gray-200',
                  circleBg: 'bg-gradient-to-br from-carbon-500 to-carbon-600',
                  iconColor: 'text-white'
                },
                {
                  icon: Award,
                  title: 'Achievement System',
                  description: 'Earn badges and streaks for lowering your emissions each month.',
                  color: 'text-gray-700',
                  bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
                  border: 'border-gray-200',
                  circleBg: 'bg-gradient-to-br from-eco-600 to-eco-700',
                  iconColor: 'text-white'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-6"
                >
                  {/* Icon Circle */}
                  <div className={`w-16 h-16 ${feature.circleBg} rounded-full flex items-center justify-center shadow-lg flex-shrink-0 relative`}>
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Content */}
                  <div className={`${feature.bg} ${feature.border} border-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex-1`}>
                    <h3 className={`text-xl font-bold ${feature.color} mb-3`}>{feature.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-8 py-4 shadow-xl">
              <Leaf className="h-6 w-6 text-eco-600" />
              <span className="text-gray-800 font-semibold text-lg">
                Making sustainable finance <span className="text-eco-600 font-bold">accessible to everyone</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-gradient-to-br from-eco-50 via-carbon-50 to-eco-100 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-eco-600/5 to-carbon-600/5"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-32 h-32 bg-eco-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-carbon-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-eco-500/20 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-eco-500 to-eco-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-8">Our Mission</h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                At <strong className="text-eco-600">EcoFin</strong>, we believe that every purchase has an environmental cost. 
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
            
            {/* Bottom Stats */}
            <div className="mt-12 flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg">
                <div className="w-3 h-3 bg-eco-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Sustainable Finance</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg">
                <div className="w-3 h-3 bg-carbon-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Carbon Tracking</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Climate Action</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-eco-700 via-eco-600 to-eco-800 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-eco-800/20 to-carbon-800/20"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to make every dollar count?
            </h2>
            <p className="text-xl text-green-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join us who are already reducing their carbon footprint 
              while improving their financial health.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-white text-eco-700 hover:bg-gray-50 px-10 py-5 text-lg font-semibold shadow-2xl hover:shadow-white/25 hover:scale-105 transition-all duration-300"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
            </div>
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

