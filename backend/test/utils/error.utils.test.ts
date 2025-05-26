import { describe, it, expect, vi } from 'vitest'
import { createErrorResponse, errorCodes, type ErrorCode } from '../../src/utils/error.utils'

describe('Error Utils', () => {
  describe('errorCodes', () => {
    it('should have the correct error codes defined', () => {
      // Test that all error codes have the expected properties
      const expectedErrorCodes: ErrorCode[] = [
        'INTERNAL_SERVER_ERROR',
        'BAD_REQUEST',
        'USER_ALREADY_EXISTS',
        'INVALID_CREDENTIALS',
        'UNAUTHORIZED',
        'FORBIDDEN',
        'NOT_FOUND',
        'VALIDATION_ERROR',
      ]

      // Check that all expected error codes are defined
      expectedErrorCodes.forEach((code) => {
        expect(errorCodes).toHaveProperty(code)
        expect(errorCodes[code]).toHaveProperty('status')
        expect(errorCodes[code]).toHaveProperty('message')
        expect(typeof errorCodes[code].status).toBe('number')
        expect(typeof errorCodes[code].message).toBe('string')
      })
    })

    it('should have the correct status codes for each error', () => {
      // Test specific status codes
      expect(errorCodes.INTERNAL_SERVER_ERROR.status).toBe(500)
      expect(errorCodes.BAD_REQUEST.status).toBe(400)
      expect(errorCodes.USER_ALREADY_EXISTS.status).toBe(400)
      expect(errorCodes.INVALID_CREDENTIALS.status).toBe(401)
      expect(errorCodes.UNAUTHORIZED.status).toBe(401)
      expect(errorCodes.FORBIDDEN.status).toBe(403)
      expect(errorCodes.NOT_FOUND.status).toBe(404)
      expect(errorCodes.VALIDATION_ERROR.status).toBe(400)
    })
  })

  describe('createErrorResponse', () => {
    it('should create an error response with default message', () => {
      // Mock Hono context
      const mockContext = {
        json: vi.fn().mockReturnValue('mocked-response'),
      }

      // Call the function
      const response = createErrorResponse(
        mockContext as any,
        'NOT_FOUND'
      )

      // Check that context.json was called with the correct arguments
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'Resource not found',
            code: 'NOT_FOUND',
          },
        },
        404
      )

      // Check the return value
      expect(response).toBe('mocked-response')
    })

    it('should create an error response with custom message', () => {
      // Mock Hono context
      const mockContext = {
        json: vi.fn().mockReturnValue('mocked-response'),
      }

      // Call the function with custom message
      const response = createErrorResponse(
        mockContext as any,
        'NOT_FOUND',
        'Custom error message'
      )

      // Check that context.json was called with the correct arguments
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'Custom error message',
            code: 'NOT_FOUND',
          },
        },
        404
      )

      // Check the return value
      expect(response).toBe('mocked-response')
    })

    it('should create an error response with custom status', () => {
      // Mock Hono context
      const mockContext = {
        json: vi.fn().mockReturnValue('mocked-response'),
      }

      // Call the function with custom status
      const response = createErrorResponse(
        mockContext as any,
        'BAD_REQUEST',
        'Custom error message',
        422 // Custom status code
      )

      // Check that context.json was called with the correct arguments
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'Custom error message',
            code: 'BAD_REQUEST',
          },
        },
        422
      )

      // Check the return value
      expect(response).toBe('mocked-response')
    })

    it('should create an error response with additional data', () => {
      // Mock Hono context
      const mockContext = {
        json: vi.fn().mockReturnValue('mocked-response'),
      }

      // Additional data to include
      const additionalData = {
        fields: ['email', 'password'],
        details: 'Validation failed for these fields',
      }

      // Call the function with additional data
      const response = createErrorResponse(
        mockContext as any,
        'VALIDATION_ERROR',
        'Validation failed',
        400,
        additionalData
      )

      // Check that context.json was called with the correct arguments
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            ...additionalData,
          },
        },
        400
      )

      // Check the return value
      expect(response).toBe('mocked-response')
    })
  })
})
