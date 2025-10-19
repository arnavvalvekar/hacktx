import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { AuthRequest } from '../middleware/verifyAuth'
import { User } from '../models/User'
import { Emission } from '../models/Emission'
import { Chat } from '../models/Chat'

const router = Router()

// Remove markdown bold/italic from AI responses so UI shows plain text
function sanitizeResponse(text: string): string {
  if (!text) return text
  return text
    // bold **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // italic *text* or _text_
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
}

// Intelligent fallback response generator
function generateIntelligentFallback(message: string, context: any, history: any[]): string {
  const messageLower = message.toLowerCase()
  
  // Extract user's data
  const totalCarbon = context?.totalCarbon || 0
  const ecoScore = context?.ecoScore || 0
  const topCategories = context?.topCategories || []
  const transactions = context?.transactions || []
  const dashboardSummary = context?.dashboardSummary
  
  // Analyze spending patterns
  const categoryBreakdown = context?.categoryBreakdown || []
  const topCategory = categoryBreakdown[0] || { category: 'Shopping', value: 0, pct: 0 }
  
  // Generate contextual responses based on keywords and data
  if (messageLower.includes('finance') || messageLower.includes('money') || messageLower.includes('budget')) {
    return `I get it, money's tight for everyone right now. Looking at your spending, you're doing ${totalCarbon.toFixed(1)} kg CO₂e this month which puts you at ${ecoScore}/100 on our scale. The good news? ${topCategory.category} is where you can make the biggest difference without feeling like you're sacrificing much. 

Try this: pick one thing in that category you buy regularly and swap it for something similar but greener. You'll probably save money too. Want me to look at your recent ${topCategory.category.toLowerCase()} purchases and suggest a specific swap?`
  }
  
  if (messageLower.includes('emission') || messageLower.includes('carbon') || messageLower.includes('reduce')) {
    return `So you're at ${totalCarbon.toFixed(1)} kg CO₂e this month - honestly, that's pretty typical. Your Eco Score is ${ecoScore}/100, which means there's definitely room to improve but you're not doing terrible.

The thing is, ${topCategory.category} is eating up most of your footprint. Instead of trying to overhaul everything at once, what if we just picked one habit in that area to tweak? Like, if you're buying gas every week, maybe try carpooling once or twice. Or if it's groceries, maybe hit the farmers market instead of the big chain store. 

What's your biggest ${topCategory.category.toLowerCase()} expense right now?`
  }
  
  if (messageLower.includes('goal') || messageLower.includes('target')) {
    return `Okay, let's be realistic here. You're not going to go from ${totalCarbon.toFixed(1)} kg CO₂e to zero overnight. But we can definitely make some progress.

Since ${topCategory.category} is your biggest issue, let's focus there. How about this: over the next month, try to cut that category by like 15-20%. Not a huge change, but enough that you'll actually notice it. Maybe swap out a few purchases for greener options, or just buy a bit less overall.

Want me to set up a simple goal for you? I can track it and give you a nudge if you're falling behind.`
  }
  
  if (messageLower.includes('alternative') || messageLower.includes('sustainable') || messageLower.includes('eco-friendly')) {
    const area = topCategory.category
    return `Look, I'm not going to tell you to buy some expensive organic whatever. But there are definitely some easy swaps in your ${area.toLowerCase()} spending that won't break the bank.

Like, if you're hitting Starbucks every day, maybe try making coffee at home a couple times a week. Or if you're always ordering takeout, maybe meal prep on Sundays. Small stuff that adds up.

What's your go-to ${area.toLowerCase()} purchase? I can probably find you a greener version that's basically the same thing.`
  }
  
  // Default response for general questions
  return `Hey, so I looked at your spending and honestly, you're doing okay. ${topCategory.category} is your biggest carbon hit right now, but that's pretty normal. 

Instead of trying to fix everything at once, what if we just picked one thing to work on? Like, maybe you cut back on ${topCategory.category.toLowerCase()} by like 20% this month. Not a huge change, but enough that you'll actually stick with it.

What do you think? Want to try something small and see how it goes?`
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.LLM_API_KEY || '',
})

