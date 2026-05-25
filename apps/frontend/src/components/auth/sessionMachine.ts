import type { authClient } from '../../lib/auth-client'

export type Session = typeof authClient.$Infer.Session

export type SessionState
  = | { type: 'INITIALIZING' }
    | { type: 'AUTHENTICATED', session: Session }
    | { type: 'UNAUTHENTICATED' }

export type SessionEvent
  = | { type: 'SESSION_RESOLVED', success: boolean, session?: Session }

export const initialState: SessionState = {
  type: 'INITIALIZING',
}

export function sessionReducer(state: SessionState, event: SessionEvent): SessionState {
  switch (state.type) {
    case 'INITIALIZING':
      if (event.type === 'SESSION_RESOLVED') {
        return event.success && event.session
          ? { type: 'AUTHENTICATED', session: event.session }
          : { type: 'UNAUTHENTICATED' }
      }
      return state
    default:
      return state
  }
}

export const sessionMachine = {
  initialState,
  reducer: sessionReducer,
}
