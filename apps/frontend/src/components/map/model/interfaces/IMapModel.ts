import type Map from 'ol/Map'

/**
 * Map model interface
 * Defines the contract for interacting with map state.
 * Provides getters and setters for center, zoom and map instance.
 */
export interface IMapModel {
  /**
   * Gets current map center
   * @returns [longitude, latitude]
   */
  getCenter: () => [number, number]

  /**
   * Gets current zoom level
   * @returns number
   */
  getZoom: () => number

  /**
   * Sets map center
   * @param center [longitude, latitude]
   */
  setCenter: (center: [number, number]) => void

  /**
   * Sets zoom level
   * @param zoom number
   */
  setZoom: (zoom: number) => void

  /**
   * Stores map instance
   * @param map OpenLayers map or null
   */
  setMap: (map: Map | null) => void
}
