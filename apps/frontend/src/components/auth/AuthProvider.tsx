import type { Session, User } from 'better-auth'
import type { ReactNode } from 'react'
import { IonSpinner } from '@ionic/react'
import { createContext, useContext } from 'react'
import { useSession } from '../../lib/auth-client'

/* eslint-disable react-refresh/only-export-components --
   AuthProvider and useAuth are a cohesive unit; splitting adds indirection */

interface AuthContextType {
  session: Session | null
  user: User | null
  isPending: boolean
  isAuthenticated: boolean
  error: Error | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, error } = useSession()
  const user = session?.user ?? null
  const isAuthenticated = !!user && !error

  if (isPending) {
    return (
      <div
        data-testid="auth-loading"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <IonSpinner name="crescent" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line react/no-context-provider -- React 18 pattern
    <AuthContext.Provider value={{ session, user, isPending, isAuthenticated, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  // eslint-disable-next-line react/no-use-context -- React 18 uses useContext
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
