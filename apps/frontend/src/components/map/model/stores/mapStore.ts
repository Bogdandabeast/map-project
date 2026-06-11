import type { MapStore } from '../types/map.types'
import { create } from 'zustand'
import { EPSILON } from '../../../../utils/math'

const DEFAULT_FILTERS = { games: [] as string[] }

/**
 * Global map store (Zustand)
 * Manages map instance, center, zoom state, and discovery state.
 * Avoids unnecessary updates when values do not change.
 *
 * @returns Zustand store hook
 */
export const useMapStore = create<MapStore>(set => ({
  map: null,
  center: [-3.7038, 40.4168],
  zoom: 6,
  searchRadius: 5,
  searchResults: [],
  filters: { ...DEFAULT_FILTERS },
  isLoading: false,
  error: null,

  /**
   * Sets the map instance
   * @param map Map instance
   */
  setMap: map => set({ map }),

  /**
   * Updates map center if it has changed
   * @param center [longitude, latitude]
   */
  setCenter: center =>
    set((state) => {
      const sameCenter
        = Math.abs(state.center[0] - center[0]) < EPSILON
          && Math.abs(state.center[1] - center[1]) < EPSILON
      return sameCenter ? state : { center }
    }),

  /**
   * Updates zoom level if it has changed
   * @param zoom number
   */
  setZoom: zoom =>
    set((state) => {
      return Math.abs(state.zoom - zoom) < EPSILON ? state : { zoom }
    }),

  /**
   * Sets the search radius in kilometers
   * @param radius number
   */
  setSearchRadius: radius => set({ searchRadius: radius }),

  /**
   * Sets the search results
   * @param results SearchResult array
   */
  setSearchResults: results => set({ searchResults: results }),

  /**
   * Updates filter criteria
   * @param filters FilterState
   */
  setFilters: filters => set({ filters }),

  /**
   * Resets all filters to defaults
   */
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  /**
   * Sets loading state
   * @param loading boolean
   */
  setIsLoading: loading => set({ isLoading: loading }),

  /**
   * Sets error message
   * @param error string or null
   */
  setError: error => set({ error }),
}))
