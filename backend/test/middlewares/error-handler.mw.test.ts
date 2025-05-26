/* eslint-disable antfu/if-newline */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'

import { errorHandler } from '@/middlewares/error-handler.mw'
import * as errorUtils from '@/utils/error.utils'

// Mock the error utils module
vi.mock('@/utils/error.utils', () => ({
  createErrorResponse: vi.fn().mockReturnValue('error-response'),
  errorCodes: {
    VALIDATION_ERROR: { status: 400, message: 'Validation error' },
    UNAUTHORIZED: { status: 401, message: 'Unauthorized' },
    NOT_FOUND: { status: 404, message: 'Not found' },
    INTERNAL_SERVER_ERROR: { status: 500, message: 'Internal server error' },
  },
}))

// Mock the env config
vi.mock('../../src/config/env.config', () => ({
  default: {
    NODE_ENV: 'development',
  },
}))

describe('error Handler Middleware', () => {
  let mockContext: any
  let mockNext: any
  let middleware: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Create a mock context with logger
    mockContext = {
      req: {
        method: 'GET',
        path: '/api/test',
      },
      get: vi.fn((key) => {
        if (key === 'logger') return { error: vi.fn() }
        if (key === 'requestId') return 'test-request-id'
        return undefined
      }),
    }

    // Create a mock next function
    mockNext = vi.fn()

    // Create the middleware
    middleware = errorHandler()
  })

  it('should call next() when no error occurs', async () => {
    // Call the middleware
    await middleware(mockContext, mockNext)

    // Verify next was called
    expect(mockNext).toHaveBeenCalled()

    // Verify createErrorResponse was not called
    expect(errorUtils.createErrorResponse).not.toHaveBeenCalled()
  })

  it('should handle ZodError correctly', async () => {
    // Create a ZodError with issues
    const zodError = new ZodError([
      {
        code: 'invalid_string',
        message: 'Invalid email',
        path: ['email'],
        validation: 'email',
      },
    ])

    // Manually add a stack property
    Object.defineProperty(zodError, 'stack', {
      value: 'ZodError stack trace',
      configurable: true,
      writable: true,
    })

    // Make next throw the ZodError
    mockNext.mockRejectedValue(zodError)

    // Call the middleware
    const response = await middleware(mockContext, mockNext)

    // Verify createErrorResponse was called with correct arguments
    expect(errorUtils.createErrorResponse).toHaveBeenCalledWith(
      mockContext,
      'VALIDATION_ERROR',
      'Validation failed',
      400,
      {
        issues: zodError.issues,
      },
    )

    // Verify the response
    expect(response).toBe('error-response')
  })

  it('should handle errors with known error codes', async () => {
    // Create an error with a known code
    const error = new Error('Not found error')
    // Need to add the code property in a way TypeScript recognizes
    Object.defineProperty(error, 'code', { value: 'NOT_FOUND' })
    // Add stack property to avoid undefined error
    error.stack = 'Error stack trace'

    // Make next throw the error
    mockNext.mockRejectedValue(error)

    // Call the middleware
    const response = await middleware(mockContext, mockNext)

    // Verify createErrorResponse was called with correct arguments
    expect(errorUtils.createErrorResponse).toHaveBeenCalledWith(
      mockContext,
      'NOT_FOUND',
      'Not found error',
    )

    // Verify the response
    expect(response).toBe('error-response')
  })

  it('should handle unauthorized errors based on message', async () => {
    // Create an error with unauthorized message
    const error = new Error('User is unauthorized')
    // Add stack property to avoid undefined error
    error.stack = 'Error stack trace'

    // Make next throw the error
    mockNext.mockRejectedValue(error)

    // Call the middleware
    const response = await middleware(mockContext, mockNext)

    // Verify createErrorResponse was called with correct arguments
    expect(errorUtils.createErrorResponse).toHaveBeenCalledWith(
      mockContext,
      'UNAUTHORIZED',
    )

    // Verify the response
    expect(response).toBe('error-response')
  })

  it('should handle not found errors based on message', async () => {
    // Create an error with not found message
    const error = new Error('Resource not found')
    // Add stack property to avoid undefined error
    error.stack = 'Error stack trace'

    // Make next throw the error
    mockNext.mockRejectedValue(error)

    // Call the middleware
    const response = await middleware(mockContext, mockNext)

    // Verify createErrorResponse was called with correct arguments
    expect(errorUtils.createErrorResponse).toHaveBeenCalledWith(
      mockContext,
      'NOT_FOUND',
    )

    // Verify the response
    expect(response).toBe('error-response')
  })

  it('should handle unknown errors as internal server errors', async () => {
    // Create an unknown error
    const error = new Error('Unknown error')
    // Add stack property to avoid undefined error
    error.stack = 'Error stack trace'

    // Make next throw the error
    mockNext.mockRejectedValue(error)

    // Call the middleware
    const response = await middleware(mockContext, mockNext)

    // Verify createErrorResponse was called with correct arguments
    expect(errorUtils.createErrorResponse).toHaveBeenCalledWith(
      mockContext,
      'INTERNAL_SERVER_ERROR',
      'Unknown error',
    )

    // Verify the response
    expect(response).toBe('error-response')
  })

  it('should log errors with appropriate context', async () => {
    // Create a mock logger
    const mockLogger = { error: vi.fn() }
    mockContext.get = vi.fn((key) => {
      if (key === 'logger') return mockLogger
      if (key === 'requestId') return 'test-request-id'
      return undefined
    })

    // Create an error
    const error = new Error('Test error')
    error.stack = 'Error stack trace'

    // Make next throw the error
    mockNext.mockRejectedValue(error)

    // Call the middleware
    await middleware(mockContext, mockNext)

    // Verify logger.error was called with correct arguments
    expect(mockLogger.error).toHaveBeenCalledWith({
      err: error,
      requestId: 'test-request-id',
      method: 'GET',
      path: '/api/test',
      message: 'Request error',
      stack: 'Error stack trace',
    })
  })

  it('should use console if logger is not available', async () => {
    // Remove logger from context
    mockContext.get = vi.fn((key) => {
      if (key === 'requestId') return 'test-request-id'
      return undefined
    })

    // Mock console.error
    const originalConsoleError = console.error
    console.error = vi.fn()

    try {
      // Create an error
      const error = new Error('Test error')
      error.stack = 'Error stack trace'

      // Make next throw the error
      mockNext.mockRejectedValue(error)

      // Call the middleware
      await middleware(mockContext, mockNext)

      // Verify console.error was called
      expect(console.error).toHaveBeenCalled()
    } finally {
      // Restore console.error
      console.error = originalConsoleError
    }
  })
})
