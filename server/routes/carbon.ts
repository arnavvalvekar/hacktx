import { Router } from 'express'
import { AuthRequest } from '../middleware/verifyAuth'
import { User } from '../models/User'
import { Transaction } from '../models/Transaction'
import { Emission } from '../models/Emission'
import { calculateHybridEmissions } from '../utils/carbonFactors'

const router = Router()

// Calculate emissions for transactions
router.post('/calc', async (req: AuthRequest, res, next) => {
  try {
    const { txIds, timeRange, country } = req.body
    
    // Get user from database
    const user = await User.findOne({ auth0Id: req.user?.sub })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Build query for transactions
    const query: any = { userId: user._id }
    
    if (txIds && txIds.length > 0) {
      query._id = { $in: txIds }
    }
    
    if (timeRange) {
      query.date = {}
      if (timeRange.start) query.date.$gte = new Date(timeRange.start)
      if (timeRange.end) query.date.$lte = new Date(timeRange.end)
    }
    
    // Fetch transactions
    const transactions = await Transaction.find(query)
    
    if (transactions.length === 0) {
      return res.json({
        success: true,
        data: {
          totalKg: 0,
          transactionCount: 0,
          categoryBreakdown: {},
          methodBreakdown: { unit: 0, specialized: 0, spend: 0 },
          confidenceBreakdown: { high: 0, medium: 0, low: 0 },
          emissions: []
        }
      })
    }
    
    // Calculate emissions for each transaction
    const emissions = []
    let totalKg = 0
    const categoryBreakdown: Record<string, number> = {}
    const methodBreakdown = { unit: 0, specialized: 0, spend: 0 }
    const confidenceBreakdown = { high: 0, medium: 0, low: 0 }
    
    for (const tx of transactions) {
      // Check if emission already calculated
      let emission = await Emission.findOne({ txId: tx._id })
      
      if (!emission) {
        // Calculate new emission
        const result = calculateHybridEmissions(
          tx.amount,
          tx.merchant,
          tx.meta,
          country || user.preferences?.country || 'US'
        )
        
        // Create emission record
        emission = new Emission({
          userId: user._id,
          txId: tx._id,
          kg: result.emissions,
          method: result.method,
          confidence: result.confidence,
          category: result.category,
          notes: result.notes
        })
        
        await emission.save()
      }
      
      // Update totals
      totalKg += emission.kg
      categoryBreakdown[emission.category] = (categoryBreakdown[emission.category] || 0) + emission.kg
      methodBreakdown[emission.method]++
      confidenceBreakdown[emission.confidence]++
      
      emissions.push({
        id: emission._id,
        txId: tx._id,
        merchant: tx.merchant,
        amount: tx.amount,
        kg: emission.kg,
        method: emission.method,
        confidence: emission.confidence,
        category: emission.category,
        notes: emission.notes,
        date: tx.date
      })
    }
    
    res.json({
      success: true,
      data: {
        totalKg,
        transactionCount: transactions.length,
        categoryBreakdown,
        methodBreakdown,
        confidenceBreakdown,
        emissions: emissions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }
    })
    
  } catch (error) {
    console.error('Emissions calculation error:', error)
    next(error)
  }
})

// Get emissions summary
router.get('/summary', async (req: AuthRequest, res, next) => {
  try {
    const { window = 'week' } = req.query
    
    // Get user from database
    const user = await User.findOne({ auth0Id: req.user?.sub })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (window) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
    
    // Get emissions for the period
    const emissions = await Emission.find({
      userId: user._id,
      createdAt: { $gte: startDate }
    }).populate('txId', 'merchant amount date')
    
    // Calculate summary statistics
    const totalKg = emissions.reduce((sum, e) => sum + e.kg, 0)
    
    const categoryBreakdown: Record<string, number> = {}
    const topMerchants: Array<{ merchant: string; kg: number }> = []
    const trend: number[] = []
    
    // Group by category
    emissions.forEach(e => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.kg
    })
    
    // Group by merchant
    const merchantMap: Record<string, number> = {}
    emissions.forEach(e => {
      const merchant = (e.txId as any)?.merchant || 'Unknown'
      merchantMap[merchant] = (merchantMap[merchant] || 0) + e.kg
    })
    
    // Get top merchants
    Object.entries(merchantMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([merchant, kg]) => {
        topMerchants.push({ merchant, kg })
      })
    
    // Calculate confidence distribution
    const confidenceDistribution = {
      high: emissions.filter(e => e.confidence === 'high').length,
      medium: emissions.filter(e => e.confidence === 'medium').length,
      low: emissions.filter(e => e.confidence === 'low').length
    }
    
    // Generate trend data (last 7 days)
    const trendData: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateKey = date.toISOString().split('T')[0]
      trendData[dateKey] = 0
    }
    
    emissions.forEach(e => {
      const dateKey = new Date(e.createdAt).toISOString().split('T')[0]
      if (trendData[dateKey] !== undefined) {
        trendData[dateKey] += e.kg
      }
    })
    
    trend.push(...Object.values(trendData))
    
    res.json({
      success: true,
      data: {
        totalKg,
        period: window,
        categoryBreakdown,
        topMerchants,
        trend,
        confidenceDistribution,
        transactionCount: emissions.length,
        averagePerTransaction: emissions.length > 0 ? totalKg / emissions.length : 0
      }
    })
    
  } catch (error) {
    console.error('Emissions summary error:', error)
    next(error)
  }
})

export default router

