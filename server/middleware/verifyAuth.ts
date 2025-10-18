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
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }
    
    const token = authHeader.substring(7)
    
    jwt.verify(token, getKey, {
      audience: process.env.JWT_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN || process.env.JWT_ISSUER?.replace('https://', '').replace('/', '')}/`,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err)
        return res.status(401).json({ error: 'Invalid token' })
      }
      
      req.user = decoded as any
      next()
    })
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

