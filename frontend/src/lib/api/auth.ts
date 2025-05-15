import { env } from '@/env'

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends SignInCredentials {
  name: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export type UserResponse = {
  success: boolean
  message: string
  data: {
    user: User
  }
}

const API_URL = env.VITE_API_URL

export const authApi = {
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to sign in')
    }

    return response.json()
  },

  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to sign up')
    }

    return response.json()
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    return response.json()
  },

  async getUser(token: string): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get user')
    }

    return response.json()
  },

  async signOut(token: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/signout`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to sign out')
    }
  },
}
