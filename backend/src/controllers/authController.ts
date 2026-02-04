import { Request, Response } from 'express'
import { ZodError } from 'zod'
import * as authService from '../services/authService.js'
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  AuthenticatedRequest
} from '../types/auth.js'

/**
 * Register a new user
 */
export async function register(req: Request, res: Response) {
  try {
    const validated = RegisterSchema.parse(req.body)
    const result = await authService.register(validated)

    res.status(201).json(result)
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid request', details: error.errors })
      return
    }
    if (error instanceof Error && error.message === 'Email already registered') {
      res.status(409).json({ error: error.message })
      return
    }
    console.error('Error registering user:', error)
    res.status(500).json({ error: 'Failed to register user' })
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response) {
  try {
    const validated = LoginSchema.parse(req.body)
    const result = await authService.login(validated)

    res.json(result)
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid request', details: error.errors })
      return
    }
    if (error instanceof Error && error.message === 'Invalid email or password') {
      res.status(401).json({ error: error.message })
      return
    }
    console.error('Error logging in:', error)
    res.status(500).json({ error: 'Failed to login' })
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' })
      return
    }

    const result = await authService.refreshAccessToken(refreshToken)

    if (!result) {
      res.status(401).json({ error: 'Invalid or expired refresh token' })
      return
    }

    res.json(result)
  } catch (error) {
    console.error('Error refreshing token:', error)
    res.status(500).json({ error: 'Failed to refresh token' })
  }
}

/**
 * Logout user
 */
export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      await authService.logout(refreshToken)
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error logging out:', error)
    res.status(500).json({ error: 'Failed to logout' })
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    res.json({ user: req.user })
  } catch (error) {
    console.error('Error getting current user:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
}

/**
 * Request password reset
 */
export async function forgotPassword(req: Request, res: Response) {
  try {
    const validated = ForgotPasswordSchema.parse(req.body)
    const token = await authService.createPasswordResetToken(validated.email)

    // Always return success to not reveal if email exists
    // In production, send email with reset link containing the token
    if (token) {
      console.log(`Password reset token for ${validated.email}: ${token}`)
      // TODO: Send email with reset link
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid request', details: error.errors })
      return
    }
    console.error('Error requesting password reset:', error)
    res.status(500).json({ error: 'Failed to process request' })
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const validated = ResetPasswordSchema.parse(req.body)
    const success = await authService.resetPassword(validated.token, validated.password)

    if (!success) {
      res.status(400).json({ error: 'Invalid or expired reset token' })
      return
    }

    res.json({ success: true, message: 'Password has been reset successfully' })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid request', details: error.errors })
      return
    }
    console.error('Error resetting password:', error)
    res.status(500).json({ error: 'Failed to reset password' })
  }
}
