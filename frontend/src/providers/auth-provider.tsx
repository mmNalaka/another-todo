import { createContext, useContext } from 'react'

import type { SignInCredentials, SignUpCredentials, User } from '@/lib/api/auth'
import { useAuthQuery } from '@/hooks/use-auth-query'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (credentials: SignInCredentials) => void
  signUp: (credentials: SignUpCredentials) => void
  signOut: () => void
  isSigningIn: boolean
  isSigningUp: boolean
  signInError: Error | null
  signUpError: Error | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signInError,
    isSigningIn,
    signUp,
    signUpError,
    isSigningUp,
    signOut,
  } = useAuthQuery()

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        signIn,
        signUp,
        signOut,
        isSigningIn,
        isSigningUp,
        signInError,
        signUpError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
