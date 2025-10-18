import mongoose from 'mongoose'

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined')
    }

    console.log('🔄 Attempting to connect to MongoDB Atlas...')
    
    const conn = await mongoose.connect(mongoURI, {
      // Remove deprecated options for newer MongoDB driver
    })

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`)
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected')
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      console.log('🔒 MongoDB connection closed through app termination')
      process.exit(0)
    })

  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message)
    
    // Provide helpful error messages
    if (error.message.includes('IP')) {
      console.error(`
🌐 IP WHITELISTING ISSUE:
Your current IP address is not whitelisted in MongoDB Atlas.

🔧 TO FIX THIS:
1. Go to MongoDB Atlas Dashboard
2. Click "Network Access" in the left sidebar
3. Click "Add IP Address"
4. Click "Add Current IP Address" (or add 0.0.0.0/0 for all IPs)
5. Wait 1-2 minutes for changes to take effect

📝 Your connection string: ${process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@')}
      `)
    } else if (error.message.includes('authentication')) {
      console.error(`
🔐 AUTHENTICATION ISSUE:
Your MongoDB credentials are incorrect.

🔧 TO FIX THIS:
1. Check your username and password in the connection string
2. Make sure the user has proper permissions
      `)
    } else {
      console.error(`
❌ GENERAL CONNECTION ERROR:
${error.message}

🔧 TO FIX THIS:
1. Check your MongoDB Atlas cluster status
2. Verify your connection string
3. Check network connectivity
      `)
    }
    
    // Don't exit in development mode - let fallback handler take over
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    } else {
      console.log('🔄 Continuing in fallback mode...')
      throw error // Re-throw to be caught by server startup
    }
  }
}