// Initialize Gemini client (will be initialized when needed)
let genAI: GoogleGenerativeAI | null = null

function initializeGeminiClient() {
  if (!genAI) {
    console.log('🔑 COACH DEBUG: Initializing Gemini client...')
    console.log('🔑 COACH DEBUG: Gemini API Key available:', !!process.env.GEMINI_API_KEY)
    console.log('🔑 COACH DEBUG: API Key length:', process.env.GEMINI_API_KEY?.length || 0)
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  }
  return genAI
}

// Test endpoint to verify Gemini API
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 COACH TEST: Testing Gemini API connection...')
    const geminiClient = initializeGeminiClient()
    const model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent('Hello, respond with "Gemini API is working"')
    const response = await result.response
    const text = response.text()
    
    console.log('✅ COACH TEST: Gemini API response:', text)
    res.json({ 
      success: true, 
      message: 'Gemini API is working', 
      response: text,
      apiKeyPresent: !!process.env.GEMINI_API_KEY
    })
  } catch (error) {
    console.error('❌ COACH TEST: Gemini API test failed:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      apiKeyPresent: !!process.env.GEMINI_API_KEY
    })
  }
})

// New Chat endpoint for Gemini integration
router.post('/chat', async (req: AuthRequest, res, next) => {
  try {
    console.log('🤖 COACH DEBUG: Received chat request')
    console.log('🔑 COACH DEBUG: Gemini API Key available:', !!process.env.GEMINI_API_KEY)
    console.log('🔑 COACH DEBUG: API Key length:', process.env.GEMINI_API_KEY?.length || 0)
    
    const { message, history, context } = req.body
    
    console.log('🤖 COACH DEBUG: Message:', message?.substring(0, 100) + '...')
    console.log('🤖 COACH DEBUG: History length:', history?.length || 0)
    console.log('🤖 COACH DEBUG: Context available:', !!context)
    
    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.log('❌ COACH ERROR: Invalid message provided')
      return res.status(400).json({ 
        success: false,
        error: 'Message is required and must be a non-empty string',
        data: null
      })
    }
    
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim().length === 0) {
      console.log('❌ COACH ERROR: Gemini API key not configured')
      const fallbackResponse = sanitizeResponse(generateIntelligentFallback(message, context, history))
      return res.json({
        success: true,
        data: {
          response: fallbackResponse,
          context: {
            model: 'fallback-no-api-key',
            error: 'Gemini API key not configured',
            timestamp: new Date().toISOString()
          }
        }
      })
    }
    
    // Get user from database (fallback to mock data if not found)
    let user = null
    try {
      user = await User.findOne({ auth0Id: req.user?.sub })
    } catch (dbError) {
      console.log('Database not available, using fallback mode')
    }
    
    // Build context from the provided data or fallback
    let carbonContext = ''
    if (context && context.carbonData) {
      const totalCarbon = context.totalCarbon || 0
      const topCategories = context.topCategories || []
      const transactionCount = context.carbonData.length || 0
      
      carbonContext = `
YOUR CURRENT CARBON FOOTPRINT DATA:
- Total Carbon Footprint: ${totalCarbon.toFixed(2)} kg CO2e
- Top Categories: ${topCategories.map(([cat, val]: [string, number]) => `${cat} (${val.toFixed(2)} kg CO2e)`).join(', ')}
- Transactions Tracked: ${transactionCount}
- Average per Transaction: ${transactionCount > 0 ? (totalCarbon / transactionCount).toFixed(2) : '0.00'} kg CO2e

RECENT TRANSACTION CATEGORIES:
${context.carbonData.slice(0, 10).map((data: any) => `- ${data.category.join(', ')}: ${data.carbonFootprint.toFixed(2)} kg CO2e (${new Date(data.date).toLocaleDateString()})`).join('\n')}
`
    } else {
      carbonContext = `
YOUR CURRENT CARBON FOOTPRINT DATA:
- Total Carbon Footprint: 15.2 kg CO2e
- Top Categories: Food & Dining (8.5 kg CO2e), Transportation (4.2 kg CO2e), Shopping (2.5 kg CO2e)
- Transactions Tracked: 23
- Average per Transaction: 0.66 kg CO2e

RECENT TRANSACTION CATEGORIES:
- Food & Dining: 2.1 kg CO2e (Today)
- Transportation: 1.8 kg CO2e (Yesterday)
- Shopping: 1.2 kg CO2e (Yesterday)
- Utilities: 0.9 kg CO2e (2 days ago)
`
    }

    // Create the system prompt with better structure
    const systemPrompt = `You are EcoFin Coach, an expert AI assistant specializing in financial sustainability and carbon footprint reduction. You help users make environmentally conscious financial decisions.

CONTEXT:
${carbonContext}

YOUR EXPERTISE:
- Carbon footprint analysis and reduction strategies
- Sustainable financial planning and budgeting
- Eco-friendly spending alternatives and lifestyle changes
- Environmental impact assessment of daily activities
- Personal finance optimization for sustainability

RESPONSE GUIDELINES:
1. For simple greetings (hello, hi, how are you): Give a brief, friendly response (1-2 sentences) and redirect to sustainability topics
2. For inappropriate or off-topic queries: Politely redirect to your purpose with encouraging language
3. Always provide specific, actionable advice tailored to their data when discussing finances/sustainability
4. Use their carbon footprint data to give personalized recommendations
5. Suggest concrete alternatives with estimated carbon savings
6. Keep responses conversational but informative (150-250 words for financial topics)
7. Be encouraging and supportive, never judgmental
8. Connect financial savings to environmental benefits
9. Provide immediate steps they can take today

EXAMPLES OF APPROPRIATE RESPONSES:
- Greeting: "Hello! I'm here to help you reduce your carbon footprint through smart financial decisions. What would you like to know about your spending habits?"
- Off-topic: "I'm focused on helping you make sustainable financial choices that benefit both your wallet and the planet. Let's talk about your carbon footprint and how we can reduce it together!"
- Financial advice: "Based on your $X spending on [category], you could save Y kg CO2e by..."

Remember: Stay focused on your purpose - helping users save money while reducing their environmental impact.`
    
    // Get the Gemini model
    console.log('🤖 COACH DEBUG: Getting Gemini model...')
    const geminiClient = initializeGeminiClient()
    const model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' })
    console.log('🤖 COACH DEBUG: Model obtained successfully')
    
    // Create the full prompt with system context and conversation history
    let fullPrompt = systemPrompt + '\n\n'
    
    // Add conversation history
    if (history && history.length > 0) {
      fullPrompt += 'CONVERSATION HISTORY:\n'
      history.forEach((msg: any, index: number) => {
        fullPrompt += `${msg.role === 'assistant' ? 'Assistant' : 'User'}: ${msg.content}\n`
      })
      fullPrompt += '\n'
    }
    
    // Add current message
    fullPrompt += `User: ${message}\n\nPlease respond as EcoFin Coach:`
    
    console.log('🤖 COACH DEBUG: Sending message to Gemini...')
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    
    if (!response || !response.text) {
      throw new Error('Invalid response from Gemini API')
    }
    
    const aiResponse = sanitizeResponse(response.text().trim())
    
    if (!aiResponse || aiResponse.length === 0) {
      throw new Error('Empty response from Gemini API')
    }
    
    console.log('🤖 COACH DEBUG: Generated response length:', aiResponse.length)
    console.log('🤖 COACH DEBUG: Response preview:', aiResponse.substring(0, 100) + '...')
    
    // Save to database if user exists
    if (user) {
      try {
        const chatRecord = new Chat({
          userId: user._id,
          question: message,
          answer: aiResponse,
          context: {
            model: 'gemini-2.5-flash',
            carbonContext,
            historyLength: history?.length || 0
          }
        })
        await chatRecord.save()
      } catch (dbError) {
        console.log('Could not save chat to database:', dbError)
      }
    }
    
    res.json({
      success: true,
      data: {
        response: aiResponse,
        context: {
          model: 'gemini-2.5-flash',
          carbonFootprint: context?.carbonData || [],
          totalCarbon: context?.totalCarbon || 0
        }
      }
    })
    
  } catch (error) {
    console.error('❌ COACH ERROR: Gemini Chat error:', error)
    console.error('❌ COACH ERROR: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // Determine error type and provide appropriate response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isApiKeyError = errorMessage.includes('API Key') || errorMessage.includes('403') || errorMessage.includes('Forbidden')
    const isNetworkError = errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED')
    
    // Fallback response if Gemini fails
    const fallbackResponse = sanitizeResponse(generateIntelligentFallback(req.body.message, req.body.context, req.body.history))
    
    // Return appropriate status code based on error type
    if (isApiKeyError) {
      console.log('🔑 COACH ERROR: API Key issue detected, using fallback')
      return res.json({
        success: true,
        data: {
          response: fallbackResponse,
          context: {
            model: 'fallback-api-key-error',
            error: 'API Key authentication failed',
            timestamp: new Date().toISOString()
          }
        }
      })
    } else if (isNetworkError) {
      console.log('🌐 COACH ERROR: Network issue detected, using fallback')
      return res.json({
        success: true,
        data: {
          response: fallbackResponse,
          context: {
            model: 'fallback-network-error',
            error: 'Network connectivity issue',
            timestamp: new Date().toISOString()
          }
        }
      })
    } else {
      console.log('🔄 COACH ERROR: General error detected, using fallback')
      return res.json({
        success: true,
        data: {
          response: fallbackResponse,
          context: {
            model: 'fallback-general-error',
            error: errorMessage,
            timestamp: new Date().toISOString()
          }
        }
      })
    }
  }
})

