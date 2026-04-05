import type { IMapModel } from '../model/interfaces/IMapModel'
import TileLayer from 'ol/layer/Tile'
import Map from 'ol/Map'
import { fromLonLat, toLonLat } from 'ol/proj'
import OSM from 'ol/source/OSM'
import View from 'ol/View'

interface MapControllerParams {
  target: HTMLDivElement
}

/**
 * MapController
 *
 * Handles map creation, events and synchronization
 * between the OpenLayers map and the model.
 */
export class MapController {
  private map: Map | null = null
  private view: View | null = null

  /**
   * @param model Map model abstraction
   * @param params Configuration object
   * @param params.target HTML element where the map is rendered
   */
  constructor(
    private readonly model: IMapModel,
    private readonly params: MapControllerParams,
  ) {}

  /**
   * Creates the map instance (only once)
   * @returns Map
   */
  createMap(): Map {
    if (this.map)
      return this.map

    const center = this.model.getCenter()
    const zoom = this.model.getZoom()

    this.view = new View({
      center: fromLonLat(center),
      zoom,
    })

    const layers = [
      new TileLayer({
        source: new OSM(),
      }),
    ]

    this.map = new Map({
      target: this.params.target,
      layers,
      view: this.view,
    })

    this.model.setMap(this.map)
    this.registerEvents()

    return this.map
  }

  /**
   * Registers map events to update the model
   */
  private registerEvents() {
    if (!this.map || !this.view)
      return

    this.map.on('moveend', () => {
      const currentCenter = this.view?.getCenter()
      const currentZoom = this.view?.getZoom()

      if (!currentCenter || currentZoom == null)
        return

      const [lon, lat] = toLonLat(currentCenter)

      this.model.setCenter([lon, lat])
      this.model.setZoom(currentZoom)
    })
  }

  /**
   * Destroys the map instance
   */
  destroy() {
    if (!this.map)
      return

    this.map.setTarget(undefined)
    this.map = null
    this.view = null
    this.model.setMap(null)
  }

  /**
   * Syncs map view with model state
   */
  syncFromModel() {
    if (!this.view)
      return

    const center = this.model.getCenter()
    const zoom = this.model.getZoom()

    const currentCenter = this.view.getCenter()
    const nextCenter = fromLonLat(center)

    if (
      !currentCenter
      || currentCenter[0] !== nextCenter[0]
      || currentCenter[1] !== nextCenter[1]
    ) {
      this.view.setCenter(nextCenter)
    }

    if (this.view.getZoom() !== zoom) {
      this.view.setZoom(zoom)
    }
  }
}
