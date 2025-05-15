import type { MiddlewareHandler } from 'hono/types'

import { tokenService } from '@/services/token.service'
import { createErrorResponse } from '@/utils/error.utils'

export type AuthenticatedUser = {
  id: string
  email: string
}

export function authenticatedMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    try {
      // Get the Authorization header
      const authHeader = c.req.header('Authorization')

      // Check if Authorization header exists
      if (!authHeader) {
        return createErrorResponse(
          c,
          'UNAUTHORIZED',
          'Authorization header is required',
        )
      }

      // Check if it's a Bearer token
      if (!authHeader.startsWith('Bearer ')) {
        return createErrorResponse(
          c,
          'UNAUTHORIZED',
          'Bearer token is required',
        )
      }

      // Extract the token
      const token = authHeader.substring(7)

      // Verify the token
      const payload = await tokenService.verifyAccessToken(token)

      // Set user information in the context for use in route handlers
      c.set('user', {
        id: payload.userId,
        email: payload.email,
      } as AuthenticatedUser)

      await next()
    } catch (error: any) {
      // Handle specific token verification errors
      if (error.message === 'Invalid access token') {
        return createErrorResponse(
          c,
          'UNAUTHORIZED',
          'Invalid or expired token',
        )
      }

      // Handle any other errors
      return createErrorResponse(c, 'UNAUTHORIZED', 'Authentication failed')
    }
  }
}
