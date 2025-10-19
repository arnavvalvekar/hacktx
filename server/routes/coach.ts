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
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// New Chat endpoint for Gemini integration
router.post('/chat', async (req: AuthRequest, res, next) => {
  try {
    const { message, history, context } = req.body
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
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
      
      carbonContext = `
Your Carbon Footprint Summary:
- Total Carbon Footprint: ${totalCarbon.toFixed(2)} kg CO2e
- Top Categories: ${topCategories.map(([cat, val]) => `${cat} (${val.toFixed(2)}kg)`).join(', ')}
- Transactions Tracked: ${context.carbonData.length}
- Average per Transaction: ${(totalCarbon / context.carbonData.length).toFixed(2)} kg CO2e
`
    } else {
      carbonContext = `
Your Carbon Footprint Summary:
- Total Carbon Footprint: 15.2 kg CO2e
- Top Categories: Food & Dining (8.5kg), Transportation (4.2kg), Shopping (2.5kg)
- Transactions Tracked: 23
- Average per Transaction: 0.66 kg CO2e
`
    }
    
    // Create conversation history for Gemini
    const conversationHistory = history?.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })) || []
    
    // Add the current message
    conversationHistory.push({
      role: 'user',
      parts: [{ text: message }]
    })
    
    // Create the system prompt
    const systemPrompt = `You are EcoFin Coach, a friendly and knowledgeable AI assistant for EcoFin Carbon, a financial sustainability platform. Your role is to help users understand their carbon footprint and provide actionable, specific recommendations to reduce their environmental impact.

${carbonContext}

Guidelines:
1. Be encouraging and supportive, never judgmental
2. Provide specific, actionable advice based on their spending patterns
3. Use their carbon data to give personalized recommendations
4. Keep responses conversational and under 200 words
5. Focus on practical steps they can take immediately
6. Mention specific carbon reduction benefits when possible
7. If they ask about specific transactions or categories, reference their data

Remember: You're helping them make smart financial decisions that are also environmentally friendly. Connect their spending to carbon impact and suggest alternatives that save money AND reduce emissions.`

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    // Create the chat session
    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // All except the current message
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 300,
      },
    })
    
    // Send the message with system context
    const fullMessage = `${systemPrompt}\n\nUser message: ${message}`
    const result = await chat.sendMessage(fullMessage)
    const response = await result.response
    const aiResponse = response.text()
    
    // Save to database if user exists
    if (user) {
      try {
        const chatRecord = new Chat({
          userId: user._id,
          question: message,
          answer: aiResponse,
          context: {
            model: 'gemini-pro',
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
          model: 'gemini-pro',
          carbonFootprint: context?.carbonData || [],
          totalCarbon: context?.totalCarbon || 0
        }
      }
    })
    
  } catch (error) {
    console.error('Gemini Chat error:', error)
    
    // Fallback response if Gemini fails
    res.json({
      success: true,
      data: {
        response: "I understand you're looking for ways to reduce your carbon footprint. Based on your spending patterns, I'd recommend focusing on reducing high-emission categories like transportation and food. Consider carpooling, using public transport, or choosing local, seasonal foods. These small changes can significantly reduce your environmental impact while saving money. Would you like specific advice on any particular category?",
        context: {
          model: 'fallback',
          error: 'Gemini API unavailable'
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

