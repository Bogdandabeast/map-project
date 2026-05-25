import { IonButton, IonInput, IonItem, IonText } from '@ionic/react'
import { signInSchema } from '@repo/validations'
import { useRef, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { useMachine } from '../hooks/useMachine'
import { authClient } from '../lib/auth-client'
import { authFormMachine } from './authFormMachine'

/**
 * Login page with email and password form.
 * Validates input with Zod before calling authClient.signIn.email().
 * Displays inline field errors and API error messages using an FSM.
 */
export function LoginPage() {
  const { data: session } = authClient.useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [state, send] = useMachine(authFormMachine)
  const isSubmittingRef = useRef(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmittingRef.current)
      return

    send({ type: 'SUBMIT' })

    const result = signInSchema.safeParse({ email, password })
    if (!result.success) {
      send({ type: 'VALIDATION_FAILED', errors: result.error.flatten().fieldErrors })
      return
    }

    isSubmittingRef.current = true
    send({ type: 'VALIDATION_PASSED' })
    try {
      await authClient.signIn.email(result.data)
      send({ type: 'API_SUCCESS' })
    }
    catch (err) {
      send({ type: 'API_FAILED', error: err instanceof Error ? err.message : 'Sign in failed' })
    }
    finally {
      isSubmittingRef.current = false
    }
  }

  if (session) {
    return <Redirect to="/map" />
  }

  const isSubmitting = state.type === 'SUBMITTING'
  const errors = state.type === 'ERROR' ? state.errors : {}
  const apiError = state.type === 'ERROR' ? state.apiError : undefined

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
              onIonInput={(e) => {
                setEmail(e.detail.value ?? '')
                if (state.type === 'ERROR')
                  send({ type: 'RESET' })
              }}
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
              onIonInput={(e) => {
                setPassword(e.detail.value ?? '')
                if (state.type === 'ERROR')
                  send({ type: 'RESET' })
              }}
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
