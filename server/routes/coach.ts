import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { AuthRequest } from '../middleware/verifyAuth'
import { User } from '../models/User'
import { Emission } from '../models/Emission'
import { Chat } from '../models/Chat'

const router = Router()

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.LLM_API_KEY || '',
})

// Initialize Gemini client
console.log('🔑 COACH DEBUG: Gemini API Key available:', !!process.env.GEMINI_API_KEY)
console.log('🔑 COACH DEBUG: API Key length:', process.env.GEMINI_API_KEY?.length || 0)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Test endpoint to verify Gemini API
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 COACH TEST: Testing Gemini API connection...')
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
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
    const { message, history, context } = req.body
    
    console.log('🤖 COACH DEBUG: Message:', message?.substring(0, 100) + '...')
    console.log('🤖 COACH DEBUG: History length:', history?.length || 0)
    console.log('🤖 COACH DEBUG: Context available:', !!context)
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.log('❌ COACH ERROR: Invalid message provided')
      return res.status(400).json({ error: 'Message is required and must be a non-empty string' })
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
- Top Categories: ${topCategories.map(([cat, val]) => `${cat} (${val.toFixed(2)} kg CO2e)`).join(', ')}
- Transactions Tracked: ${transactionCount}
- Average per Transaction: ${transactionCount > 0 ? (totalCarbon / transactionCount).toFixed(2) : '0.00'} kg CO2e

RECENT TRANSACTION CATEGORIES:
${context.carbonData.slice(0, 10).map(data => `- ${data.category.join(', ')}: ${data.carbonFootprint.toFixed(2)} kg CO2e (${new Date(data.date).toLocaleDateString()})`).join('\n')}
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
1. Always provide specific, actionable advice tailored to their data
2. Use their carbon footprint data to give personalized recommendations
3. Suggest concrete alternatives with estimated carbon savings
4. Keep responses conversational but informative (150-250 words)
5. Be encouraging and supportive, never judgmental
6. Connect financial savings to environmental benefits
7. Provide immediate steps they can take today
8. If they ask about specific categories, reference their actual data

EXAMPLES OF GOOD RESPONSES:
- "Based on your $X spending on [category], you could save Y kg CO2e by..."
- "Your transportation emissions are X kg - here are 3 specific ways to reduce them..."
- "I notice you spend $X on dining out. Here's how to make eco-friendly choices..."

Remember: Focus on practical, immediate actions that save money AND reduce carbon emissions.`
    
    // Get the Gemini model
    console.log('🤖 COACH DEBUG: Getting Gemini model...')
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
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
    
    const aiResponse = response.text().trim()
    
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
    
    // Determine if it's an API key issue
    const isApiKeyError = error instanceof Error && (
      error.message.includes('API_KEY') || 
      error.message.includes('authentication') ||
      error.message.includes('403')
    )
    
    // Fallback response if Gemini fails
    const fallbackResponse = isApiKeyError 
      ? "I'm currently experiencing technical difficulties with my AI system. Please try again in a few moments, or contact support if the issue persists."
      : `I understand you're looking for ways to reduce your carbon footprint. Based on your spending patterns, I'd recommend focusing on reducing high-emission categories like transportation and food. Consider carpooling, using public transport, or choosing local, seasonal foods. These small changes can significantly reduce your environmental impact while saving money. Would you like specific advice on any particular category?`
    
    res.json({
      success: true,
      data: {
        response: fallbackResponse,
        context: {
          model: 'fallback',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
    })
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
    
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\nUser question: ${question}`
        }
      ]
    })
    
    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : ''
    
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

export default router

