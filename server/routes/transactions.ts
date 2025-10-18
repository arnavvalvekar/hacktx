import { Router } from 'express'
import axios from 'axios'
import { AuthRequest } from '../middleware/verifyAuth'
import { User } from '../models/User'
import { Transaction } from '../models/Transaction'
import { normalizeMerchantName } from '../utils/carbonFactors'

const router = Router()

// Sync transactions from Capital One Nessie API
router.get('/sync', async (req: AuthRequest, res, next) => {
  try {
    const { customerId, accountId } = req.query
    
    if (!customerId || !accountId) {
      return res.status(400).json({ 
        error: 'customerId and accountId are required' 
      })
    }
    
    // Get user from database
    const user = await User.findOne({ auth0Id: req.user?.sub })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Update user's Nessie IDs
    await User.findByIdAndUpdate(user._id, {
      nessieCustomerId: customerId as string,
      nessieAccountId: accountId as string
    })
    
    // Fetch transactions from Nessie API
    const nessieApiKey = process.env.NESSIE_API_KEY
    const nessieBase = process.env.NESSIE_BASE || 'https://api.nessieisreal.com'
    
    const response = await axios.get(
      `${nessieBase}/customers/${customerId}/accounts/${accountId}/purchases`,
      {
        headers: {
          'Authorization': `Bearer ${nessieApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    const nessieTransactions = response.data
    
    // Process and store transactions
    const processedTransactions = []
    
    for (const tx of nessieTransactions) {
      // Check if transaction already exists
      const existingTx = await Transaction.findOne({ nessieId: tx._id })
      if (existingTx) continue
      
      // Normalize merchant name
      const normalizedMerchant = normalizeMerchantName(tx.merchant || 'Unknown')
      
      // Create transaction document
      const transaction = new Transaction({
        userId: user._id,
        nessieId: tx._id,
        amount: tx.amount || 0,
        currency: tx.currency || 'USD',
        merchant: tx.merchant || 'Unknown',
        mcc: tx.mcc,
        date: new Date(tx.purchase_date || tx.date),
        meta: {
          description: tx.description,
          ...tx.meta
        },
        normalizedMerchant,
        country: user.preferences?.country || 'US'
      })
      
      await transaction.save()
      processedTransactions.push(transaction)
    }
    
    res.json({
      success: true,
      data: {
        synced: processedTransactions.length,
        total: nessieTransactions.length,
        transactions: processedTransactions.map(tx => ({
          id: tx._id,
          nessieId: tx.nessieId,
          amount: tx.amount,
          merchant: tx.merchant,
          date: tx.date,
          category: tx.normalizedMerchant
        }))
      }
    })
    
  } catch (error) {
    console.error('Transaction sync error:', error)
    next(error)
  }
})

// Get user transactions
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { startDate, endDate, category, limit = 50, offset = 0 } = req.query
    
    // Get user from database
    const user = await User.findOne({ auth0Id: req.user?.sub })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Build query
    const query: any = { userId: user._id }
    
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate as string)
      if (endDate) query.date.$lte = new Date(endDate as string)
    }
    
    if (category) {
      query.normalizedMerchant = { $regex: category, $options: 'i' }
    }
    
    // Fetch transactions
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
    
    const total = await Transaction.countDocuments(query)
    
    res.json({
      success: true,
      data: {
        transactions: transactions.map(tx => ({
          id: tx._id,
          nessieId: tx.nessieId,
          amount: tx.amount,
          currency: tx.currency,
          merchant: tx.merchant,
          mcc: tx.mcc,
          date: tx.date,
          meta: tx.meta,
          normalizedMerchant: tx.normalizedMerchant,
          country: tx.country,
          createdAt: tx.createdAt
        })),
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + transactions.length < total
        }
      }
    })
    
  } catch (error) {
    next(error)
  }
})

// Get transaction by ID
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params
    
    // Get user from database
    const user = await User.findOne({ auth0Id: req.user?.sub })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const transaction = await Transaction.findOne({ 
      _id: id, 
      userId: user._id 
    })
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' })
    }
    
    res.json({
      success: true,
      data: {
        id: transaction._id,
        nessieId: transaction.nessieId,
        amount: transaction.amount,
        currency: transaction.currency,
        merchant: transaction.merchant,
        mcc: transaction.mcc,
        date: transaction.date,
        meta: transaction.meta,
        normalizedMerchant: transaction.normalizedMerchant,
        country: transaction.country,
        createdAt: transaction.createdAt
      }
    })
    
  } catch (error) {
    next(error)
  }
})

export default router

