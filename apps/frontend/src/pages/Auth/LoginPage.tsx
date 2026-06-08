import { IonButton, IonInput, IonItem, IonLabel, IonText } from '@ionic/react'
import React, { useState } from 'react'
import { Link, Redirect } from 'react-router-dom'
import { signIn } from '../../lib/auth-client'
import { useAuth } from '../../components/auth/AuthProvider'
import { APP_URL } from '../../env'
import { OAuthButtons } from '../../components/auth/OAuthButtons'

export function LoginPage() {
  const { isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (isAuthenticated) {
    return <Redirect to="/profile" />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: `${APP_URL}/explore`,
      })

      if (result?.error) {
        setErrorMessage(result.error.message || 'Error al iniciar sesión')
      }
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setErrorMessage(message)
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1 data-testid="login-title">Iniciar sesión</h1>

      <form onSubmit={handleSubmit}>
        <IonItem>
          <IonLabel position="stacked">Email</IonLabel>
          <IonInput
            data-testid="login-email"
            type="email"
            value={email}
            required
            onIonChange={e => setEmail(e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Contraseña</IonLabel>
          <IonInput
            data-testid="login-password"
            type="password"
            value={password}
            required
            onIonChange={e => setPassword(e.detail.value!)}
          />
        </IonItem>

        {errorMessage && (
          <IonText data-testid="login-error" color="danger">
            <p>{errorMessage}</p>
          </IonText>
        )}

        <div style={{ marginTop: '1rem' }}>
          <IonButton
            data-testid="login-submit"
            type="submit"
            expand="block"
            disabled={isLoading}
          >
            {isLoading ? 'Ingresando' : 'Iniciar sesión'}
          </IonButton>
        </div>
      </form>

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link data-testid="login-to-signup" to="/signup">Crear cuenta</Link>
      </div>

      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        <Link data-testid="login-to-forgot" to="/forgot-password">Olvidé mi contraseña</Link>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <OAuthButtons callbackURL={`${APP_URL}/explore`} />
      </div>
    </div>
  )
}
