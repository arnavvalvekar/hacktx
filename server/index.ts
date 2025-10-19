import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { connectDB } from './db/connectDB'
import { errorHandler, notFound } from './middleware/errorHandler'
import { fallbackHandler } from './middleware/fallbackHandler'
import { verifyAuth } from './middleware/verifyAuth'

// Routes
import userRoutes from './routes/users'
import transactionRoutes from './routes/transactions'
import carbonRoutes from './routes/carbon'
import coachRoutes from './routes/coach'

dotenv.config({ path: './.env' })

const app = express()
const PORT = process.env.PORT || 3003

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3004'],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

// Body parsing middleware
app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Fallback handler for demo mode (when MongoDB is not available)
app.use(fallbackHandler)

// API routes
app.use('/api/users', verifyAuth, userRoutes)
app.use('/api/transactions', verifyAuth, transactionRoutes)
app.use('/api/emissions', verifyAuth, carbonRoutes)
app.use('/api/coach', verifyAuth, coachRoutes)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use(notFound)

// Start server
const startServer = async () => {
  try {
    console.log('🌱 Starting EcoFin Carbon Server...')
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    
    // Try to connect to database
    try {
      await connectDB()
      console.log('✅ MongoDB connected successfully')
    } catch (dbError: any) {
      console.log('⚠️ MongoDB connection failed - running in fallback mode')
      console.log('🔄 Server will use demo data for API responses')
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`
🚀 EcoFin Carbon Server Started Successfully!
📍 Server URL: http://localhost:${PORT}
🔗 Health Check: http://localhost:${PORT}/health
🌱 API Base: http://localhost:${PORT}/api
📊 Environment: ${process.env.NODE_ENV || 'development'}
${process.env.NODE_ENV !== 'production' ? '🔄 Running in fallback mode (demo data)' : ''}
      `)
    })
    
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message)
    
    if (error.message.includes('EADDRINUSE')) {
      console.error(`
🔌 PORT ALREADY IN USE:
Port ${PORT} is already being used by another process.

🔧 TO FIX THIS:
1. Kill the process using port ${PORT}: lsof -ti:${PORT} | xargs kill -9
2. Or change the PORT in your .env file
3. Restart the server
      `)
    } else {
      console.error(`
❌ SERVER STARTUP ERROR:
${error.message}

🔧 TO FIX THIS:
1. Check your environment variables
2. Verify database connection
3. Check for syntax errors in the code
      `)
    }
    
    process.exit(1)
  }
}

startServer()

export default app

