import type { ReactNode } from 'react'
import { IonSpinner } from '@ionic/react'
import { createContext, useContext } from 'react'
import { useSession } from '../../lib/auth-client'

/* eslint-disable react-refresh/only-export-components --
   AuthProvider and useAuth are a cohesive unit; splitting adds indirection */

interface AuthContextType {
  session: Record<string, any> | null
  user: Record<string, any> | null
  isPending: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession()
  const user = session?.user ?? null
  const isAuthenticated = !!user

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
    <AuthContext.Provider value={{ session, user, isPending, isAuthenticated }}>
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
