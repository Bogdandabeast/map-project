import { IonButton, IonInput, IonItem, IonText } from '@ionic/react'
import { signInSchema } from '@repo/validations'
import { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { authClient } from '../lib/auth-client'

interface FieldErrors {
  email?: string[]
  password?: string[]
}

/**
 * Login page with email and password form.
 * Validates input with Zod before calling authClient.signIn.email().
 * Displays inline field errors and API error messages.
 */
export function LoginPage() {
  const { data: session } = authClient.useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setApiError('')

    const result = signInSchema.safeParse({ email, password })
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await authClient.signIn.email(result.data)
    }
    catch (err) {
      setApiError(err instanceof Error ? err.message : 'Sign in failed')
    }
    finally {
      setIsSubmitting(false)
    }
  }

  if (session) {
    return <Redirect to="/map" />
  }

  return (
    <AuthLayout>
      <div className="ion-padding">
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonInput
              label="Email"
              labelPlacement="stacked"
              type="email"
              value={email}
              onIonInput={e => setEmail(e.detail.value ?? '')}
              className={errors.email ? 'ion-invalid' : ''}
              fill="outline"
            />
          </IonItem>
          {errors.email && (
            <IonText color="danger">
              <p>{errors.email[0]}</p>
            </IonText>
          )}

          <IonItem>
            <IonInput
              label="Password"
              labelPlacement="stacked"
              type="password"
              value={password}
              onIonInput={e => setPassword(e.detail.value ?? '')}
              className={errors.password ? 'ion-invalid' : ''}
              fill="outline"
            />
          </IonItem>
          {errors.password && (
            <IonText color="danger">
              <p>{errors.password[0]}</p>
            </IonText>
          )}

          {apiError && (
            <IonText color="danger">
              <p>{apiError}</p>
            </IonText>
          )}

          <IonButton
            type="submit"
            expand="block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </IonButton>
        </form>
      </div>
    </AuthLayout>
  )
}
