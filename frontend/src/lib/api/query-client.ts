import { QueryClient } from '@tanstack/react-query'
import { env } from '@/env'

type Headers = Record<string, any>

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Create a function to get authenticated fetch for use with React Query
export async function authenticatedFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const API_URL = env.VITE_API_URL
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`

  const accessToken = localStorage.getItem('accessToken')

  const headers: Headers = {
    'Content-Type': 'application/json',
    ...options.headers,
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
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        })

        if (refreshResponse.ok) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await refreshResponse.json()

          // Update tokens in localStorage
          localStorage.setItem('accessToken', newAccessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          // Retry the original request with the new token
          headers['Authorization'] = `Bearer ${newAccessToken}`

          const retryResponse = await fetch(fullUrl, {
            ...options,
            headers,
          })

          if (retryResponse.ok) {
            return retryResponse.json()
          }
        }
      } catch (error) {
        // If refresh fails, clear tokens
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        queryClient.setQueryData(['user'], null)
        queryClient.invalidateQueries({ queryKey: ['user'] })
        window.location.href = '/login'
        throw new Error('Session expired. Please login again.')
      }
    }

    // If no refresh token or refresh failed, redirect to login
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
