import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { act, renderHook } from '@testing-library/react'
import { waitFor } from '@testing-library/dom'
import { useMapStore } from '../../components/map/model/stores/mapStore'
import { useRadarSearch } from '../useRadarSearch'

// ── Fixtures ───────────────────────────────────────────────────────────

const CENTER_MADRID: [number, number] = [-3.7038, 40.4168]

function makeEvent(overrides: Partial<{
  id: string
  title: string
  lat: number
  lng: number
  date: number
  hostType: 'user' | 'venue'
  games: string[]
  skillLevel: string | null
  atmosphere: string | null
}> = {}): Record<string, unknown> {
  return {
    id: overrides.id ?? 'evt-1',
    title: overrides.title ?? 'Game Night',
    address: 'Calle Mayor 1',
    lat: overrides.lat ?? 40.4168,
    lng: overrides.lng ?? -3.7038,
    date: overrides.date ?? 1700000000,
    capacity: 8,
    plannedGames: overrides.games ?? ['Catan'],
    skillLevel: overrides.skillLevel ?? null,
    atmosphere: overrides.atmosphere ?? null,
    imageKey: null,
    creatorId: 'user-1',
    createdAt: 1690000000,
    updatedAt: 1690000000,
    status: 'upcoming',
  }
}

function mockFetchResponse(body: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  } as Response)
}

describe('useRadarSearch', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    useMapStore.setState({
      searchRadius: 5,
      searchResults: [],
      filters: { games: [] },
      isLoading: false,
      error: null,
    })
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('sets isLoading to true during fetch', async () => {
    globalThis.fetch = mock(() =>
      mockFetchResponse([]),
    ) as unknown as typeof fetch

    const { result } = renderHook(() => useRadarSearch())
    const { search } = result.current

    act(() => {
      search({ center: CENTER_MADRID, radiusKm: 5 })
    })

    // isLoading should be true during the fetch
    const state = useMapStore.getState()
    expect(state.isLoading).toBe(true)

    await waitFor(() => {
      expect(useMapStore.getState().isLoading).toBe(false)
    })
  })

  it('calls fetch with correct bbox query parameter', async () => {
    let capturedUrl = ''
    globalThis.fetch = mock((url: string) => {
      capturedUrl = url as string
      return mockFetchResponse([])
    }) as unknown as typeof fetch

    const { result } = renderHook(() => useRadarSearch())

    await act(async () => {
      await result.current.search({ center: CENTER_MADRID, radiusKm: 5 })
    })

    expect(capturedUrl).toContain('/api/events')
    expect(capturedUrl).toContain('bbox=')
  })

  it('filters results by haversine distance within the radius', async () => {
    // Event 1: very close to center (within 5km)
    // Madrid center: lng=-3.7038, lat=40.4168
    // 0.01 degree ≈ 1.1 km, so this is within ~1.5 km
    const nearbyEvent = makeEvent({ id: 'near', lat: 40.4200, lng: -3.7000 })

    // Event 2: far away (~111 km away — 1 degree lat = ~111km)
    const farEvent = makeEvent({ id: 'far', lat: 41.4168, lng: -3.7038 })

    globalThis.fetch = mock(() =>
      mockFetchResponse([nearbyEvent, farEvent]),
    ) as unknown as typeof fetch

    const { result } = renderHook(() => useRadarSearch())

    await act(async () => {
      await result.current.search({ center: CENTER_MADRID, radiusKm: 5 })
    })

    const state = useMapStore.getState()
    expect(state.searchResults).toHaveLength(1)
    expect(state.searchResults[0].event.id).toBe('near')
  })

  it('sorts results by distance ascending', async () => {
    // Event at 40.4178 lng=-3.7038 (~0.11 km north of center)
    const closeEvent = makeEvent({ id: 'close', lat: 40.4178, lng: -3.7038 })
    // Event at 40.4268 lng=-3.7038 (~1.1 km north of center)
    const mediumEvent = makeEvent({ id: 'medium', lat: 40.4268, lng: -3.7038 })

    globalThis.fetch = mock(() =>
      mockFetchResponse([mediumEvent, closeEvent]),
    ) as unknown as typeof fetch

    const { result } = renderHook(() => useRadarSearch())

    await act(async () => {
      await result.current.search({ center: CENTER_MADRID, radiusKm: 5 })
    })

    const state = useMapStore.getState()
    expect(state.searchResults).toHaveLength(2)
    expect(state.searchResults[0].event.id).toBe('close')
    expect(state.searchResults[1].event.id).toBe('medium')
    expect(state.searchResults[0].distanceKm).toBeLessThan(state.searchResults[1].distanceKm)
  })

  it('sets error message on fetch failure', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      } as Response),
    ) as unknown as typeof fetch

    const { result } = renderHook(() => useRadarSearch())

    await act(async () => {
      await result.current.search({ center: CENTER_MADRID, radiusKm: 5 })
    })

    expect(useMapStore.getState().error).toBe('Server error')
  })

  it('sets error message on network failure', async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error('Network error')),
    ) as unknown as typeof fetch

    const { result } = renderHook(() => useRadarSearch())

    await act(async () => {
      await result.current.search({ center: CENTER_MADRID, radiusKm: 5 })
    })

    expect(useMapStore.getState().error).toContain('Network error')
  })

  it('returns results from the hook', async () => {
    const event = makeEvent({ id: 'evt', lat: 40.4168, lng: -3.7038 })

    globalThis.fetch = mock(() =>
      mockFetchResponse([event]),
    ) as unknown as typeof fetch

    const { result } = renderHook(() => useRadarSearch())

    await act(async () => {
      await result.current.search({ center: CENTER_MADRID, radiusKm: 5 })
    })

    expect(result.current.results).toHaveLength(1)
    expect(result.current.results[0].event.id).toBe('evt')
  })

  it('exposes isLoading from the store', async () => {
    globalThis.fetch = mock(() =>
      mockFetchResponse([]),
    ) as unknown as typeof fetch

    const { result } = renderHook(() => useRadarSearch())

    // isLoading should start false
    expect(result.current.isLoading).toBe(false)

    await act(async () => {
      await result.current.search({ center: CENTER_MADRID, radiusKm: 5 })
    })

    expect(result.current.isLoading).toBe(false)
  })
})
