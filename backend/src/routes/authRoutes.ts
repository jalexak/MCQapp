import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { authRateLimiter, passwordResetRateLimiter } from '../middleware/rateLimitMiddleware.js'

const router = Router()

// Public routes with rate limiting
router.post('/register', authRateLimiter, authController.register)
router.post('/login', authRateLimiter, authController.login)
router.post('/refresh', authController.refreshToken)
router.post('/logout', authController.logout)
router.post('/forgot-password', passwordResetRateLimiter, authController.forgotPassword)
router.post('/reset-password', passwordResetRateLimiter, authController.resetPassword)

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser)

export default router
