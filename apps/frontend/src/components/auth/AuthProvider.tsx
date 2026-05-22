import { IonLoading } from '@ionic/react'
import { useEffect, useState } from 'react'
import { authClient } from '../../lib/auth-client'
import { AuthContext } from './auth-context'

/**
 * Provides the auth session loading state to the entire app.
 * Calls getSession() on mount to check for an existing session cookie.
 * Shows an IonLoading spinner while the check is in progress.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    authClient
      .getSession()
      .then(() => {
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <AuthContext.Provider value={{ isLoading }}>
      <IonLoading isOpen={isLoading} message="Loading..." />
      {children}
    </AuthContext.Provider>
  )
}
