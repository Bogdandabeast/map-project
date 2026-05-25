import { IonLoading } from '@ionic/react'
import { useEffect } from 'react'
import { useMachine } from '../../hooks/useMachine'
import { authClient } from '../../lib/auth-client'
import { AuthContext } from './auth-context'
import { sessionMachine } from './sessionMachine'

/**
 * Provides the auth session loading state to the entire app.
 * Calls getSession() on mount to check for an existing session cookie.
 * Shows an IonLoading spinner while the check is in progress.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, send] = useMachine(sessionMachine)

  useEffect(() => {
    let mounted = true

    authClient
      .getSession()
      .then((session) => {
        if (!mounted)
          return
        send({
          type: 'SESSION_RESOLVED',
          success: !!session,
          session,
        })
      })
      .catch(() => {
        if (!mounted)
          return
        send({ type: 'SESSION_RESOLVED', success: false })
      })

    return () => {
      mounted = false
    }
  }, [send])

  const isLoading = state.type === 'INITIALIZING'

  return (
    <AuthContext.Provider value={{ isLoading }}>
      <IonLoading isOpen={isLoading} message="Loading..." />
      {children}
    </AuthContext.Provider>
  )
}
