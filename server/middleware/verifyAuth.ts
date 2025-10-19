import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-client'

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN || process.env.JWT_ISSUER?.replace('https://', '').replace('/', '')}/.well-known/jwks.json`
})

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey()
    callback(null, signingKey)
  })
}

export interface AuthRequest extends Request {
  user?: {
    sub: string
    email: string
    name: string
    [key: string]: any
  }
}

export const verifyAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 AUTH DEBUG: Starting authentication verification')
    console.log('🔍 AUTH DEBUG: Request URL:', req.url)
    console.log('🔍 AUTH DEBUG: Request method:', req.method)
    console.log('🔍 AUTH DEBUG: Headers:', JSON.stringify(req.headers, null, 2))
    
    // Development bypass for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Bypassing authentication')
      req.user = {
        sub: 'dev-user-123',
        email: 'dev@example.com',
        name: 'Development User'
      }
      return next()
    }

    const authHeader = req.headers.authorization
    console.log('🔍 AUTH DEBUG: Authorization header:', authHeader ? 'Present' : 'Missing')
    console.log('🔍 AUTH DEBUG: Full auth header:', authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ AUTH ERROR: No valid authorization header')
      return res.status(401).json({ 
        error: 'No token provided',
        debug: {
          hasHeader: !!authHeader,
          headerFormat: authHeader ? (authHeader.startsWith('Bearer ') ? 'Correct' : 'Incorrect') : 'Missing',
          headerValue: authHeader
        }
      })
    }
    
    const token = authHeader.substring(7)
    console.log('🔍 AUTH DEBUG: Extracted token length:', token.length)
    console.log('🔍 AUTH DEBUG: Token preview:', token.substring(0, 50) + '...')
    
    const audience = process.env.JWT_AUDIENCE
    const issuer = `https://${process.env.AUTH0_DOMAIN || process.env.JWT_ISSUER?.replace('https://', '').replace('/', '')}/`
    
    console.log('🔍 AUTH DEBUG: Expected audience:', audience)
    console.log('🔍 AUTH DEBUG: Expected issuer:', issuer)
    
    jwt.verify(token, getKey, {
      audience: audience,
      issuer: issuer,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        console.error('❌ JWT verification error:', err)
        console.error('❌ JWT error name:', err.name)
        console.error('❌ JWT error message:', err.message)
        return res.status(401).json({ 
          error: 'Invalid token',
          debug: {
            errorName: err.name,
            errorMessage: err.message,
            expectedAudience: audience,
            expectedIssuer: issuer,
            tokenLength: token.length
          }
        })
      }
      
      console.log('✅ AUTH SUCCESS: Token verified successfully')
      console.log('🔍 AUTH DEBUG: Decoded user:', JSON.stringify(decoded, null, 2))
      req.user = decoded as any
      next()
    })
  } catch (error) {
    console.error('❌ AUTH MIDDLEWARE ERROR:', error)
    res.status(500).json({ 
      error: 'Authentication failed',
      debug: {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      }
    })
  }
}

