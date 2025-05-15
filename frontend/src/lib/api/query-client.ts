import { env } from '@/env'
import { authApi } from './auth'
import { queryClient } from '@/integrations/tanstack-query/root-provider'

// Create a function to get authenticated fetch for use with React Query
export async function authenticatedFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const API_URL = env.VITE_API_URL
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`

  const accessToken = localStorage.getItem('accessToken')

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers as any),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  })

  // Handle 401 Unauthorized - Token might be expired
  if (response.status === 401) {
    // Try to refresh the token
    const refreshToken = localStorage.getItem('refreshToken')

    if (refreshToken) {
      try {
        const tokens = await authApi.refreshToken(refreshToken)
        // Update tokens in localStorage
        localStorage.setItem('accessToken', tokens.data.accessToken)
        localStorage.setItem('refreshToken', tokens.data.refreshToken)

        // Retry the original request with the new token
        headers['Authorization'] = `Bearer ${tokens.data.accessToken}`

        const retryResponse = await fetch(fullUrl, {
          ...options,
          headers,
        })

        if (retryResponse.ok) {
          return retryResponse.json()
        } else {
          // Handle failed retry - only clear tokens if it's a 401
          if (retryResponse.status === 401) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            queryClient.setQueryData(['user'], null)
            queryClient.invalidateQueries({ queryKey: ['user'] })
            window.location.href = '/login'
            throw new Error('Session expired. Please login again.')
          }

          // For other errors, throw without clearing tokens
          const errorData = await retryResponse.json().catch(() => ({}))
          throw new Error(errorData.message || 'Something went wrong')
        }
      } catch (error) {
        // Check if error is from refresh token request and is a 401
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          queryClient.setQueryData(['user'], null)
          queryClient.invalidateQueries({ queryKey: ['user'] })
          window.location.href = '/login'
          throw new Error('Session expired. Please login again.')
        }

        // For other errors, just throw without clearing tokens
        throw error
      }
    }

    // If no refresh token or
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    queryClient.setQueryData(['user'], null)
    queryClient.invalidateQueries({ queryKey: ['user'] })
    window.location.href = '/login'
    throw new Error('Unauthorized. Please login again.')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Something went wrong')
  }

  return response.json()
}