// EcoCoach prompt template
const ecoCoachPrompt = (summary: string, focus?: string) => `
You are EcoFin Coach, a friendly sustainability assistant for EcoFin Carbon. Your role is to help users understand their carbon footprint and provide actionable, specific recommendations to reduce their environmental impact.

User's Emissions Summary:
${summary}

Focus Area: ${focus || 'overall reduction'}

Please provide a helpful response that includes:
1. A brief acknowledgment of their current situation
2. 1-2 specific, actionable recommendations
3. An estimate of potential carbon reduction
4. Encouragement and motivation

Keep your response concise (under 200 words) and focus on practical steps they can take immediately. Be encouraging and avoid judgmental language.

Format your response as JSON with these fields:
{
  "context": "Brief acknowledgment of their situation",
  "suggestion": "Main actionable recommendation",
  "why_it_helps": "Explanation of environmental benefit",
  "estimated_reduction": "X kg CO2e per week/month",
  "additional_tip": "Optional second recommendation"
}
`

// Ask EcoCoach a question
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { question, context } = req.body
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' })
    }
    
    // Get user from database
    const user = await User.findOne({ auth0Id: req.user?.sub })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Get recent emissions data for context
    const recentEmissions = await Emission.find({
      userId: user._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    }).populate('txId', 'merchant amount date')
    
    // Build emissions summary
    const totalKg = recentEmissions.reduce((sum, e) => sum + e.kg, 0)
    const categoryBreakdown: Record<string, number> = {}
    const topMerchants: string[] = []
    
    recentEmissions.forEach(e => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.kg
    })
    
    // Get top merchants
    const merchantMap: Record<string, number> = {}
    recentEmissions.forEach(e => {
      const merchant = (e.txId as any)?.merchant || 'Unknown'
      merchantMap[merchant] = (merchantMap[merchant] || 0) + e.kg
    })
    
    Object.entries(merchantMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .forEach(([merchant]) => {
        topMerchants.push(merchant)
      })
    
    const summary = `
Total emissions (last 30 days): ${totalKg.toFixed(1)} kg CO2e
Top categories: ${Object.entries(categoryBreakdown)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 3)
  .map(([cat, kg]) => `${cat} (${kg.toFixed(1)}kg)`)
  .join(', ')}
Top merchants: ${topMerchants.join(', ')}
Transaction count: ${recentEmissions.length}
`
    
    // Generate AI response
    const prompt = ecoCoachPrompt(summary, context?.category || context?.period)
    
    const response = await anthropic.completions.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens_to_sample: 500,
      prompt: `${prompt}\n\nUser question: ${question}`
    })
    
    const aiResponse = response.completion || ''
    
    // Parse JSON response
    let parsedResponse
    try {
      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        // Fallback if JSON parsing fails
        parsedResponse = {
          context: "I understand you're looking for ways to reduce your carbon footprint.",
          suggestion: "Consider reviewing your spending patterns and identifying high-emission categories.",
          why_it_helps: "Small changes in daily habits can lead to significant environmental impact over time.",
          estimated_reduction: "2-5 kg CO2e per week",
          additional_tip: "Track your progress weekly to stay motivated."
        }
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      parsedResponse = {
        context: "I understand you're looking for ways to reduce your carbon footprint.",
        suggestion: "Consider reviewing your spending patterns and identifying high-emission categories.",
        why_it_helps: "Small changes in daily habits can lead to significant environmental impact over time.",
        estimated_reduction: "2-5 kg CO2e per week",
        additional_tip: "Track your progress weekly to stay motivated."
      }
    }
    
    // Save chat to database
    const chat = new Chat({
      userId: user._id,
      question,
      answer: JSON.stringify(parsedResponse),
      context: {
        category: context?.category,
        period: context?.period,
        emissionsSummary: {
          totalKg,
          categoryBreakdown,
          topMerchants,
          transactionCount: recentEmissions.length
        }
      }
    })
    
    await chat.save()
    
    res.json({
      success: true,
      data: {
        question,
        answer: parsedResponse,
        context: {
          totalKg,
          categoryBreakdown,
          topMerchants,
          transactionCount: recentEmissions.length
        }
      }
    })
    
  } catch (error) {
    console.error('AI Coach error:', error)
    
    // Fallback response if AI fails
    res.json({
      success: true,
      data: {
        question: req.body.question,
        answer: {
          context: "I understand you're looking for ways to reduce your carbon footprint.",
          suggestion: "Consider reviewing your spending patterns and identifying high-emission categories.",
          why_it_helps: "Small changes in daily habits can lead to significant environmental impact over time.",
          estimated_reduction: "2-5 kg CO2e per week",
          additional_tip: "Track your progress weekly to stay motivated."
        },
        context: {
          totalKg: 0,
          categoryBreakdown: {},
          topMerchants: [],
          transactionCount: 0
        }
      }
    })
  }
})

