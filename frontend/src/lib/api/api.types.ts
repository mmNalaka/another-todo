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

export interface ErrorResponse {
  success: false
  error: {
    message: string
    code: string
    [key: string]: any
  }
}

export type ListResp = PaginatedSuccessResponse<Array<List>>
export type List = {
  createdAt: string
  id: string
  isFrozen: boolean
  isShared: boolean
  ownerId: string
  title: string
  updatedAt: string
}
