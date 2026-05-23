import { IonLoading, IonText } from '@ionic/react'
import { Redirect } from 'react-router-dom'
import { authClient } from '../../lib/auth-client'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Route guard that checks for an active session.
 * Shows IonLoading while session is pending.
 * Shows an error state if session check fails.
 * Redirects to /login if no session exists.
 * Renders children if authenticated.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, isPending, error } = authClient.useSession()

  if (isPending) {
    return <IonLoading isOpen={true} message="Loading..." />
  }

  if (error) {
    console.error('[ProtectedRoute] Session check failed:', error)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <IonText color="danger">
          <h2>Authentication Error</h2>
          <p>An unexpected error occurred while checking your session.</p>
        </IonText>
      </div>
    )
  }

  if (!session) {
    return <Redirect to="/login" />
  }

  return <>{children}</>
}
