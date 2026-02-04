import { Request, Response } from 'express'
import { AuthenticatedRequest } from '../types/auth.js'
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
  handleWebhookEvent,
  constructWebhookEvent
} from '../services/stripeService.js'

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

/**
 * POST /api/v1/stripe/create-checkout-session
 * Creates a Stripe checkout session for subscription purchase
 */
export async function createCheckout(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const { successUrl, cancelUrl } = req.body

    const session = await createCheckoutSession(
      req.user.id,
      req.user.email,
      successUrl || `${FRONTEND_URL}/checkout/success`,
      cancelUrl || `${FRONTEND_URL}/pricing`
    )

    res.json(session)
  } catch (error) {
    console.error('Create checkout error:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
}

/**
 * POST /api/v1/stripe/create-portal-session
 * Creates a Stripe billing portal session for subscription management
 */
export async function createPortal(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const { returnUrl } = req.body

    const session = await createPortalSession(
      req.user.id,
      returnUrl || `${FRONTEND_URL}/account`
    )

    res.json(session)
  } catch (error) {
    console.error('Create portal error:', error)
    res.status(500).json({ error: 'Failed to create portal session' })
  }
}

/**
 * GET /api/v1/stripe/subscription-status
 * Returns the current user's subscription status
 */
export async function subscriptionStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const status = await getSubscriptionStatus(req.user.id)
    res.json(status)
  } catch (error) {
    console.error('Subscription status error:', error)
    res.status(500).json({ error: 'Failed to get subscription status' })
  }
}

/**
 * POST /api/v1/stripe/webhook
 * Handles Stripe webhook events
 * Note: This endpoint needs raw body for signature verification
 */
export async function webhook(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'] as string

  if (!signature) {
    res.status(400).json({ error: 'Missing Stripe signature' })
    return
  }

  try {
    // req.body should be the raw body for webhook verification
    const event = constructWebhookEvent(req.body, signature)

    await handleWebhookEvent(event)

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(400).json({ error: 'Webhook signature verification failed' })
  }
}
