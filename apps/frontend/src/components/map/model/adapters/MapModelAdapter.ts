import type Map from 'ol/Map'
import type { IMapModel } from '../interfaces/IMapModel'
import { useMapStore } from '../stores/mapStore'

/**
 * MapModelAdapter
 *
 * Connects the map model interface with the Zustand store.
 * Provides access and updates to map state (center, zoom, map instance).
 */
export class MapModelAdapter implements IMapModel {
  /**
   * Gets current map center
   * @returns [longitude, latitude]
   */
  getCenter(): [number, number] {
    return useMapStore.getState().center
  }

  /**
   * Gets current zoom level
   * @returns number
   */
  getZoom(): number {
    return useMapStore.getState().zoom
  }

  /**
   * Updates map center
   * @param center [longitude, latitude]
   */
  setCenter(center: [number, number]): void {
    useMapStore.getState().setCenter(center)
  }

  /**
   * Updates zoom level
   * @param zoom number
   */
  setZoom(zoom: number): void {
    useMapStore.getState().setZoom(zoom)
  }

  /**
   * Stores map instance
   * @param map OpenLayers map or null
   */
  setMap(map: Map | null): void {
    useMapStore.getState().setMap(map)
  }
}
