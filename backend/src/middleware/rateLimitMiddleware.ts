import rateLimit from 'express-rate-limit'

/**
 * Rate limiter for authentication endpoints (login, register, password reset)
 * Prevents brute force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
})

/**
 * Stricter rate limiter for password reset
 * Prevents email enumeration and spam
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    error: 'Too many password reset attempts, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * General API rate limiter
 * Prevents abuse of API endpoints
 */
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: {
    error: 'Too many requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Rate limiter for exam operations
 * Slightly more permissive but still protective
 */
export const examRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: {
    error: 'Too many exam requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Rate limiter for Stripe checkout
 * Prevents checkout session creation abuse
 */
export const stripeRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 checkout sessions per hour
  message: {
    error: 'Too many checkout attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
})