// Get chat history
router.get('/history', async (req: AuthRequest, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query
    
    // Get user from database
    const user = await User.findOne({ auth0Id: req.user?.sub })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const chats = await Chat.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
    
    const total = await Chat.countDocuments({ userId: user._id })
    
    res.json({
      success: true,
      data: {
        chats: chats.map(chat => ({
          id: chat._id,
          question: chat.question,
          answer: JSON.parse(chat.answer),
          context: chat.context,
          createdAt: chat.createdAt
        })),
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + chats.length < total
        }
      }
    })
    
  } catch (error) {
    next(error)
  }
})

// Create goal from coach suggestion
router.post('/create-goal', async (req: AuthRequest, res, next) => {
  try {
    const { title, description, category, targetValue, unit } = req.body
    
    if (!title || !description || !category) {
      return res.status(400).json({ 
        success: false,
        error: 'Title, description, and category are required' 
      })
    }
    
    // Get user from database
    const user = await User.findOne({ auth0Id: req.user?.sub })
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      })
    }
    
    // Create goal object
    const goal = {
      id: Date.now().toString(),
      title,
      description,
      targetValue: targetValue || 0,
      currentValue: 0,
      unit: unit || 'kg CO2e',
      category,
      completed: false,
      createdAt: new Date(),
      source: 'coach-suggestion'
    }
    
    // For now, we'll return the goal to be saved on the frontend
    // In a full implementation, you'd save this to a goals collection in MongoDB
    res.json({
      success: true,
      data: {
        goal,
        message: 'Goal created successfully'
      }
    })
    
  } catch (error) {
    console.error('Goal creation error:', error)
    next(error)
  }
})

export default router

