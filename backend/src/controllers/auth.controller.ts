import { zValidator } from '@hono/zod-validator'
import bcrypt from 'bcrypt'

import { createNewUser, getUserByEmail } from '@/db/repositories/user.repo'
import { tokenService } from '@/services/token.service'
import { createErrorResponse } from '@/utils/error.utils'
import { factory } from '@/utils/hono.utils'
import { signInSchema, signUpSchema } from '@/validations/auth.validations'

// GET /signup - Signup using email and password
export const authSignupHandler = factory.createHandlers(
  zValidator('json', signUpSchema),
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
  zValidator('json', signInSchema),
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
