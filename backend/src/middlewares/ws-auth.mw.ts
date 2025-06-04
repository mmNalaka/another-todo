import { createMiddleware } from 'hono/factory'

import { tokenService } from '@/services/token.service'

/**
 * Middleware to authenticate WebSocket connections using JWT
 */
export const wsAuthMiddleware = createMiddleware(async (c, next) => {
  // Get the token from the Authorization header or the token query parameter
  const authHeader = c.req.header('Authorization') || ''
  let token = authHeader.replace('Bearer ', '')

  // For WebSocket connections, the token might be passed as a query parameter
  // since some WebSocket implementations don't support custom headers
  if (!token) {
    token = c.req.query('token') || ''
  }

  if (!token) {
    c.status(401)
    return c.json({ error: 'Unauthorized: No token provided' })
  }

  try {
    // Verify the token using the existing token service
    const payload = await tokenService.verifyAccessToken(token)

    // Store the payload in the request context for later use
    c.set('jwtPayload', payload)

    // Continue to the next middleware or handler
    await next()
  } catch {
    c.status(401)
    return c.json({ error: 'Unauthorized: Invalid token' })
  }
})
