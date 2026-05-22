import { createContext, useContext } from 'react'

export interface AuthContextValue {
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextValue>({ isLoading: true })

/**
 * Hook to access auth loading state from AuthProvider context.
 */
export function useAuthLoading() {
  return useContext(AuthContext)
}
