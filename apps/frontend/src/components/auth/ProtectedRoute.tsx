import { IonLoading } from '@ionic/react'
import { Redirect } from 'react-router-dom'
import { authClient } from '../../lib/auth-client'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Route guard that checks for an active session.
 * Shows IonLoading while session is pending.
 * Redirects to /login if no session exists.
 * Renders children if authenticated.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <IonLoading isOpen={true} message="Loading..." />
  }

  if (!session) {
    return <Redirect to="/login" />
  }

  return <>{children}</>
}
