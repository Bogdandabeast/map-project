import { IonButton, IonInput, IonItem, IonText } from '@ionic/react'
import { signUpSchema } from '@repo/validations'
import { useRef, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { useMachine } from '../hooks/useMachine'
import { authClient } from '../lib/auth-client'
import { authFormMachine } from './authFormMachine'

/**
 * Signup page with name, email, and password form.
 * Validates input with Zod before calling authClient.signUp.email().
 * Displays inline field errors and API error messages using an FSM.
 */
export function SignupPage() {
  const { data: session } = authClient.useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [state, send] = useMachine(authFormMachine)
  const isSubmittingRef = useRef(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmittingRef.current)
      return

    send({ type: 'SUBMIT' })

    const result = signUpSchema.safeParse({ name, email, password })
    if (!result.success) {
      send({ type: 'VALIDATION_FAILED', errors: result.error.flatten().fieldErrors })
      return
    }

    isSubmittingRef.current = true
    send({ type: 'VALIDATION_PASSED' })
    try {
      await authClient.signUp.email(result.data)
      send({ type: 'API_SUCCESS' })
    }
    catch (err) {
      send({ type: 'API_FAILED', error: err instanceof Error ? err.message : 'Sign up failed' })
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
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonInput
              label="Name"
              labelPlacement="stacked"
              type="text"
              value={name}
              onIonInput={(e) => {
                setName(e.detail.value ?? '')
                if (state.type === 'ERROR')
                  send({ type: 'RESET' })
              }}
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
            {isSubmitting ? 'Signing up...' : 'Sign Up'}
          </IonButton>
        </form>
      </div>
    </AuthLayout>
  )
}
