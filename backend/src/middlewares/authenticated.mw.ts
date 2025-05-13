import type { MiddlewareHandler } from 'hono/types'

export function authenticated(): MiddlewareHandler {
  return async (c, next) => {
    const token = c.req.header('Authorization')
    if (!token) {
      return c.json({ message: 'Unauthorized' }, 401)
    }
    await next()
  }
}
