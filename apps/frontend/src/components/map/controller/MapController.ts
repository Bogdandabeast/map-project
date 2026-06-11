import type { EventsKey } from 'ol/events'
import type { IMapModel } from '../model/interfaces/IMapModel'
import type { EventMarker } from '../../discovery/types'
import Feature from 'ol/Feature'
import { Point } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import TileLayer from 'ol/layer/Tile'
import Map from 'ol/Map'
import { unByKey } from 'ol/Observable'
import Overlay from 'ol/Overlay'
import { fromLonLat, toLonLat } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import View from 'ol/View'

// import TileWMS from 'ol/source'
// import TileSource from 'ol/source/Tile'

interface MapControllerParams {
  target: HTMLDivElement
}

/**
const PNOA = new TileLayer({
  source: new TileWMS({
    url: 'https://www.ign.es/wms-inspire/pnoa-ma',
    params: {
      LAYERS: ['Fondo', 'OI.OrthoimageCoverage', 'OI.MosaicElement'],
      TILED: true,
    },
    serverType: 'geoserver',
    crossOrigin: 'anonymous',
  }),
})
 */

/**
 * MapController
 *
 * Handles map creation, events and synchronization
 * between the OpenLayers map and the model.
 */
export class MapController {
  private map: Map | null = null
  private view: View | null = null
  private moveEndEventKey: EventsKey | null = null
  private eventLayer: VectorLayer<VectorSource> | null = null
  private eventTooltip: Overlay | null = null

  /**
   * @param model Map model abstraction
   * @param params Configuration object
   * @param params.target HTML element where the map is rendered
   */
  constructor(
    private readonly model: IMapModel,
    private readonly params: MapControllerParams,
  ) { }

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

    const COVERAGE_OSM = new TileLayer({
      source: new OSM(),
    })

    const layers = [
      COVERAGE_OSM, // PNOA
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

    this.moveEndEventKey = this.map.on('moveend', () => {
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
    if (this.moveEndEventKey) {
      unByKey(this.moveEndEventKey)
      this.moveEndEventKey = null
    }

    this.map.setLayers([])
    this.map.dispose()
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
      currentCenter?.[0] !== nextCenter[0]
      || currentCenter?.[1] !== nextCenter[1]
    ) {
      this.view.setCenter(nextCenter)
    }

    if (this.view.getZoom() !== zoom) {
      this.view.setZoom(zoom)
    }
  }

  /**
   * Adds an event marker layer to the map.
   * Creates a VectorLayer with a VectorSource for displaying event markers.
   * Does nothing if the layer already exists.
   */
  addEventLayer(): void {
    if (!this.map || this.eventLayer)
      return

    this.eventLayer = new VectorLayer({
      source: new VectorSource(),
    })
    this.map.addLayer(this.eventLayer)
  }

  /**
   * Removes the event marker layer from the map.
   * Does nothing if no event layer exists.
   */
  removeEventLayer(): void {
    if (!this.map || !this.eventLayer)
      return

    this.map.removeLayer(this.eventLayer)
    this.eventLayer = null
  }

  /**
   * Updates event markers on the map.
   * Clears existing markers and creates new ones from the events array.
   * Does nothing if the map is not initialized.
   * @param events Array of event markers to display
   */
  updateEventMarkers(events: EventMarker[]): void {
    if (!this.map)
      return

    const source = this.eventLayer?.getSource()
    if (!source)
      return

    source.clear()

    for (const event of events) {
      const feature = new Feature({
        geometry: new Point(fromLonLat([event.lng, event.lat])),
      })
      feature.set('eventId', event.id)
      feature.set('eventTitle', event.title)
      feature.set('eventDate', event.date)
      feature.set('eventHostType', event.hostType)
      source.addFeature(feature)
    }
  }

  /**
   * Adds a tooltip overlay to the map that appears on marker tap/click.
   * Shows event name, date, and a link to the event detail page.
   * The overlay is created once and reused; calling again is a no-op.
   */
  addEventTooltip(): void {
    if (!this.map || this.eventTooltip)
      return

    const tooltipElement = document.createElement('div')
    tooltipElement.className = 'event-tooltip'
    tooltipElement.style.cssText = `
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      pointer-events: auto;
      max-width: 250px;
    `

    this.eventTooltip = new Overlay({
      element: tooltipElement,
      offset: [0, -10],
      positioning: 'bottom-center',
    })

    this.map.addOverlay(this.eventTooltip)

    // Click handler to detect feature hits
    this.map.on('singleclick', (evt) => {
      if (!this.map || !this.eventLayer || !this.eventTooltip)
        return

      const feature = this.map.forEachFeatureAtPixel(
        evt.pixel,
        (f) => {
          // Look for event features on the event layer
          return f
        },
        { layerFilter: (l) => l === this.eventLayer },
      )

      if (feature) {
        const features = feature.get('features')
        const eventFeature = Array.isArray(features) ? features[0] : feature
        const title = eventFeature?.get?.('eventTitle') || feature.get('eventTitle') || 'Event'
        const date = eventFeature?.get?.('eventDate') || feature.get('eventDate')
        const eventId = eventFeature?.get?.('eventId') || feature.get('eventId')

        const dateStr = date ? new Date(date * 1000).toLocaleDateString() : ''
        tooltipElement.innerHTML = `
          <div><strong>${title}</strong></div>
          ${dateStr ? `<div style="color:#666;font-size:12px;">${dateStr}</div>` : ''}
          ${eventId ? `<a href="/events/${eventId}" style="color:#0061A4;font-size:12px;">View details</a>` : ''}
        `

        this.eventTooltip.setPosition(evt.coordinate)
      } else {
        // Hide tooltip when clicking away
        this.eventTooltip.setPosition(undefined)
      }
    })
  }

  /**
   * Removes the event tooltip overlay from the map.
   * Does nothing if no tooltip exists.
   */
  removeEventTooltip(): void {
    if (!this.map || !this.eventTooltip)
      return

    this.map.removeOverlay(this.eventTooltip)
    this.eventTooltip = null
  }
}
