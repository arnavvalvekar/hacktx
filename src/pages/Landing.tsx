import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { HeroParallax } from '@/components/HeroParallax'
import { TiltCard } from '@/components/TiltCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Leaf, 
  TrendingDown, 
  Zap, 
  Globe, 
  BarChart3, 
  Users, 
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()
  const features = [
    {
      icon: BarChart3,
      title: 'Real-time Carbon Tracking',
      description: 'Calculate CO₂ emissions for every transaction using our hybrid estimation engine.',
      color: 'text-blue-500'
    },
    {
      icon: Zap,
      title: 'Capital One Integration',
      description: 'Seamlessly sync with your Capital One accounts via the Nessie API.',
      color: 'text-yellow-500'
    },
    {
      icon: Globe,
      title: 'AI-Powered Insights',
      description: 'Get personalized recommendations to reduce your environmental impact.',
      color: 'text-green-500'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join a community of environmentally conscious individuals making a difference.',
      color: 'text-purple-500'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data is protected with enterprise-grade security.',
      color: 'text-red-500'
    },
    {
      icon: TrendingDown,
      title: 'Track Progress',
      description: 'Monitor your carbon footprint reduction over time with detailed analytics.',
      color: 'text-indigo-500'
    }
  ]

  const benefits = [
    'Reduce your carbon footprint by up to 30%',
    'Save money while saving the planet',
    'Get personalized eco-friendly recommendations',
    'Track your environmental impact in real-time',
    'Join a community of sustainable spenders'
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroParallax />

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-carbon-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-carbon-900 mb-6">
              Why Choose <span className="gradient-text">EcoFin Carbon</span>?
            </h2>
            <p className="text-xl text-carbon-600 max-w-3xl mx-auto">
              We combine cutting-edge technology with environmental science to help you make 
              informed financial decisions that benefit both your wallet and the planet.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <TiltCard className="h-full">
                  <Card className="h-full glass-card hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-white to-eco-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-carbon-900 mb-6">
                Make Every Dollar <span className="gradient-text">Count</span>
              </h2>
              <p className="text-xl text-carbon-600 mb-8 leading-relaxed">
                Transform your spending habits into positive environmental impact. 
                Our platform helps you understand the carbon cost of your purchases 
                and guides you toward more sustainable choices.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-6 w-6 text-eco-500 flex-shrink-0" />
                    <span className="text-carbon-700 text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <TiltCard>
                <Card className="glass-card p-8">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-eco-500 to-eco-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Leaf className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-carbon-900 mb-4">
                      Start Your Journey Today
                    </h3>
                    <p className="text-carbon-600 mb-6">
                      Join thousands of users who are already reducing their carbon footprint 
                      while improving their financial health.
                    </p>
                    <Button
                      size="lg"
                      variant="eco"
                      className="w-full"
                      onClick={() => navigate('/login')}
                    >
                      Get Started Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-eco-500 to-eco-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Make a <span className="text-eco-100">Difference</span>?
            </h2>
            <p className="text-xl text-eco-100 mb-8 max-w-2xl mx-auto">
              Start tracking your carbon footprint today and join the movement 
              toward sustainable finance.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-eco-600 hover:bg-eco-50 border-white"
              onClick={() => navigate('/login')}
            >
              Launch Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-carbon-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-6 w-6 text-eco-500" />
            <span className="text-xl font-bold">EcoFin Carbon</span>
          </div>
          <p className="text-carbon-400 mb-4">
            Making sustainable finance accessible to everyone.
          </p>
          <p className="text-sm text-carbon-500">
            © 2024 EcoFin Carbon. Built for Capital One Hackathon.
          </p>
        </div>
      </footer>
    </div>
  )
}

