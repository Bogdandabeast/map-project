import type { SessionEvent, SessionState } from './sessionMachine'
import { describe, expect, it } from 'vitest'
import { initialState, sessionReducer } from './sessionMachine'

describe('sessionReducer', () => {
  it('should transition from INITIALIZING to AUTHENTICATED when SESSION_RESOLVED is true', () => {
    const state: SessionState = initialState
    const event: SessionEvent = {
      type: 'SESSION_RESOLVED',
      success: true,
      session: { user: { id: '1', email: 'test@example.com', name: 'Test User' }, session: { id: 's1' } } as any,
    }

    const nextState = sessionReducer(state, event)

    expect(nextState.type).toBe('AUTHENTICATED')
    expect(nextState.session).toBeDefined()
    expect(nextState.session?.user.id).toBe('1')
  })

  it('should transition from INITIALIZING to UNAUTHENTICATED when SESSION_RESOLVED is false', () => {
    const state: SessionState = initialState
    const event: SessionEvent = {
      type: 'SESSION_RESOLVED',
      success: false,
    }

    const nextState = sessionReducer(state, event)

    expect(nextState.type).toBe('UNAUTHENTICATED')
  })

  it('should ignore SESSION_RESOLVED if already AUTHENTICATED', () => {
    const state: SessionState = {
      type: 'AUTHENTICATED',
      session: { user: { id: '1' }, session: { id: 's1' } } as any,
    }
    const event: SessionEvent = {
      type: 'SESSION_RESOLVED',
      success: false,
    }

    const nextState = sessionReducer(state, event)

    expect(nextState.type).toBe('AUTHENTICATED')
    expect(nextState.session?.user.id).toBe('1')
  })

  it('should ignore SESSION_RESOLVED if already UNAUTHENTICATED', () => {
    const state: SessionState = { type: 'UNAUTHENTICATED' }
    const event: SessionEvent = {
      type: 'SESSION_RESOLVED',
      success: true,
      session: { user: { id: '2' }, session: { id: 's2' } } as any,
    }

    const nextState = sessionReducer(state, event)

    expect(nextState.type).toBe('UNAUTHENTICATED')
  })
})
