/**
 * Represents an event marker on the map.
 */
export interface EventMarker {
  id: string
  title: string
  lat: number
  lng: number
  /** Unix timestamp (seconds since epoch) */
  date: number
  hostType: 'user' | 'venue'
  games: string[]
  skillLevel?: string
  atmosphere?: string
}

/**
 * Parameters for a radar search.
 * center is [lng, lat] following GeoJSON convention (same as mapStore).
 * radiusKm is the search radius in kilometers.
 */
export interface SearchParams {
  /** [longitude, latitude] */
  center: [number, number]
  /** Search radius in kilometers */
  radiusKm: number
}

/**
 * Filter criteria applied to search results.
 * Date range values are Unix timestamps (seconds since epoch).
 */
export interface FilterState {
  games: string[]
  /** Unix timestamps (seconds since epoch) for start and end of date range */
  dateRange?: { start: number; end: number }
  skillLevel?: string
  atmosphere?: string
}

/**
 * A search result combining an event marker with its distance.
 */
export interface SearchResult {
  event: EventMarker
  distanceKm: number
}
