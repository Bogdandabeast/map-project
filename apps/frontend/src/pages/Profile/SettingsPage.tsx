import { useState } from 'react'
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
} from '@ionic/react'
import { ProtectedRoute } from '../../components/auth/ProtectedRoute'
import { deleteUser } from '../../lib/auth-client'

export function SettingsPage() {
  return (
    <ProtectedRoute>
      <IonPage>
        <IonContent>
          <SettingsContent />
        </IonContent>
      </IonPage>
    </ProtectedRoute>
  )
}

function SettingsContent() {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [language, setLanguage] = useState('es')
  const [theme, setTheme] = useState('system')

  const handleDeleteConfirm = async () => {
    setShowDeleteAlert(false)
    await deleteUser({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/login'
        },
      },
    })
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1 data-testid="settings-title">Configuración</h1>

      <IonList>
        <IonItem>
          <IonLabel>Idioma</IonLabel>
          <IonSelect
            data-testid="settings-language"
            value={language}
            onIonChange={e => setLanguage(e.detail.value)}
          >
            <IonSelectOption value="es">Español</IonSelectOption>
            <IonSelectOption value="en">English</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel>Tema</IonLabel>
          <IonSelect
            data-testid="settings-theme"
            value={theme}
            onIonChange={e => setTheme(e.detail.value)}
          >
            <IonSelectOption value="system">Sistema</IonSelectOption>
            <IonSelectOption value="light">Claro</IonSelectOption>
            <IonSelectOption value="dark">Oscuro</IonSelectOption>
          </IonSelect>
        </IonItem>
      </IonList>

      <div style={{ marginTop: '2rem' }}>
        <IonText color="medium">
          <p>Zona de peligro</p>
        </IonText>
        <IonButton
          data-testid="settings-delete-account"
          expand="block"
          color="danger"
          onClick={() => setShowDeleteAlert(true)}
        >
          Eliminar cuenta
        </IonButton>
      </div>

      {showDeleteAlert && (
        <div data-testid="settings-delete-alert" style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--ion-color-danger)', borderRadius: '8px' }}>
          <p>Esta acción es irreversible. ¿Estás seguro de que querés eliminar tu cuenta?</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <IonButton
              data-testid="settings-delete-cancel"
              onClick={() => setShowDeleteAlert(false)}
            >
              Cancelar
            </IonButton>
            <IonButton
              data-testid="settings-delete-confirm"
              color="danger"
              onClick={handleDeleteConfirm}
            >
              Eliminar
            </IonButton>
          </div>
        </div>
      )}
    </div>
  )
}
