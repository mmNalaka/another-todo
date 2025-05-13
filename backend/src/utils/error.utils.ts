import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export type ErrorCode =
  // Common
  | 'INTERNAL_SERVER_ERROR'
  | 'BAD_REQUEST'
  // Auth
  | 'USER_ALREADY_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'

interface ErrorResponse {
  success: false
  error: {
    message: string
    code: ErrorCode
  }
}

export const errorCodes: Record<
  ErrorCode,
  // eslint-disable-next-line style/member-delimiter-style
  { status: number; message: string }
> = {
  // Common
  INTERNAL_SERVER_ERROR: { status: 500, message: 'Internal server error' },
  BAD_REQUEST: { status: 400, message: 'Bad request' },
  // Auth
  USER_ALREADY_EXISTS: { status: 400, message: 'User already exists' },
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid credentials' },
  UNAUTHORIZED: { status: 401, message: 'Unauthorized' },
  FORBIDDEN: { status: 403, message: 'Forbidden' },
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  VALIDATION_ERROR: { status: 400, message: 'Validation error' },
}

// Create error response
export function createErrorResponse(
  c: Context,
  code: ErrorCode,
  message?: string,
  status?: number,
  data?: any,
): Response {
  const errorInfo = errorCodes[code]
  const responseStatus = (status || errorInfo.status) as ContentfulStatusCode
  const responseMessage = message || errorInfo.message

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: responseMessage,
      code,
      ...data,
    },
  }

  return c.json(errorResponse, responseStatus)
}
