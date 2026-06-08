import { IonButton, IonInput, IonItem, IonLabel, IonText } from '@ionic/react'
import { useState } from 'react'
import { Link, Redirect } from 'react-router-dom'
import { signUp } from '../../lib/auth-client'
import { useAuth } from '../../components/auth/AuthProvider'

export function SignupPage() {
  const { isAuthenticated } = useAuth()
  const [name, setName] = useState('')
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
      const result = await signUp.email({
        name,
        email,
        password,
      })

      if (result?.error) {
        setErrorMessage(result.error.message || 'Error al crear cuenta')
      }
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear cuenta'
      setErrorMessage(message)
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1 data-testid="signup-title">Crear cuenta</h1>

      <form onSubmit={handleSubmit}>
        <IonItem>
          <IonLabel position="stacked">Nombre</IonLabel>
          <IonInput
            data-testid="signup-name"
            type="text"
            value={name}
            required
            onIonChange={e => setName(e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Email</IonLabel>
          <IonInput
            data-testid="signup-email"
            type="email"
            value={email}
            required
            onIonChange={e => setEmail(e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Contraseña</IonLabel>
          <IonInput
            data-testid="signup-password"
            type="password"
            value={password}
            required
            onIonChange={e => setPassword(e.detail.value!)}
          />
        </IonItem>

        {errorMessage && (
          <IonText data-testid="signup-error" color="danger">
            <p>{errorMessage}</p>
          </IonText>
        )}

        <div style={{ marginTop: '1rem' }}>
          <IonButton
            data-testid="signup-submit"
            type="submit"
            expand="block"
            disabled={isLoading}
          >
            {isLoading ? 'Creando cuenta' : 'Crear cuenta'}
          </IonButton>
        </div>
      </form>

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link data-testid="signup-to-login" to="/login">Ya tengo cuenta</Link>
      </div>
    </div>
  )
}
