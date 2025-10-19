import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TiltCard } from '@/components/TiltCard'
import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input' // Input component not available
import { useApiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { MessageCircle, Send, Bot, User, Leaf } from 'lucide-react'
import { nessieService } from '@/services/nessieService'
import type { CarbonFootprintData } from '@/types/nessieTypes'

export default function Coach() {
  const apiClient = useApiClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [carbonData, setCarbonData] = useState<CarbonFootprintData[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized) {
      loadCarbonData()
      setInitialized(true)
    }
  }, [initialized])

  const loadCarbonData = () => {
    const carbonFootprintData = nessieService.getCarbonFootprintData()
    setCarbonData(carbonFootprintData)
    
    // Add initial welcome message with carbon insights
    const totalCarbon = carbonFootprintData.reduce((sum, data) => sum + data.carbonFootprint, 0)
    const categoryBreakdown = carbonFootprintData.reduce((acc, data) => {
      const category = data.category[0] || 'Other'
      acc[category] = (acc[category] || 0) + data.carbonFootprint
      return acc
    }, {} as Record<string, number>)

    const topCategory = Object.entries(categoryBreakdown).sort(([,a], [,b]) => b - a)[0]
    
    const welcomeMessage = {
      role: 'assistant',
      content: `🌱 Hello! I'm your Eco Coach. I can see you've tracked ${totalCarbon.toFixed(2)} kg CO₂ from your recent transactions. Your highest impact category is ${topCategory?.[0] || 'shopping'} with ${topCategory?.[1]?.toFixed(2) || 0} kg CO₂. 

How can I help you reduce your carbon footprint today? Ask me about:
• Sustainable alternatives for your spending habits
• Tips to reduce emissions in specific categories  
• Setting realistic carbon reduction goals
• Eco-friendly merchant recommendations`,
      timestamp: new Date()
    }
    
    setMessages([welcomeMessage])
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    console.log('🔍 COACH DEBUG: Starting to send message:', inputMessage);

    const userMessage = { role: 'user', content: inputMessage, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      console.log('🔍 COACH DEBUG: Preparing API request...');
      const requestData = {
        message: inputMessage,
        history: messages,
        context: {
          carbonData: carbonData,
          totalCarbon: carbonData.reduce((sum, data) => sum + data.carbonFootprint, 0),
          topCategories: Object.entries(
            carbonData.reduce((acc, data) => {
              const category = data.category[0] || 'Other'
              acc[category] = (acc[category] || 0) + data.carbonFootprint
              return acc
            }, {} as Record<string, number>)
          ).sort(([,a], [,b]) => b - a).slice(0, 3)
        }
      };
      
      console.log('🔍 COACH DEBUG: Request data:', requestData);
      
      // Connect to backend API endpoint as specified in architecture
      const response = await apiClient.post('/coach/chat', requestData)
      
      console.log('✅ COACH DEBUG: Response received:', response.data);
      
      const botMessage = { 
        role: 'assistant', 
        content: response.data.data?.response || 'Sorry, I could not process your request.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      
      console.log('✅ COACH DEBUG: Message sent successfully');
    } catch (error) {
      console.error('❌ COACH ERROR: Error sending message:', error);
      console.error('❌ COACH ERROR: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      
      toast({
        title: "Error",
        description: "Failed to send message to AI coach",
        variant: "destructive"
      })
      
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
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
            AI Eco Coach
          </h1>
          <p className="text-carbon-600 text-lg">
            Get personalized recommendations to reduce your carbon footprint
          </p>
        </motion.div>

        {/* Carbon Insights Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <TiltCard>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-eco-500" />
                  Your Carbon Footprint Summary
                </CardTitle>
                <CardDescription>
                  Current carbon impact from your transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-eco-50 rounded-lg">
                    <div className="text-2xl font-bold text-eco-600">
                      {carbonData.reduce((sum, data) => sum + data.carbonFootprint, 0).toFixed(2)} kg CO₂
                    </div>
                    <div className="text-sm text-carbon-600">Total Carbon Footprint</div>
                  </div>
                  <div className="text-center p-4 bg-eco-50 rounded-lg">
                    <div className="text-2xl font-bold text-eco-600">
                      {carbonData.length}
                    </div>
                    <div className="text-sm text-carbon-600">Transactions Tracked</div>
                  </div>
                  <div className="text-center p-4 bg-eco-50 rounded-lg">
                    <div className="text-2xl font-bold text-eco-600">
                      {carbonData.length > 0 ? (carbonData.reduce((sum, data) => sum + data.carbonFootprint, 0) / carbonData.length).toFixed(2) : '0.00'} kg
                    </div>
                    <div className="text-sm text-carbon-600">Average per Transaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TiltCard>
        </motion.div>

        <TiltCard>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-eco-500" />
                Chat with Eco Coach
              </CardTitle>
              <CardDescription>
                AI-powered sustainability guidance based on your spending patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-white rounded-lg border border-carbon-200">
                  {messages.length === 0 ? (
                    <div className="text-center text-carbon-500">
                      <Bot className="h-12 w-12 mx-auto mb-2 text-eco-500" />
                      <p>Ask me anything about sustainability and reducing your carbon footprint!</p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-eco-500 text-white' 
                            : 'bg-carbon-100 text-carbon-900'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {message.role === 'user' ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                            <span className="text-xs opacity-75">
                              {message.role === 'user' ? 'You' : 'Eco Coach'}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-carbon-100 text-carbon-900 px-4 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          <span className="text-xs opacity-75">Eco Coach</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-carbon-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-carbon-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-carbon-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
                    placeholder="Ask about sustainability tips..."
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && sendMessage()}
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 border border-carbon-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-500 focus:border-transparent"
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-eco-500 hover:bg-eco-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TiltCard>
      </div>
    </div>
  )
}

