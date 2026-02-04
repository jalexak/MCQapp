import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia'
})

// Price ID for the subscription plan - set this in environment or hardcode for MVP
const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_xxx'

/**
 * Create or get a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  // Check if user already has a subscription record with customer ID
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId }
  })

  if (existingSubscription) {
    return existingSubscription.stripeCustomerId
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: { userId }
  })

  // Create subscription record (without active subscription yet)
  await prisma.subscription.create({
    data: {
      userId,
      stripeCustomerId: customer.id,
      status: 'inactive'
    }
  })

  return customer.id
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string }> {
  const customerId = await getOrCreateStripeCustomer(userId, email)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: SUBSCRIPTION_PRICE_ID,
        quantity: 1
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId
    }
  })

  return {
    sessionId: session.id,
    url: session.url || ''
  }
}

/**
 * Create a Stripe billing portal session for subscription management
 */
export async function createPortalSession(
  userId: string,
  returnUrl: string
): Promise<{ url: string }> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  })

  if (!subscription) {
    throw new Error('No subscription found for user')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl
  })

  return { url: session.url }
}

/**
 * Get subscription status for a user
 */
export async function getSubscriptionStatus(userId: string): Promise<{
  hasActiveSubscription: boolean
  status: string
  currentPeriodEnd: Date | null
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  })

  if (!subscription) {
    return {
      hasActiveSubscription: false,
      status: 'none',
      currentPeriodEnd: null
    }
  }

  const isActive = subscription.status === 'active'

  return {
    hasActiveSubscription: isActive,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutCompleted(session)
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdate(subscription)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionDeleted(subscription)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      await handlePaymentSucceeded(invoice)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await handlePaymentFailed(invoice)
      break
    }

    default:
      console.log(`Unhandled webhook event type: ${event.type}`)
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  // Find user by Stripe customer ID
  const subscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!subscription) {
    console.error(`No subscription record found for customer ${customerId}`)
    return
  }

  // Get full subscription details from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Update subscription record
  await prisma.subscription.update({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: subscriptionId,
      stripePriceId: stripeSubscription.items.data[0]?.price.id || null,
      status: 'active',
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
    }
  })

  // Update user's subscription status
  await prisma.user.update({
    where: { id: subscription.userId },
    data: {
      subscriptionStatus: 'active',
      subscriptionEnd: new Date(stripeSubscription.current_period_end * 1000)
    }
  })

  console.log(`Subscription activated for user ${subscription.userId}`)
}

/**
 * Handle subscription updates (renewals, plan changes)
 */
async function handleSubscriptionUpdate(stripeSubscription: Stripe.Subscription): Promise<void> {
  const customerId = stripeSubscription.customer as string

  const subscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!subscription) {
    console.error(`No subscription record found for customer ${customerId}`)
    return
  }

  // Map Stripe status to our status
  let status = 'inactive'
  if (stripeSubscription.status === 'active') {
    status = 'active'
  } else if (stripeSubscription.status === 'past_due') {
    status = 'past_due'
  } else if (stripeSubscription.status === 'canceled') {
    status = 'cancelled'
  }

  // Update subscription record
  await prisma.subscription.update({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0]?.price.id || null,
      status,
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
    }
  })

  // Update user's subscription status
  await prisma.user.update({
    where: { id: subscription.userId },
    data: {
      subscriptionStatus: status,
      subscriptionEnd: new Date(stripeSubscription.current_period_end * 1000)
    }
  })

  console.log(`Subscription updated for user ${subscription.userId}: ${status}`)
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
  const customerId = stripeSubscription.customer as string

  const subscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!subscription) {
    console.error(`No subscription record found for customer ${customerId}`)
    return
  }

  // Update subscription record
  await prisma.subscription.update({
    where: { stripeCustomerId: customerId },
    data: {
      status: 'cancelled',
      stripeSubscriptionId: null
    }
  })

  // Update user's subscription status
  await prisma.user.update({
    where: { id: subscription.userId },
    data: {
      subscriptionStatus: 'cancelled'
    }
  })

  console.log(`Subscription cancelled for user ${subscription.userId}`)
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string

  const subscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!subscription) {
    return // May be a one-time payment, not a subscription
  }

  // Ensure subscription is marked as active after successful payment
  if (subscription.status !== 'active') {
    await prisma.subscription.update({
      where: { stripeCustomerId: customerId },
      data: { status: 'active' }
    })

    await prisma.user.update({
      where: { id: subscription.userId },
      data: { subscriptionStatus: 'active' }
    })
  }

  console.log(`Payment succeeded for user ${subscription.userId}`)
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string

  const subscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!subscription) {
    return
  }

  // Mark subscription as past_due
  await prisma.subscription.update({
    where: { stripeCustomerId: customerId },
    data: { status: 'past_due' }
  })

  await prisma.user.update({
    where: { id: subscription.userId },
    data: { subscriptionStatus: 'past_due' }
  })

  console.log(`Payment failed for user ${subscription.userId}`)
}

/**
 * Construct and verify Stripe webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

export { stripe }
