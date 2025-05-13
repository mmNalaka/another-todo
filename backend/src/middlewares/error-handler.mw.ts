import type { MiddlewareHandler } from 'hono'

import { ZodError } from 'zod'

import type { ErrorCode } from '@/utils/error.utils'

import env from '@/config/env.config'
import { createErrorResponse, errorCodes } from '@/utils/error.utils'

/**
 * Global error handler middleware for the application
 * Catches all errors and formats them consistently
 */
export function errorHandler(): MiddlewareHandler {
  return async (c, next) => {
    try {
      await next()
    }
    catch (err: any) {
      const logger = c.get('logger') || console

      // Get request information for better error tracking
      const method = c.req.method
      const path = c.req.path
      const requestId = c.get('requestId') || 'unknown'

      // Log the error with context
      logger.error({
        err,
        requestId,
        method,
        path,
        message: 'Request error',
        stack: err.stack,
      })

      // Handle ZodError (validation errors)
      if (err instanceof ZodError) {
        return createErrorResponse(
          c,
          'VALIDATION_ERROR',
          'Validation failed',
          400,
          {
            issues: err.issues,
          },
        )
      }

      // Handle known error types with specific codes
      if (err.code && Object.keys(errorCodes).includes(err.code)) {
        return createErrorResponse(c, err.code as ErrorCode, err.message)
      }

      // Handle unauthorized errors
      if (
        err.message?.includes('unauthorized')
        || err.message?.includes('Unauthorized')
      ) {
        return createErrorResponse(c, 'UNAUTHORIZED')
      }

      // Handle not found errors
      if (
        err.message?.includes('not found')
        || err.message?.includes('Not found')
      ) {
        return createErrorResponse(c, 'NOT_FOUND')
      }

      // Default to internal server error for unhandled errors
      return createErrorResponse(
        c,
        'INTERNAL_SERVER_ERROR',
        env.NODE_ENV === 'production' ? undefined : err.message,
      )
    }
  }
}
