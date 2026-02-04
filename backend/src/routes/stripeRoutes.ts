import { Router } from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import { stripeRateLimiter } from '../middleware/rateLimitMiddleware.js'
import {
  createCheckout,
  createPortal,
  subscriptionStatus,
  webhook
} from '../controllers/stripeController.js'

const router = Router()

// Protected routes (require authentication) with rate limiting for checkout
router.post('/create-checkout-session', authenticate, stripeRateLimiter, createCheckout)
router.post('/create-portal-session', authenticate, stripeRateLimiter, createPortal)
router.get('/subscription-status', authenticate, subscriptionStatus)

// Webhook route (no auth - Stripe handles verification via signature)
// Note: webhook endpoint needs raw body, configured in app.ts
router.post('/webhook', webhook)

export default router
