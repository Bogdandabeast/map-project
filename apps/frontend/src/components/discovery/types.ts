/**
 * Represents an event marker on the map.
 */
export interface EventMarker {
  id: string
  title: string
  lat: number
  lng: number
  date: number
  hostType: 'user' | 'venue'
  games: string[]
  skillLevel?: string
  atmosphere?: string
}

/**
 * Parameters for a radar search.
 */
export interface SearchParams {
  center: [number, number]
  radiusKm: number
}

/**
 * Filter criteria applied to search results.
 */
export interface FilterState {
  games: string[]
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
