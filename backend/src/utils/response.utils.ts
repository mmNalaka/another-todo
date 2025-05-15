import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

// Interface for pagination information
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

// Interface for success response without pagination
export interface SuccessResponse<T = any> {
  success: true
  message: string
  data: T
}

// Interface for paginated success response
export interface PaginatedSuccessResponse<T = any> extends SuccessResponse<T> {
  pagination: PaginationInfo
}

/**
 * Creates a success response
 * @param c - Hono context
 * @param data - Response data
 * @param message - Response message (defaults to "OK")
 * @param status - HTTP status code (defaults to 200)
 * @returns Response object
 */
export function createSuccessResponse<T = any>(
  c: Context,
  data: T,
  message: string = 'OK',
  status: number = 200,
): Response {
  const responseStatus = status as ContentfulStatusCode

  const successResponse: SuccessResponse<T> = {
    success: true,
    message,
    data,
  }

  return c.json(successResponse, responseStatus)
}

/**
 * Creates a paginated success response
 * @param c - Hono context
 * @param data - Response data
 * @param pagination - Pagination information
 * @param message - Response message (defaults to "OK")
 * @param status - HTTP status code (defaults to 200)
 * @returns Response object
 */
export function createPaginatedResponse<T = any>(
  c: Context,
  data: T,
  pagination: PaginationInfo,
  message: string = 'OK',
  status: number = 200,
): Response {
  const responseStatus = status as ContentfulStatusCode

  const paginatedResponse: PaginatedSuccessResponse<T> = {
    success: true,
    message,
    data,
    pagination,
  }

  return c.json(paginatedResponse, responseStatus)
}

/**
 * Helper function to calculate pagination information
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Number of items per page
 * @returns Pagination information
 */
export function calculatePagination(
  total: number,
  page: number = 1,
  limit: number = 20,
): PaginationInfo {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  }
}
