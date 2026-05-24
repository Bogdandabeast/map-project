import type { TestEvent, TestState } from './testMachine'
import type { MachineConfig } from './useMachine'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { testReducer } from './testMachine'
import { useMachine } from './useMachine'

describe('useMachine', () => {
  const config: MachineConfig<TestState, TestEvent> = {
    initialState: { type: 'IDLE' },
    reducer: testReducer,
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
