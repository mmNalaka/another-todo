import { addDays, addMinutes } from 'date-fns'
import { and, eq } from 'drizzle-orm'
import { sign, verify } from 'hono/jwt'

import env from '@/config/env.config'
import { db } from '@/db'
import { refreshTokensTable } from '@/db/schemas/auth.schema'
import { type User } from '@/db/schemas/users.schema'

interface TokenPayload {
  [key: string]: unknown
  userId: string
  email: string
  exp?: number
}

interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export const tokenService = {
  // Generate access and refresh tokens
  async generateTokens(user: Partial<User>): Promise<TokenResponse> {
    if (!user.id) {
      throw new Error('User ID is required to generate tokens')
    }

    // Calculate expiry times
    const accessTokenExpiry = Math.floor(
      addMinutes(new Date(), env.ACCESS_TOKEN_EXPIRY_MINUTES).getTime() / 1000,
    )
    const refreshTokenExpiry = addDays(
      new Date(),
      env.REFRESH_TOKEN_EXPIRY_DAYS,
    )

    // Create token payload
    const tokenPayload: TokenPayload = {
      sub: user.id,
      userId: user.id,
      email: user.email || '',
      exp: accessTokenExpiry,
    }

    // Generate token pairs
    const accessToken = await sign(tokenPayload, env.JWT_SECRET)
    const refreshToken = await sign(
      {
        ...tokenPayload,
        exp: Math.floor(refreshTokenExpiry.getTime() / 1000),
      },
      env.JWT_SECRET,
    )

    // Store refresh token in database
    await db.insert(refreshTokensTable).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshTokenExpiry,
    })

    return {
      accessToken,
      refreshToken,
      expiresIn: env.ACCESS_TOKEN_EXPIRY_MINUTES * 60, // in seconds
    }
  },

  // Verify access token
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      return (await verify(token, env.JWT_SECRET)) as TokenPayload
    } catch (error) {
      throw new Error('Invalid access token')
    }
  },

  // Refresh an access token using a refresh token
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<TokenResponse | null> {
    try {
      // Verify the refresh token
      const decoded = (await verify(
        refreshToken,
        env.JWT_SECRET,
      )) as TokenPayload

      // Check if token exists in database and is not expired
      const storedToken = await db
        .select()
        .from(refreshTokensTable)
        .where(
          and(
            eq(refreshTokensTable.token, refreshToken),
            eq(refreshTokensTable.userId, decoded.userId),
          ),
        )
        .then((res) => res[0])

      if (!storedToken) {
        return null
      }

      // Generate new tokens
      return await this.generateTokens({
        id: decoded.userId,
        email: decoded.email,
      })
    } catch (error) {
      return null
    }
  },

  //  Revoke a refresh token
  async revokeRefreshToken(token: string): Promise<boolean> {
    try {
      await db
        .delete(refreshTokensTable)
        .where(eq(refreshTokensTable.token, token))

      return true
    } catch (error) {
      return false
    }
  },
}
