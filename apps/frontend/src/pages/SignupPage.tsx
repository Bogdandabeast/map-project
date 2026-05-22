import { IonButton, IonInput, IonItem, IonText } from '@ionic/react'
import { signUpSchema } from '@repo/validations'
import { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { authClient } from '../lib/auth-client'

interface FieldErrors {
  name?: string[]
  email?: string[]
  password?: string[]
}

/**
 * Signup page with name, email, and password form.
 * Validates input with Zod before calling authClient.signUp.email().
 * Displays inline field errors and API error messages.
 */
export function SignupPage() {
  const { data: session } = authClient.useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setApiError('')

    const result = signUpSchema.safeParse({ name, email, password })
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await authClient.signUp.email(result.data)
    }
    catch (err) {
      setApiError(err instanceof Error ? err.message : 'Sign up failed')
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
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonInput
              label="Name"
              labelPlacement="stacked"
              type="text"
              value={name}
              onIonInput={e => setName(e.detail.value ?? '')}
              className={errors.name ? 'ion-invalid' : ''}
              fill="outline"
            />
          </IonItem>
          {errors.name && (
            <IonText color="danger">
              <p>{errors.name[0]}</p>
            </IonText>
          )}

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
            {isSubmitting ? 'Signing up...' : 'Sign Up'}
          </IonButton>
        </form>
      </div>
    </AuthLayout>
  )
}
