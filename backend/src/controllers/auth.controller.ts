import { zValidator } from '@hono/zod-validator'
import bcrypt from 'bcrypt'

import type { AuthenticatedUser } from '@/middlewares/authenticated.mw'

import {
  createNewUser,
  getUserByEmail,
  getUserById,
} from '@/db/repositories/user.repo'
import { authenticatedMiddleware } from '@/middlewares/authenticated.mw'
import { tokenService } from '@/services/token.service'
import { createErrorResponse } from '@/utils/error.utils'
import { factory } from '@/utils/hono.utils'
import {
  refreshTokenBodySchema,
  signInBodySchema,
  signUpBodySchema,
} from '@/validations/auth.validations'

// GET /signup - Signup using email and password
export const authSignupHandler = factory.createHandlers(
  zValidator('json', signUpBodySchema),
  async (c) => {
    const data = c.req.valid('json')

    // Check if user already exists
    const existingUser = await getUserByEmail(data.email)
    if (existingUser) {
      return createErrorResponse(c, 'USER_ALREADY_EXISTS')
    }

    // Hash password and create new user
    const hashedPassword = await bcrypt.hash(data.password, 10)
    const newUser = await createNewUser({
      ...data,
      hashedPassword,
    })

    // Create access token and refresh token
    const tokenData = await tokenService.generateTokens(newUser)

    return c.json({
      success: true,
      message: 'OK',
      data: tokenData,
    })
  },
)

// POST /signin - Signin using email and password
export const authSignHandler = factory.createHandlers(
  zValidator('json', signInBodySchema),
  async (c) => {
    const data = c.req.valid('json')

    // Check if user exists
    const user = await getUserByEmail(data.email)
    if (!user) {
      return createErrorResponse(c, 'INVALID_CREDENTIALS')
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(
      data.password,
      user.hashedPassword,
    )
    if (!isPasswordCorrect) {
      return createErrorResponse(c, 'INVALID_CREDENTIALS')
    }

    // Create access token and refresh token
    const tokenData = await tokenService.generateTokens(user)
    return c.json({
      success: true,
      message: 'OK',
      data: tokenData,
    })
  },
)

// GET /me - Get current user
export const authMeHandler = factory.createHandlers(
  authenticatedMiddleware(),
  async (c) => {
    // Get user info from context (already set by the middleware)
    const userInfo = c.get('user' as any) as AuthenticatedUser

    if (!userInfo || !userInfo.id) {
      return createErrorResponse(
        c,
        'UNAUTHORIZED',
        'User information not found',
      )
    }

    // Get user details from database
    const user = await getUserById(userInfo.id)

    // Check if user exists
    if (!user) {
      return createErrorResponse(c, 'NOT_FOUND', 'User not found')
    }

    // Remove sensitive data
    const { hashedPassword, ...userData } = user

    return c.json({
      success: true,
      message: 'Success',
      data: {
        user: userData,
      },
    })
  },
)

// POST /refresh - Refresh access token
export const authRefreshHandler = factory.createHandlers(
  zValidator('json', refreshTokenBodySchema),
  async (c) => {
    // Get refresh token from request body
    const { refreshToken } = c.req.valid('json')
    if (!refreshToken) {
      return createErrorResponse(c, 'UNAUTHORIZED', 'Refresh token is required')
    }

    // Verify and refresh access token
    const tokenData = await tokenService.refreshAccessToken(refreshToken)
    if (!tokenData) {
      return createErrorResponse(c, 'UNAUTHORIZED', 'Invalid refresh token')
    }

    return c.json({
      success: true,
      message: 'OK',
      data: tokenData,
    })
  },
)

// GET /signout - Signout
export const authSignoutHandler = factory.createHandlers(
  authenticatedMiddleware(),
  async (c) => {
    // Get user info from context (already set by the middleware)
    const userInfo = c.get('user' as any) as AuthenticatedUser

    if (!userInfo || !userInfo.id) {
      return createErrorResponse(c, 'UNAUTHORIZED')
    }

    // Revoke refresh tokens
    const isRevoked = await tokenService.revokeRefreshToken(userInfo.id)
    if (!isRevoked) {
      return createErrorResponse(c, 'INTERNAL_SERVER_ERROR')
    }
    return c.json({
      success: true,
      message: 'Signed out successfully',
    })
  },
)
