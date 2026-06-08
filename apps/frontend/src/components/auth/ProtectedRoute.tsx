import type { ReactNode } from 'react'
import { IonSpinner } from '@ionic/react'
import { Redirect } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isPending, isAuthenticated } = useAuth()

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

  if (!isAuthenticated) {
    return <Redirect to="/explore" />
  }

  return <>{children}</>
}
