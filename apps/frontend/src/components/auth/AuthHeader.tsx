import {
  IonButton,
  IonButtons,
  IonHeader,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { Link } from 'react-router-dom'
import { authClient } from '../../lib/auth-client'

/**
 * Navigation header that adapts to auth state.
 * - Unauthenticated: shows Sign In and Sign Up links
 * - Authenticated: shows user name, Map link, and Sign Out button
 */
export function AuthHeader() {
  const { data: session } = authClient.useSession()

  async function handleSignOut() {
    try {
      await authClient.signOut()
    }
    catch (error) {
      console.error('Sign out failed:', error)
    }
    finally {
      window.location.href = '/login'
    }
  }

  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Map Project
          </Link>
        </IonTitle>

        <IonButtons slot="end">
          {session
            ? (
                <>
                  <IonText color="medium">
                    <small>{session.user.name ?? session.user.email}</small>
                  </IonText>
                  <IonButton routerLink="/map">
                    Map
                  </IonButton>
                  <IonButton color="danger" onClick={handleSignOut}>
                    Sign Out
                  </IonButton>
                </>
              )
            : (
                <>
                  <IonButton routerLink="/login">
                    Sign In
                  </IonButton>
                  <IonButton routerLink="/signup">
                    Sign Up
                  </IonButton>
                </>
              )}
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  )
}
