import type { MachineConfig } from './useMachine'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useMachine } from './useMachine'

describe('useMachine', () => {
  // Simple machine for testing
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

  const config: MachineConfig<State, Event> = {
    initialState: { type: 'IDLE' },
    reducer,
  }

  it('should initialize with the initial state', () => {
    const { result } = renderHook(() => useMachine(config))
    const [state] = result.current
    expect(state).toEqual({ type: 'IDLE' })
  })

  it('should update state when an event is sent', () => {
    const { result } = renderHook(() => useMachine(config))
    const [, send] = result.current

    act(() => {
      send({ type: 'ACTIVATE' })
    })

    const [newState] = result.current
    expect(newState).toEqual({ type: 'ACTIVE' })
  })

  it('should not update state when an irrelevant event is sent', () => {
    const { result } = renderHook(() => useMachine(config))
    const [, send] = result.current

    act(() => {
      send({ type: 'DEACTIVATE' }) // IDLE + DEACTIVATE -> IDLE
    })

    const [newState] = result.current
    expect(newState).toEqual({ type: 'IDLE' })
  })
})
