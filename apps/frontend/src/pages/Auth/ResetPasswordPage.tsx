import { IonButton, IonInput, IonItem, IonLabel, IonText } from '@ionic/react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { resetPassword } from '../../lib/auth-client'

export function ResetPasswordPage() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const token = params.get('token')

  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState(token ? '' : 'Token inválido o faltante')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token)
      return

    setErrorMessage('')
    setIsLoading(true)

    try {
      const result = await resetPassword({
        token,
        newPassword: password,
      })

      if (result?.error) {
        setErrorMessage(result.error.message || 'Error al cambiar contraseña')
      }
      else {
        // Redirect handled by result status or navigation
        window.location.href = '/login'
      }
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cambiar contraseña'
      setErrorMessage(message)
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1 data-testid="reset-title">Cambiar contraseña</h1>

      <form onSubmit={handleSubmit}>
        <IonItem>
          <IonLabel position="stacked">Nueva contraseña</IonLabel>
          <IonInput
            data-testid="reset-password"
            type="password"
            value={password}
            required
            minlength={8}
            onIonChange={e => setPassword(e.detail.value!)}
          />
        </IonItem>

        {errorMessage && (
          <IonText data-testid="reset-error" color="danger">
            <p>{errorMessage}</p>
          </IonText>
        )}

        <div style={{ marginTop: '1rem' }}>
          <IonButton
            data-testid="reset-submit"
            type="submit"
            expand="block"
            disabled={isLoading || !token}
          >
            {isLoading ? 'Cambiando' : 'Cambiar contraseña'}
          </IonButton>
        </div>
      </form>
    </div>
  )
}
