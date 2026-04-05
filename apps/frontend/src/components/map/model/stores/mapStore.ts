import type { MapStore } from '../types/map.types'
import { create } from 'zustand'

/**
 * Global map store (Zustand)
 * Manages map instance, center and zoom state.
 * Avoids unnecessary updates when values do not change.
 *
 * @returns Zustand store hook
 */
export const useMapStore = create<MapStore>(set => ({
  map: null,
  center: [-3.7038, 40.4168],
  zoom: 6,

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
        = state.center[0] === center[0]
          && state.center[1] === center[1]

      return sameCenter ? state : { center }
    }),

  /**
   * Updates zoom level if it has changed
   * @param zoom number
   */
  setZoom: zoom =>
    set((state) => {
      return state.zoom === zoom ? state : { zoom }
    }),
}))
