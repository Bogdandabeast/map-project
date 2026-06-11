import { beforeEach, describe, expect, it } from 'bun:test'
import type { EventMarker, FilterState, SearchResult } from '../../../discovery/types'
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
      searchRadius: 5,
      searchResults: [],
      filters: { games: [] },
      isLoading: false,
      error: null,
    })
  })

  it('the store has the correct initial state', () => {
    const state = useMapStore.getState()

    expect(state.center).toEqual(INITIAL_CENTER)
    expect(state.zoom).toBe(INITIAL_ZOOM_LEVEL)
    expect(state.map).toBeNull()
  })

  // ── Discovery state: initial values ──────────────────────────────────

  it('has discovery state with default values', () => {
    const state = useMapStore.getState()

    expect(state.searchRadius).toBe(5)
    expect(state.searchResults).toEqual([])
    expect(state.filters).toEqual({ games: [] })
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  // ── Discovery actions ────────────────────────────────────────────────

  it('setSearchRadius updates searchRadius', () => {
    useMapStore.getState().setSearchRadius(10)

    expect(useMapStore.getState().searchRadius).toBe(10)
  })

  it('setSearchResults stores event results', () => {
    const marker: EventMarker = {
      id: 'evt-1',
      title: 'Catan Night',
      lat: -34.6,
      lng: -58.38,
      date: 1700000000,
      hostType: 'user',
      games: ['Catan'],
    }
    const results: SearchResult[] = [
      { event: marker, distanceKm: 2.5 },
    ]

    useMapStore.getState().setSearchResults(results)

    expect(useMapStore.getState().searchResults).toEqual(results)
    expect(useMapStore.getState().searchResults).toHaveLength(1)
    expect(useMapStore.getState().searchResults[0].distanceKm).toBe(2.5)
  })

  it('setSearchResults replaces previous results', () => {
    const marker1: EventMarker = {
      id: 'evt-1', title: 'First', lat: 0, lng: 0,
      date: 0, hostType: 'user', games: [],
    }
    const marker2: EventMarker = {
      id: 'evt-2', title: 'Second', lat: 0, lng: 0,
      date: 0, hostType: 'venue', games: [],
    }

    useMapStore.getState().setSearchResults([{ event: marker1, distanceKm: 1 }])
    useMapStore.getState().setSearchResults([{ event: marker2, distanceKm: 3 }])

    expect(useMapStore.getState().searchResults).toHaveLength(1)
    expect(useMapStore.getState().searchResults[0].event.id).toBe('evt-2')
  })

  it('setFilters updates all filter fields', () => {
    const filters: FilterState = {
      games: ['Catan', 'Wingspan'],
      dateRange: { start: 1700000000, end: 1705000000 },
      skillLevel: 'intermediate',
      atmosphere: 'competitive',
    }

    useMapStore.getState().setFilters(filters)

    expect(useMapStore.getState().filters).toEqual(filters)
  })

  it('setFilters can set partial filter state', () => {
    useMapStore.getState().setFilters({ games: ['Dominion'] })

    expect(useMapStore.getState().filters.games).toEqual(['Dominion'])
  })

  it('resetFilters clears all filters to defaults', () => {
    useMapStore.getState().setFilters({
      games: ['Catan'],
      dateRange: { start: 1, end: 2 },
      skillLevel: 'beginner',
      atmosphere: 'casual',
    })

    useMapStore.getState().resetFilters()

    expect(useMapStore.getState().filters).toEqual({ games: [] })
  })

  it('setIsLoading toggles loading state', () => {
    expect(useMapStore.getState().isLoading).toBe(false)

    useMapStore.getState().setIsLoading(true)
    expect(useMapStore.getState().isLoading).toBe(true)

    useMapStore.getState().setIsLoading(false)
    expect(useMapStore.getState().isLoading).toBe(false)
  })

  it('setError stores an error message', () => {
    useMapStore.getState().setError('Network failure')

    expect(useMapStore.getState().error).toBe('Network failure')
  })

  it('setError can clear the error with null', () => {
    useMapStore.getState().setError('Something went wrong')
    useMapStore.getState().setError(null)

    expect(useMapStore.getState().error).toBeNull()
  })

  // ── Independence: discovery actions preserve map state ───────────────

  it('setSearchRadius does not affect map state', () => {
    useMapStore.getState().setSearchRadius(25)

    const state = useMapStore.getState()
    expect(state.center).toEqual(INITIAL_CENTER)
    expect(state.zoom).toBe(INITIAL_ZOOM_LEVEL)
  })

  it('setCenter does not affect discovery state', () => {
    useMapStore.getState().setCenter([-1, 39])

    const state = useMapStore.getState()
    expect(state.searchRadius).toBe(5)
    expect(state.isLoading).toBe(false)
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
