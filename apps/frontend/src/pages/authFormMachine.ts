import type { MachineConfig } from '../hooks/useMachine'

export type FieldErrors = Record<string, string[]>

export type AuthFormState
  = | { type: 'IDLE' }
    | { type: 'VALIDATING' }
    | { type: 'SUBMITTING' }
    | { type: 'SUCCESS' }
    | { type: 'ERROR', errors: FieldErrors, apiError?: string }

export type AuthFormEvent
  = | { type: 'SUBMIT' }
    | { type: 'VALIDATION_PASSED' }
    | { type: 'VALIDATION_FAILED', errors: FieldErrors }
    | { type: 'API_SUCCESS' }
    | { type: 'API_FAILED', error: string }
    | { type: 'RESET' }

export const authFormInitialState: AuthFormState = {
  type: 'IDLE',
}

export function authFormReducer(state: AuthFormState, event: AuthFormEvent): AuthFormState {
  switch (state.type) {
    case 'IDLE':
      if (event.type === 'SUBMIT') {
        return { type: 'VALIDATING' }
      }
      return state

    case 'VALIDATING':
      if (event.type === 'VALIDATION_PASSED') {
        return { type: 'SUBMITTING' }
      }
      if (event.type === 'VALIDATION_FAILED') {
        return { type: 'ERROR', errors: event.errors }
      }
      return state

    case 'SUBMITTING':
      if (event.type === 'API_SUCCESS') {
        return { type: 'SUCCESS' }
      }
      if (event.type === 'API_FAILED') {
        return { type: 'ERROR', errors: {}, apiError: event.error }
      }
      return state

    case 'ERROR':
      if (event.type === 'RESET') {
        return authFormInitialState
      }
      if (event.type === 'SUBMIT') {
        return { type: 'VALIDATING' }
      }
      return state

    case 'SUCCESS':
      if (event.type === 'RESET') {
        return authFormInitialState
      }
      if (event.type === 'SUBMIT') {
        return { type: 'VALIDATING' }
      }
      return state

    default:
      return state
  }
}

export const authFormMachine: MachineConfig<AuthFormState, AuthFormEvent> = {
  initialState: authFormInitialState,
  reducer: authFormReducer,
}
