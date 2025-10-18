import { Router } from 'express'
import { AuthRequest } from '../middleware/verifyAuth'
import { User } from '../models/User'

const router = Router()

// Get user profile
router.get('/profile', async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findOne({ auth0Id: req.user?.sub })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        nessieCustomerId: user.nessieCustomerId,
        nessieAccountId: user.nessieAccountId,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    next(error)
  }
})

// Create or update user profile
router.post('/profile', async (req: AuthRequest, res, next) => {
  try {
    const { email, name, nessieCustomerId, nessieAccountId, preferences } = req.body
    
    const userData = {
      auth0Id: req.user?.sub,
      email: email || req.user?.email,
      name: name || req.user?.name,
      nessieCustomerId,
      nessieAccountId,
      preferences: preferences || {
        currency: 'USD',
        country: 'US',
        notifications: true
      }
    }
    
    const user = await User.findOneAndUpdate(
      { auth0Id: req.user?.sub },
      userData,
      { upsert: true, new: true, runValidators: true }
    )
    
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        nessieCustomerId: user.nessieCustomerId,
        nessieAccountId: user.nessieAccountId,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    next(error)
  }
})

// Update user preferences
router.put('/preferences', async (req: AuthRequest, res, next) => {
  try {
    const { preferences } = req.body
    
    const user = await User.findOneAndUpdate(
      { auth0Id: req.user?.sub },
      { preferences },
      { new: true, runValidators: true }
    )
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json({
      success: true,
      data: {
        preferences: user.preferences
      }
    })
  } catch (error) {
    next(error)
  }
})

export default router

