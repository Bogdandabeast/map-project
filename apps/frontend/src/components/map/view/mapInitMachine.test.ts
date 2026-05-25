import type { MapInitEvent, MapInitState } from './mapInitMachine'
import { describe, expect, it } from 'vitest'
import { mapInitReducer } from './mapInitMachine'

describe('mapInitReducer', () => {
  const initialState: MapInitState = { type: 'UNINITIALIZED' }

  it('should transition from UNINITIALIZED to LOADING_ASSETS on START_INIT', () => {
    const event: MapInitEvent = { type: 'START_INIT' }
    const nextState = mapInitReducer(initialState, event)
    expect(nextState).toEqual({ type: 'LOADING_ASSETS' })
  })

  it('should transition from LOADING_ASSETS to INSTANTIATING on ASSETS_LOADED', () => {
    const state: MapInitState = { type: 'LOADING_ASSETS' }
    const event: MapInitEvent = { type: 'ASSETS_LOADED' }
    const nextState = mapInitReducer(state, event)
    expect(nextState).toEqual({ type: 'INSTANTIATING' })
  })

  it('should transition from INSTANTIATING to READY on CONTROLLER_READY', () => {
    const state: MapInitState = { type: 'INSTANTIATING' }
    const mockController = { createMap: () => {} } as any
    const event: MapInitEvent = { type: 'CONTROLLER_READY', controller: mockController }
    const nextState = mapInitReducer(state, event)
    expect(nextState).toEqual({ type: 'READY', controller: mockController })
  })

  it('should transition to ERROR on INIT_FAILED from any state', () => {
    const states: MapInitState[] = [
      { type: 'UNINITIALIZED' },
      { type: 'LOADING_ASSETS' },
      { type: 'INSTANTIATING' },
      { type: 'READY', controller: {} as any },
    ]

    states.forEach((state) => {
      const event: MapInitEvent = { type: 'INIT_FAILED', error: 'Initialization failed' }
      const nextState = mapInitReducer(state, event)
      expect(nextState).toEqual({ type: 'ERROR', error: 'Initialization failed' })
    })
  })

  it('should ignore START_INIT if already initializing or ready', () => {
    const states: MapInitState[] = [
      { type: 'LOADING_ASSETS' },
      { type: 'INSTANTIATING' },
      { type: 'READY', controller: {} as any },
    ]

    states.forEach((state) => {
      const event: MapInitEvent = { type: 'START_INIT' }
      const nextState = mapInitReducer(state, event)
      expect(nextState).toEqual(state)
    })
  })

  it('should ignore ASSETS_LOADED if not in LOADING_ASSETS state', () => {
    const state: MapInitState = { type: 'UNINITIALIZED' }
    const event: MapInitEvent = { type: 'ASSETS_LOADED' }
    const nextState = mapInitReducer(state, event)
    expect(nextState).toEqual(state)
  })

  it('should ignore CONTROLLER_READY if not in INSTANTIATING state', () => {
    const state: MapInitState = { type: 'LOADING_ASSETS' }
    const event: MapInitEvent = { type: 'CONTROLLER_READY', controller: {} as any }
    const nextState = mapInitReducer(state, event)
    expect(nextState).toEqual(state)
  })
})
