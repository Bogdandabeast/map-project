import { beforeEach, describe, expect, it } from 'vitest'
import { EPSILON } from '../../../../utils/math'
import { useMapStore } from './mapStore'

describe('useMapStore', () => {
  const INITIAL_CENTER: [number, number] = [-3.7038, 40.4168]
  const INITIAL_ZOOM_LEVEL: number = 6

  beforeEach(() => {
    useMapStore.setState({
      map: null,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM_LEVEL,
    })
  })

  it('the store has the correct initial state', () => {
    const state = useMapStore.getState()

    expect(state.center).toEqual(INITIAL_CENTER)
    expect(state.zoom).toBe(INITIAL_ZOOM_LEVEL)
    expect(state.map).toBeNull()
  })

  it('update the center at the moment that it changes', () => {
    useMapStore.getState().setCenter([-4, 41])
    expect(useMapStore.getState().center).toEqual([-4, 41])
  })

  it('does not update the center if the change is smaller than EPSILON', () => {
    const prev = useMapStore.getState().center

    useMapStore.getState().setCenter([
      prev[0] + EPSILON / 2,
      prev[1] + EPSILON / 2,
    ])

    expect(useMapStore.getState().center).toEqual(prev)
  })

  it('the zoom updates at the moment that it changes', () => {
    useMapStore.getState().setZoom(10)
    expect(useMapStore.getState().zoom).toBe(10)
  })

  it('does not create a new state object when center change is smaller than EPSILON', () => {
    const previousState = useMapStore.getState()

    useMapStore.getState().setCenter([
      previousState.center[0] + EPSILON / 2,
      previousState.center[1] + EPSILON / 2,
    ])

    const nextState = useMapStore.getState()

    expect(nextState).toBe(previousState)
  })

  it('creates a new state object when center changes more than EPSILON', () => {
    const previousState = useMapStore.getState()

    useMapStore.getState().setCenter([
      previousState.center[0] + EPSILON * 2,
      previousState.center[1] + EPSILON * 2,
    ])

    const nextState = useMapStore.getState()

    expect(nextState).not.toBe(previousState)
    expect(nextState.center).not.toEqual(previousState.center)
  })

  it('does not create a new state object when zoom change is smaller than EPSILON', () => {
    const previousState = useMapStore.getState()

    useMapStore.getState().setZoom(previousState.zoom + EPSILON / 2)

    const nextState = useMapStore.getState()

    expect(nextState).toBe(previousState)
    expect(nextState.zoom).toBe(previousState.zoom)
  })

  it('creates a new state object when zoom changes more than EPSILON', () => {
    const previousState = useMapStore.getState()

    useMapStore.getState().setZoom(previousState.zoom + EPSILON * 2)

    const nextState = useMapStore.getState()

    expect(nextState).not.toBe(previousState)
    expect(nextState.zoom).toBe(previousState.zoom + EPSILON * 2)
  })
  it('updates the map instance correctly', () => {
    const fakeMap = { id: 'map-1' }

    useMapStore.getState().setMap(fakeMap as any)

    expect(useMapStore.getState().map).toBe(fakeMap)
  })
  it('updates center without modifying zoom', () => {
    useMapStore.getState().setCenter([-1, 39])

    const state = useMapStore.getState()

    expect(state.center).toEqual([-1, 39])
    expect(state.zoom).toBe(INITIAL_ZOOM_LEVEL)
  })

  it('updates zoom without modifying center', () => {
    useMapStore.getState().setZoom(8)

    const state = useMapStore.getState()

    expect(state.zoom).toBe(8)
    expect(state.center).toEqual(INITIAL_CENTER)
  })
})
