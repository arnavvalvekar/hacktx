import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input' // Input component not available
import { useApiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Send, Bot, User, Leaf, Target, ArrowLeft } from 'lucide-react'
import { useAuth0 } from '@auth0/auth0-react'
// @ts-ignore - JavaScript module
import { getTransactions, getDashboardSummary, getCategoryBreakdown } from '@/services/mockData'
import type { MockTransaction } from '@/types/mockTypes'

export default function Coach() {
  const apiClient = useApiClient()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth0()
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [transactions, setTransactions] = useState<MockTransaction[]>([])
  const [dashboardSummary, setDashboardSummary] = useState<any>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized) {
      loadTransactionData()
      loadConversationHistory()
      setInitialized(true)
    }
  }, [initialized])

  // Save conversation history to localStorage (user-scoped)
  const saveConversationHistory = () => {
    try {
      const key = user?.sub ? `ecofin-coach-conversation:${user.sub}` : 'ecofin-coach-conversation'
      localStorage.setItem(key, JSON.stringify(messages))
    } catch (error) {
      console.error('Error saving conversation history:', error)
    }
  }

  // Load conversation history (backend if logged in, else local)
  const loadConversationHistory = async () => {
    try {
      if (isAuthenticated) {
        try {
          const resp = await apiClient.get('/coach/history?limit=50')
          const chats = resp?.data?.data?.chats || []
          const converted = chats.map((c: any) => ([
            { role: 'user', content: c.question, timestamp: new Date(c.createdAt) },
            { role: 'assistant', content: typeof c.answer === 'string' ? c.answer : JSON.stringify(c.answer), timestamp: new Date(c.createdAt) },
          ])).flat()
          if (converted.length > 0) {
            setMessages(converted)
            return
          }
        } catch (e) {
          console.log('Coach history API failed, falling back to local storage')
        }
      }
      const key = user?.sub ? `ecofin-coach-conversation:${user.sub}` : 'ecofin-coach-conversation'
      const savedMessages = localStorage.getItem(key)
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(parsedMessages)
      }
    } catch (error) {
      console.error('Error loading conversation history:', error)
    }
  }

  // Save conversation whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveConversationHistory()
    }
  }, [messages])

  // Clear conversation history
  const clearConversation = () => {
    setMessages([])
    const key = user?.sub ? `ecofin-coach-conversation:${user.sub}` : 'ecofin-coach-conversation'
    localStorage.removeItem(key)
    toast({
      title: "Conversation Cleared",
      description: "Your chat history has been cleared.",
    })
  }

  // Create goal from coach suggestion and navigate to dashboard
  const createGoalFromSuggestion = async (suggestion: any) => {
    try {
      // Create goal object locally
      const goal = {
        id: Date.now().toString(),
        title: suggestion.title,
        description: suggestion.description,
        targetValue: suggestion.targetValue || 0,
        currentValue: 0,
        unit: suggestion.unit || 'kg CO2e',
        category: suggestion.category,
        completed: false,
        createdAt: new Date(),
        source: 'coach-suggestion',
        isPrefilled: true // Flag to indicate this should be pre-filled in dashboard
      }

      // Store the goal to be pre-filled in dashboard
      localStorage.setItem('ecofin-prefill-goal', JSON.stringify(goal))

      toast({
        title: "Goal Ready! 🎯",
        description: `Taking you to Dashboard to customize "${suggestion.title}"`,
      })

      // Navigate to dashboard with goals tab active
      navigate('/dashboard?tab=goals')
      
    } catch (error) {
      console.error('Error preparing goal:', error)
      toast({
        title: "Error",
        description: "Failed to prepare goal. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Parse coach response for actionable suggestions
  const parseSuggestionsFromResponse = (content: string) => {
    const suggestions: any[] = []
    
    // Look for patterns that indicate actionable suggestions
    const lines = content.split('\n').filter(line => line.trim())
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Look for numbered suggestions or bullet points with actionable content
      if (line.match(/^\d+\./) || line.match(/^[•\-]/)) {
        const nextLine = lines[i + 1] || ''
        
        // Extract category from context
        let category = 'general'
        if (content.toLowerCase().includes('transportation') || line.toLowerCase().includes('transport') || line.toLowerCase().includes('travel')) {
          category = 'transportation'
        } else if (content.toLowerCase().includes('food') || content.toLowerCase().includes('dining') || line.toLowerCase().includes('meal')) {
          category = 'food'
        } else if (content.toLowerCase().includes('shopping') || line.toLowerCase().includes('purchase') || line.toLowerCase().includes('buy')) {
          category = 'shopping'
        } else if (content.toLowerCase().includes('energy') || line.toLowerCase().includes('electricity') || line.toLowerCase().includes('utilities')) {
          category = 'utilities'
        }
        
        // Extract target value if mentioned
        let targetValue = 0
        let unit = 'kg CO2e'
        const percentMatch = line.match(/(\d+)%/i)
        const kgMatch = line.match(/(\d+(?:\.\d+)?)\s*kg/i)
        
        if (percentMatch) {
          targetValue = parseInt(percentMatch[1])
          unit = '%'
        } else if (kgMatch) {
          targetValue = parseFloat(kgMatch[1])
          unit = 'kg CO2e'
        }
        
        // Create suggestion object
        const suggestion = {
          title: line.replace(/^\d+\.\s*/, '').replace(/^[•\-]\s*/, '').substring(0, 50) + (line.length > 50 ? '...' : ''),
          description: line + (nextLine ? ' ' + nextLine : ''),
          category,
          targetValue,
          unit
        }
        
        suggestions.push(suggestion)
      }
    }
    
    return suggestions.slice(0, 3) // Limit to 3 suggestions
  }

  // Retry mechanism for failed requests (currently unused but available for future use)
  // const retryLastMessage = async () => {
  //   if (messages.length > 0) {
  //     const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user')
  //     if (lastUserMessage) {
  //       setInputMessage(lastUserMessage.content)
  //       await sendMessage()
  //     }
  //   }
  // }

  const loadTransactionData = async () => {
    try {
      // Load realistic transaction data with accurate CO₂ calculations
      const [txData, summaryData, breakdownData] = await Promise.all([
        getTransactions(),
        getDashboardSummary(),
        getCategoryBreakdown()
      ])
      
      setTransactions(txData)
      setDashboardSummary(summaryData)
      setCategoryBreakdown(breakdownData)
      
      // Add initial welcome message with accurate carbon insights
      const totalCarbon = summaryData.mtd_kg
      const ecoScore = summaryData.eco_score
      const topCategory = breakdownData[0] // Already sorted by value
      
      const welcomeMessage = {
        role: 'assistant',
        content: `Hey! So I took a look at your spending and you're doing about ${totalCarbon.toFixed(2)} kg CO₂ this month. Your Eco Score is ${ecoScore}/100, which is... well, it's not terrible, but there's definitely room to improve.

The biggest thing I noticed is ${topCategory?.category} - that's where most of your emissions are coming from. Want to try something simple? Pick one habit in that area and let's see if we can make it a bit greener. What do you think?`,
        timestamp: new Date()
      }
      
      setMessages([welcomeMessage])
      
    } catch (error) {
      console.error('Error loading transaction data:', error)
      toast({
        title: "Error",
        description: "Failed to load transaction data",
        variant: "destructive"
      })
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    console.log('🔍 COACH DEBUG: Starting to send message:', inputMessage);

    const userMessage = { role: 'user', content: inputMessage, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage('')

    // Check for simple greetings and provide quick responses
    const messageLower = currentMessage.toLowerCase().trim()
    
    // Simple greeting responses
    if (messageLower.match(/^(hello|hi|hey|good morning|good afternoon|good evening|how are you|what's up|sup)$/)) {
      const greetingResponses = [
        "Hello! I'm here to help you reduce your carbon footprint through smart financial decisions. What would you like to know about your spending habits?",
        "Hi there! I'm your Eco Coach, ready to help you make sustainable financial choices. What area of your spending would you like to optimize?",
        "Hey! I'm focused on helping you save money while reducing your environmental impact. What can I help you with today?"
      ]
      
      const quickResponse = greetingResponses[Math.floor(Math.random() * greetingResponses.length)]
      const botMessage = { 
        role: 'assistant', 
        content: quickResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      return
    }

    // Check for inappropriate or off-topic queries
    const inappropriatePatterns = [
      /^(tell me a joke|joke|funny)/,
      /^(what's the weather|weather)/,
      /^(what time is it|time)/,
      /^(who are you|what are you)/,
      /^(help me with|how do i).*(homework|assignment|essay|paper)/,
      /^(can you|please).*(write|create|generate).*(story|poem|song|code)/,
      /^(do you like|what's your favorite)/,
      /^(personal|private|relationship|dating)/,
      /^(medical|health|doctor|medicine)/,
      /^(illegal|crime|criminal)/,
      /^(hate|stupid|dumb|idiot)/
    ]

    const isInappropriate = inappropriatePatterns.some(pattern => pattern.test(messageLower))
    
    if (isInappropriate) {
      const redirectResponses = [
        "I'm focused on helping you make sustainable financial choices that benefit both your wallet and the planet. Let's talk about your carbon footprint and how we can reduce it together!",
        "I'm here to help you with financial sustainability and carbon footprint reduction. What would you like to know about optimizing your spending for environmental impact?",
        "Let's stick to our purpose - I'm here to help you save money while reducing your carbon emissions. What area of your spending would you like to focus on?"
      ]
      
      const redirectResponse = redirectResponses[Math.floor(Math.random() * redirectResponses.length)]
      const botMessage = { 
        role: 'assistant', 
        content: redirectResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      return
    }
    setIsLoading(true)

    try {
      console.log('🔍 COACH DEBUG: Preparing API request...');
      const requestData = {
        message: currentMessage,
        history: messages,
        context: {
          transactions: transactions.slice(0, 20), // Recent transactions
          dashboardSummary: dashboardSummary,
          categoryBreakdown: categoryBreakdown,
          totalCarbon: dashboardSummary?.mtd_kg || 0,
          ecoScore: dashboardSummary?.eco_score || 0,
          topCategories: categoryBreakdown.slice(0, 3).map(cat => [cat.category, cat.value])
        }
      };
      
      console.log('🔍 COACH DEBUG: Request data:', {
        message: requestData.message,
        historyLength: requestData.history.length,
        transactionsLength: requestData.context.transactions.length,
        totalCarbon: requestData.context.totalCarbon,
        ecoScore: requestData.context.ecoScore,
        topCategories: requestData.context.topCategories
      });
      
      // Connect to backend API endpoint as specified in architecture
      const response = await apiClient.post('/coach/chat', requestData)
      
      console.log('✅ COACH DEBUG: Response received:', response.data);
      
      const responseContent = response.data.data?.response || 'Sorry, I could not process your request.'
      const suggestions = parseSuggestionsFromResponse(responseContent)
      
      const botMessage = { 
        role: 'assistant', 
        content: responseContent,
        timestamp: new Date(),
        suggestions: suggestions.length > 0 ? suggestions : undefined
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
      
      const errorStatus = (error as any)?.response?.status;
      const errorMessage = (error as any)?.response?.data?.error || (error instanceof Error ? error.message : 'Unknown error');
      
      // Handle different types of errors
      if (errorStatus === 401) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please refresh the page and try again.",
          variant: "destructive",
        });
      } else if (errorStatus === 429) {
        toast({
          title: "Rate Limited",
          description: "Too many requests. Please wait a moment before trying again.",
          variant: "destructive",
        });
      } else if (errorStatus >= 500) {
        toast({
          title: "Server Error",
          description: "The AI service is temporarily unavailable. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to send message: ${errorMessage}`,
          variant: "destructive",
        });
      }
      
      const assistantErrorMessage = { 
        role: 'assistant', 
        content: errorStatus === 401 
          ? 'I need you to refresh the page to continue our conversation. Your session has expired.'
          : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantErrorMessage])
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  Financial Advisory Assistant
                </h1>
                <p className="text-gray-600 text-sm">
                  AI-powered sustainability guidance based on your spending patterns
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Assistant Status</p>
                  <p className="text-sm font-medium text-green-600">Online</p>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearConversation}
                  className="text-gray-600 hover:text-gray-900 border-gray-300"
                >
                  Clear Chat
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Carbon Insights Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Leaf className="h-5 w-5 text-gray-600" />
                Portfolio Impact Summary
              </CardTitle>
              <CardDescription className="text-gray-600">
                Current environmental impact from your transactions
              </CardDescription>
            </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-2xl font-semibold text-gray-900">
                      {dashboardSummary?.mtd_kg?.toFixed(2) || '0.00'} kg CO₂
                    </div>
                    <div className="text-sm text-gray-600">Total Carbon Footprint</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-2xl font-semibold text-gray-900">
                      {transactions.length}
                    </div>
                    <div className="text-sm text-gray-600">Transactions Tracked</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-2xl font-semibold text-gray-900">
                      {dashboardSummary?.eco_score || 0}/100
                    </div>
                    <div className="text-sm text-gray-600">Eco Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
        </motion.div>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <MessageCircle className="h-5 w-5 text-gray-600" />
              Financial Advisory Chat
            </CardTitle>
            <CardDescription className="text-gray-600">
              AI-powered sustainability guidance based on your spending patterns
            </CardDescription>
          </CardHeader>
            <CardContent>
              <div className="h-96 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <Bot className="h-12 w-12 mx-auto mb-2 text-gray-400" />
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
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-white text-gray-900 border border-gray-200'
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
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          
                          {/* Goal Creation Buttons */}
                          {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-2">💡 Turn suggestions into goals:</p>
                              <div className="space-y-1">
                                {message.suggestions.map((suggestion: any, suggestionIndex: number) => (
                                  <Button
                                    key={suggestionIndex}
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-xs h-8 bg-white hover:bg-eco-50 border-eco-200 hover:border-eco-300 text-eco-700"
                                    onClick={() => createGoalFromSuggestion(suggestion)}
                                  >
                                    <Target className="h-3 w-3 mr-1" />
                                    {suggestion.title}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 font-medium"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Professional Back Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}

