import { describe, expect, it } from 'vitest'

describe('useMachine Reducer Logic', () => {
  type State = { type: 'IDLE' } | { type: 'ACTIVE' }
  type Event = { type: 'ACTIVATE' } | { type: 'DEACTIVATE' }

  const reducer = (state: State, event: Event): State => {
    switch (state.type) {
      case 'IDLE':
        return event.type === 'ACTIVATE' ? { type: 'ACTIVE' } : state
      case 'ACTIVE':
        return event.type === 'DEACTIVATE' ? { type: 'IDLE' } : state
      default:
        return state
    }
  }

  it('should transition from IDLE to ACTIVE on ACTIVATE event', () => {
    const state: State = { type: 'IDLE' }
    const event: Event = { type: 'ACTIVATE' }
    expect(reducer(state, event)).toEqual({ type: 'ACTIVE' })
  })

  it('should transition from ACTIVE to IDLE on DEACTIVATE event', () => {
    const state: State = { type: 'ACTIVE' }
    const event: Event = { type: 'DEACTIVATE' }
    expect(reducer(state, event)).toEqual({ type: 'IDLE' })
  })

  it('should stay in IDLE when DEACTIVATE event is sent', () => {
    const state: State = { type: 'IDLE' }
    const event: Event = { type: 'DEACTIVATE' }
    expect(reducer(state, event)).toEqual({ type: 'IDLE' })
  })

  it('should stay in ACTIVE when ACTIVATE event is sent', () => {
    const state: State = { type: 'ACTIVE' }
    const event: Event = { type: 'ACTIVATE' }
    expect(reducer(state, event)).toEqual({ type: 'ACTIVE' })
  })
})
