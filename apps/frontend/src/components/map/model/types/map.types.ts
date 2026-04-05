import type Map from 'ol/Map'

/**
 * Map state definition
 * Represents the current map data stored in the app.
 */
export interface MapState {
  map: Map | null
  center: [number, number]
  zoom: number
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
}

/**
 * Combined map store type
 * Includes both state and actions.
 */
export type MapStore = MapState & MapActions
