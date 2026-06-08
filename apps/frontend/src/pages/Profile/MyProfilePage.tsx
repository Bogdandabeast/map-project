import { IonButton, IonContent, IonPage, IonText } from '@ionic/react'
import { useAuth } from '../../components/auth/AuthProvider'
import { ProtectedRoute } from '../../components/auth/ProtectedRoute'
import { APP_URL } from '../../env'
import { signOut } from '../../lib/auth-client'

export function MyProfilePage() {
  return (
    <ProtectedRoute>
      <IonPage>
        <IonContent>
          <MyProfileContent />
        </IonContent>
      </IonPage>
    </ProtectedRoute>
  )
}

function MyProfileContent() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = `${APP_URL}/login`
        },
      },
    })
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1 data-testid="profile-title">Mi perfil</h1>

      <div style={{ marginTop: '1rem' }}>
        <IonText>
          <p data-testid="profile-name">
            <strong>Nombre:</strong>
            {' '}
            {user.name || 'Sin nombre'}
          </p>
        </IonText>
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <IonText>
          <p data-testid="profile-email">
            <strong>Email:</strong>
            {' '}
            {user.email || 'Sin email'}
          </p>
        </IonText>
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <IonText>
          <p>
            <strong>Rol:</strong>
            {' '}
            <span data-testid="profile-role">{(user as { role?: string }).role || 'user'}</span>
          </p>
        </IonText>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <IonButton
          data-testid="profile-signout"
          expand="block"
          color="danger"
          onClick={handleSignOut}
        >
          Cerrar sesión
        </IonButton>
      </div>
    </div>
  )
}
