import { useCallback } from 'react'
import type { EventData } from '../services/events'
import { API_URL } from '../env'
import { useMapStore } from '../components/map/model/stores/mapStore'
import type { EventMarker, SearchParams, SearchResult } from '../components/discovery/types'
import { haversine } from '../utils/haversine'

/**
 * Approximate kilometers per degree of latitude.
 */
const KM_PER_DEGREE_LAT = 111.32

/**
 * Converts a radius in km to an approximate bounding box in degrees.
 * Returns [minLng, minLat, maxLng, maxLat].
 */
function radiusToBbox(
  center: [number, number],
  radiusKm: number,
): [number, number, number, number] {
  const [lng, lat] = center
  const dLat = radiusKm / KM_PER_DEGREE_LAT
  const dLng = radiusKm / (KM_PER_DEGREE_LAT * Math.cos((lat * Math.PI) / 180))

  return [lng - dLng, lat - dLat, lng + dLng, lat + dLat]
}

/**
 * Maps an API EventData response to an EventMarker.
 *
 * TODO: Derive hostType from the actual backend field once the
 * events-core model exposes it. Currently all events have a
 * creatorId, so hostType defaults to 'user'.
 */
function toEventMarker(event: EventData): EventMarker {
  return {
    id: event.id,
    title: event.title,
    lat: event.lat,
    lng: event.lng,
    date: event.date,
    hostType: 'user',
    games: event.plannedGames ?? [],
    skillLevel: event.skillLevel ?? undefined,
    atmosphere: event.atmosphere ?? undefined,
  }
}

/**
 * Hook for radar-based event discovery.
 * Provides a search function and reactive state (isLoading, error, results).
 */
export function useRadarSearch() {
  const isLoading = useMapStore(s => s.isLoading)
  const error = useMapStore(s => s.error)
  const results = useMapStore(s => s.searchResults)
  const { setIsLoading, setError, setSearchResults } = useMapStore.getState()

  const search = useCallback(async (params: SearchParams) => {
    setIsLoading(true)
    setError(null)

    try {
      const bbox = radiusToBbox(params.center, params.radiusKm)
      const url = `${API_URL}/api/events?bbox=${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`

      const response = await fetch(url, { credentials: 'include' })

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(body.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const events: EventData[] = await response.json()
      const markers = events.map(toEventMarker)

      // Filter by haversine distance and sort
      const withDistance: SearchResult[] = markers
        .map((event) => ({
          event,
          distanceKm: haversine(
            params.center[1], params.center[0],
            event.lat, event.lng,
          ),
        }))
        .filter(r => r.distanceKm <= params.radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm)

      setSearchResults(withDistance)
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setSearchResults([])
    }
    finally {
      setIsLoading(false)
    }
  }, [setIsLoading, setError, setSearchResults])

  return { search, isLoading, error, results }
}
