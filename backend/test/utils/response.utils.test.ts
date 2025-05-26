import { describe, expect, it, vi } from 'vitest'

import {
  calculatePagination,
  createPaginatedResponse,
  createSuccessResponse,
  type PaginationInfo,
} from '@/utils/response.utils'

describe('response Utils', () => {
  describe('createSuccessResponse', () => {
    it('should create a success response with default parameters', () => {
      // Mock Hono context
      const mockContext = {
        json: vi.fn().mockReturnValue('mocked-response'),
      }

      // Sample data
      const data = { id: '123', name: 'Test Item' }

      // Call the function
      const response = createSuccessResponse(mockContext as any, data)

      // Check that context.json was called with the correct arguments
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          success: true,
          message: 'OK',
          data,
        },
        200,
      )

      // Check the return value
      expect(response).toBe('mocked-response')
    })

    it('should create a success response with custom message and status', () => {
      // Mock Hono context
      const mockContext = {
        json: vi.fn().mockReturnValue('mocked-response'),
      }

      // Sample data
      const data = { id: '123', name: 'Test Item' }

      // Call the function with custom message and status
      const response = createSuccessResponse(
        mockContext as any,
        data,
        'Item created successfully',
        201,
      )

      // Check that context.json was called with the correct arguments
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          success: true,
          message: 'Item created successfully',
          data,
        },
        201,
      )

      // Check the return value
      expect(response).toBe('mocked-response')
    })
  })

  describe('createPaginatedResponse', () => {
    it('should create a paginated success response with default parameters', () => {
      // Mock Hono context
      const mockContext = {
        json: vi.fn().mockReturnValue('mocked-response'),
      }

      // Sample data
      const data = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ]

      // Sample pagination info
      const pagination: PaginationInfo = {
        page: 1,
        limit: 10,
        total: 20,
        pages: 2,
      }

      // Call the function
      const response = createPaginatedResponse(
        mockContext as any,
        data,
        pagination,
      )

      // Check that context.json was called with the correct arguments
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          success: true,
          message: 'OK',
          data,
          pagination,
        },
        200,
      )

      // Check the return value
      expect(response).toBe('mocked-response')
    })

    it('should create a paginated success response with custom message and status', () => {
      // Mock Hono context
      const mockContext = {
        json: vi.fn().mockReturnValue('mocked-response'),
      }

      // Sample data
      const data = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ]

      // Sample pagination info
      const pagination: PaginationInfo = {
        page: 1,
        limit: 10,
        total: 20,
        pages: 2,
      }

      // Call the function with custom message and status
      const response = createPaginatedResponse(
        mockContext as any,
        data,
        pagination,
        'Items retrieved successfully',
        200,
      )

      // Check that context.json was called with the correct arguments
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          success: true,
          message: 'Items retrieved successfully',
          data,
          pagination,
        },
        200,
      )

      // Check the return value
      expect(response).toBe('mocked-response')
    })
  })

  describe('calculatePagination', () => {
    it('should calculate pagination info with default parameters', () => {
      // Call the function with just total
      const pagination = calculatePagination(100)

      // Check the result
      expect(pagination).toEqual({
        page: 1,
        limit: 20,
        total: 100,
        pages: 5, // 100 / 20 = 5
      })
    })

    it('should calculate pagination info with custom page and limit', () => {
      // Call the function with custom page and limit
      const pagination = calculatePagination(100, 2, 25)

      // Check the result
      expect(pagination).toEqual({
        page: 2,
        limit: 25,
        total: 100,
        pages: 4, // 100 / 25 = 4
      })
    })

    it('should handle non-integer division for pages calculation', () => {
      // Call the function with values that don't divide evenly
      const pagination = calculatePagination(101, 1, 20)

      // Check the result - should round up to 6 pages
      expect(pagination).toEqual({
        page: 1,
        limit: 20,
        total: 101,
        pages: 6, // 101 / 20 = 5.05, rounded up to 6
      })
    })

    it('should handle zero total items', () => {
      // Call the function with zero total
      const pagination = calculatePagination(0)

      // Check the result
      expect(pagination).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0, // 0 / 20 = 0
      })
    })
  })
})
