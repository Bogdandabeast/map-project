import { IonButton, IonInput, IonItem, IonLabel, IonText } from '@ionic/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../lib/auth-client'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const result = await forgotPassword.email({ email })

      if (result?.error) {
        setErrorMessage(result.error.message || 'Error al enviar instrucciones')
      }
      else {
        setSuccessMessage('Si el email existe, recibirás instrucciones para restablecer tu contraseña.')
      }
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar instrucciones'
      setErrorMessage(message)
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1 data-testid="forgot-title">Olvidé mi contraseña</h1>

      <form onSubmit={handleSubmit}>
        <IonItem>
          <IonLabel position="stacked">Email</IonLabel>
          <IonInput
            data-testid="forgot-email"
            type="email"
            value={email}
            required
            onIonChange={e => setEmail(e.detail.value!)}
          />
        </IonItem>

        {errorMessage && (
          <IonText data-testid="forgot-error" color="danger">
            <p>{errorMessage}</p>
          </IonText>
        )}

        {successMessage && (
          <IonText data-testid="forgot-success" color="success">
            <p>{successMessage}</p>
          </IonText>
        )}

        <div style={{ marginTop: '1rem' }}>
          <IonButton
            data-testid="forgot-submit"
            type="submit"
            expand="block"
            disabled={isLoading}
          >
            {isLoading ? 'Enviando' : 'Enviar instrucciones'}
          </IonButton>
        </div>
      </form>

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link data-testid="forgot-to-login" to="/login">Volver al inicio de sesión</Link>
      </div>
    </div>
  )
}
