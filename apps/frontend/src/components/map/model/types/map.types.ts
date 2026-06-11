import type Map from 'ol/Map'
import type { FilterState, SearchResult } from '../../../discovery/types'

/**
 * Map state definition
 * Represents the current map data stored in the app.
 */
export interface MapState {
  map: Map | null
  center: [number, number]
  zoom: number
  /** Search radius in kilometers */
  searchRadius: number
  searchResults: SearchResult[]
  filters: FilterState
  isLoading: boolean
  error: string | null
}

/**
 * Map actions
 * Functions to update the map state.
 */
export interface MapActions {
  /**
   * Sets the map instance
   * @param map OpenLayers map or null
   */
  setMap: (map: Map | null) => void

  /**
   * Updates map center
   * @param center [longitude, latitude]
   */
  setCenter: (center: [number, number]) => void

  /**
   * Updates zoom level
   * @param zoom number
   */
  setZoom: (zoom: number) => void

  /**
   * Sets the search radius in kilometers
   * @param radius number
   */
  setSearchRadius: (radius: number) => void

  /**
   * Sets the search results
   * @param results SearchResult array
   */
  setSearchResults: (results: SearchResult[]) => void

  /**
   * Updates filter criteria
   * @param filters FilterState
   */
  setFilters: (filters: FilterState) => void

  /**
   * Resets all filters to defaults
   */
  resetFilters: () => void

  /**
   * Sets loading state
   * @param loading boolean
   */
  setIsLoading: (loading: boolean) => void

  /**
   * Sets error message
   * @param error string or null
   */
  setError: (error: string | null) => void
}

/**
 * Combined map store type
 * Includes both state and actions.
 */
export type MapStore = MapState & MapActions
