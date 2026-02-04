import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient, User, UserRole } from '@prisma/client'
import crypto from 'crypto'
import {
  RegisterInput,
  LoginInput,
  JwtPayload,
  SafeUser,
  AuthResponse
} from '../types/auth.js'

const prisma = new PrismaClient()

const SALT_ROUNDS = 12
const ACCESS_TOKEN_EXPIRY = '15m'
const RESET_TOKEN_EXPIRY_HOURS = 1

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return secret
}


/**
 * Remove password hash from user object
 */
function toSafeUser(user: User): SafeUser {
  const { passwordHash, ...safeUser } = user
  return safeUser
}

/**
 * Generate access token
 */
function generateAccessToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY })
}

/**
 * Generate refresh token and store in database
 */
async function generateRefreshToken(user: User): Promise<string> {
  const token = crypto.randomBytes(64).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  await prisma.refreshToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt
    }
  })

  return token
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload
  } catch {
    return null
  }
}

/**
 * Register a new user
 */
export async function register(input: RegisterInput): Promise<AuthResponse> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() }
  })

  if (existingUser) {
    throw new Error('Email already registered')
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)

  // Create user
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name
    }
  })

  // Generate tokens
  const accessToken = generateAccessToken(user)
  const refreshToken = await generateRefreshToken(user)

  return {
    user: toSafeUser(user),
    accessToken,
    refreshToken
  }
}

/**
 * Login user
 */
export async function login(input: LoginInput): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() }
  })

  if (!user) {
    throw new Error('Invalid email or password')
  }

  const validPassword = await bcrypt.compare(input.password, user.passwordHash)

  if (!validPassword) {
    throw new Error('Invalid email or password')
  }

  // Generate tokens
  const accessToken = generateAccessToken(user)
  const refreshToken = await generateRefreshToken(user)

  return {
    user: toSafeUser(user),
    accessToken,
    refreshToken
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string } | null> {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true }
  })

  if (!storedToken) {
    return null
  }

  if (storedToken.expiresAt < new Date()) {
    // Token expired, delete it
    await prisma.refreshToken.delete({ where: { id: storedToken.id } })
    return null
  }

  const accessToken = generateAccessToken(storedToken.user)
  return { accessToken }
}

/**
 * Logout - invalidate refresh token
 */
export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken }
  })
}

/**
 * Logout from all devices
 */
export async function logoutAll(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId }
  })
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  return user ? toSafeUser(user) : null
}

/**
 * Create password reset token
 */
export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })

  if (!user) {
    // Don't reveal if email exists
    return null
  }

  // Invalidate any existing tokens
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true }
  })

  // Generate new token
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRY_HOURS)

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt
    }
  })

  return token
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!resetToken) {
    return false
  }

  if (resetToken.used || resetToken.expiresAt < new Date()) {
    return false
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)

  // Update password and mark token as used
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true }
    }),
    // Invalidate all refresh tokens (force re-login)
    prisma.refreshToken.deleteMany({
      where: { userId: resetToken.userId }
    })
  ])

  return true
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<SafeUser | null> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role }
  })

  return toSafeUser(user)
}
