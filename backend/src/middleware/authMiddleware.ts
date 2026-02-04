import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../types/auth.js'
import { verifyAccessToken, getUserById } from '../services/authService.js'

/**
 * Middleware to verify JWT and attach user to request
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' })
      return
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const payload = verifyAccessToken(token)

    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    // Get full user from database
    const user = await getUserById(payload.userId)

    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(401).json({ error: 'Authentication failed' })
  }
}

/**
 * Optional authentication - attaches user if token present, but doesn't require it
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next()
      return
    }

    const token = authHeader.substring(7)
    const payload = verifyAccessToken(token)

    if (payload) {
      const user = await getUserById(payload.userId)
      if (user) {
        req.user = user
      }
    }

    next()
  } catch (error) {
    // Silently continue without auth
    next()
  }
}
