import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../types/auth.js'

/**
 * Middleware to check if user is an admin
 * Must be used after authenticate middleware
 */
export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' })
    return
  }

  next()
}
