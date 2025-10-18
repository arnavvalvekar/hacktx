import { Request, Response, NextFunction } from 'express'

// Fallback data for when MongoDB is not available
const FALLBACK_DATA = {
  users: {
    profile: {
      id: 'demo-user',
      email: 'demo@ecofin.com',
      name: 'Demo User',
      nessieCustomerId: 'demo-customer',
      nessieAccountId: 'demo-account',
      preferences: {
        currency: 'USD',
        country: 'US',
        notifications: true
      },
      createdAt: new Date().toISOString()
    }
  },
  emissions: {
    summary: {
      totalKg: 12.5,
      period: 'week',
      categoryBreakdown: {
        fuel: 4.2,
        groceries: 3.1,
        travel: 2.8,
        retail: 1.4,
        dining: 1.0
      },
      topMerchants: [
        { merchant: 'Shell Gas Station', kg: 2.1 },
        { merchant: 'Whole Foods', kg: 1.8 },
        { merchant: 'Southwest Airlines', kg: 2.8 }
      ],
      trend: [1.2, 1.8, 2.1, 1.9, 2.3, 1.7, 1.5],
      confidenceDistribution: {
        high: 3,
        medium: 2,
        low: 1
      },
      transactionCount: 6,
      averagePerTransaction: 2.1
    }
  },
  transactions: {
    list: [
      {
        id: 'demo-1',
        nessieId: 'demo-nessie-1',
        amount: 45.50,
        currency: 'USD',
        merchant: 'Shell Gas Station',
        mcc: '5541',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        meta: { description: 'Gas purchase' },
        normalizedMerchant: 'fuel',
        country: 'US',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-2',
        nessieId: 'demo-nessie-2',
        amount: 89.20,
        currency: 'USD',
        merchant: 'Whole Foods Market',
        mcc: '5411',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        meta: { description: 'Grocery shopping' },
        normalizedMerchant: 'groceries',
        country: 'US',
        createdAt: new Date().toISOString()
      }
    ]
  },
  coach: {
    history: [
      {
        id: 'demo-chat-1',
        question: 'How can I reduce my carbon footprint?',
        answer: {
          context: 'Based on your spending patterns, I can see opportunities for improvement.',
          suggestion: 'Consider reducing fuel purchases by 20% through carpooling or public transport.',
          why_it_helps: 'Transportation is your highest emission category.',
          estimated_reduction: '0.8 kg CO2e per week',
          additional_tip: 'Try bulk buying groceries to reduce packaging waste.'
        },
        context: {
          totalKg: 12.5,
          categoryBreakdown: { fuel: 4.2, groceries: 3.1 },
          topMerchants: ['Shell Gas Station', 'Whole Foods'],
          transactionCount: 6
        },
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      }
    ]
  }
}

export const fallbackHandler = (req: Request, res: Response, next: NextFunction) => {
  // Only use fallback in development mode
  if (process.env.NODE_ENV !== 'development') {
    return next()
  }

  const path = req.path
  const method = req.method

  console.log(`🔄 Fallback mode: ${method} ${path}`)

  // User profile endpoints
  if (path === '/api/users/profile' && method === 'GET') {
    return res.json({
      success: true,
      data: FALLBACK_DATA.users.profile,
      fallback: true,
      message: 'Using demo data - MongoDB not connected'
    })
  }

  if (path === '/api/users/profile' && method === 'POST') {
    return res.json({
      success: true,
      data: FALLBACK_DATA.users.profile,
      fallback: true,
      message: 'Demo mode - changes not persisted'
    })
  }

  // Emissions endpoints
  if (path === '/api/emissions/summary' && method === 'GET') {
    return res.json({
      success: true,
      data: FALLBACK_DATA.emissions.summary,
      fallback: true,
      message: 'Using demo data - MongoDB not connected'
    })
  }

  if (path === '/api/emissions/calc' && method === 'POST') {
    return res.json({
      success: true,
      data: {
        totalKg: FALLBACK_DATA.emissions.summary.totalKg,
        transactionCount: FALLBACK_DATA.emissions.summary.transactionCount,
        categoryBreakdown: FALLBACK_DATA.emissions.summary.categoryBreakdown,
        methodBreakdown: { unit: 2, specialized: 1, spend: 3 },
        confidenceBreakdown: FALLBACK_DATA.emissions.summary.confidenceDistribution,
        emissions: []
      },
      fallback: true,
      message: 'Demo mode - calculations not persisted'
    })
  }

  // Transactions endpoints
  if (path === '/api/transactions' && method === 'GET') {
    return res.json({
      success: true,
      data: {
        transactions: FALLBACK_DATA.transactions.list,
        pagination: {
          total: FALLBACK_DATA.transactions.list.length,
          limit: 50,
          offset: 0,
          hasMore: false
        }
      },
      fallback: true,
      message: 'Using demo data - MongoDB not connected'
    })
  }

  if (path === '/api/transactions/sync' && method === 'GET') {
    return res.json({
      success: true,
      data: {
        synced: 2,
        total: 2,
        transactions: FALLBACK_DATA.transactions.list.map(tx => ({
          id: tx.id,
          nessieId: tx.nessieId,
          amount: tx.amount,
          merchant: tx.merchant,
          date: tx.date,
          category: tx.normalizedMerchant
        }))
      },
      fallback: true,
      message: 'Demo mode - no real sync performed'
    })
  }

  // Coach endpoints
  if (path === '/api/coach' && method === 'POST') {
    return res.json({
      success: true,
      data: {
        question: req.body.question || 'How can I reduce my carbon footprint?',
        answer: {
          context: 'Based on your demo spending patterns, I can see opportunities for improvement.',
          suggestion: 'Consider reducing fuel purchases by 20% through carpooling or public transport.',
          why_it_helps: 'Transportation is typically the highest emission category.',
          estimated_reduction: '0.8 kg CO2e per week',
          additional_tip: 'Try bulk buying groceries to reduce packaging waste.'
        },
        context: FALLBACK_DATA.emissions.summary
      },
      fallback: true,
      message: 'Demo mode - AI responses not persisted'
    })
  }

  if (path === '/api/coach/history' && method === 'GET') {
    return res.json({
      success: true,
      data: {
        chats: FALLBACK_DATA.coach.history,
        pagination: {
          total: FALLBACK_DATA.coach.history.length,
          limit: 20,
          offset: 0,
          hasMore: false
        }
      },
      fallback: true,
      message: 'Using demo data - MongoDB not connected'
    })
  }

  // Health check
  if (path === '/health' && method === 'GET') {
    return res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      fallback: true,
      message: 'Server running in fallback mode - MongoDB not connected'
    })
  }

  next()
}
