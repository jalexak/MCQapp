import { z } from 'zod'
import { Request } from 'express'
import { User, UserRole } from '@prisma/client'

// Validation schemas
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional()
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

// Types inferred from schemas
export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>

// JWT payload
export interface JwtPayload {
  userId: string
  email: string
  role: UserRole
}

// Safe user type (without password)
export type SafeUser = Omit<User, 'passwordHash'>

// Extended request with user
export interface AuthenticatedRequest extends Request {
  user?: SafeUser
}

// Auth response
export interface AuthResponse {
  user: SafeUser
  accessToken: string
  refreshToken: string
}
