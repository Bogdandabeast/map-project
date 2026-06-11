import type { EventMarker } from './types'
import Feature from 'ol/Feature'
import { Point } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import { fromLonLat } from 'ol/proj'
import Cluster from 'ol/source/Cluster'
import VectorSource from 'ol/source/Vector'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Style from 'ol/style/Style'
import Text from 'ol/style/Text'

const USER_COLOR = '#FF6B35'
const VENUE_COLOR = '#0061A4'
const STROKE_COLOR = '#FFFFFF'
const STROKE_WIDTH = 2
const BASE_RADIUS = 8
const CLUSTER_RADIUS = 14
const CLUSTER_FILL = '#3399CC'
const DISSOLVE_ZOOM = 14

/**
 * Creates an OpenLayers VectorLayer with clustered, color-coded CircleStyle markers.
 * User-hosted events are Action Orange (#FF6B35).
 * Venue events are Map Blue (#0061A4).
 * Nearby markers are grouped into clusters showing event count.
 * Clusters dissolve into individual markers at zoom ≥ 14.
 *
 * @param events Array of event markers to display on the layer
 * @returns A configured VectorLayer with VectorSource
 */
export function createEventMarkerLayer(
  events: EventMarker[],
): VectorLayer<VectorSource> {
  const vectorSource = new VectorSource()

  for (const event of events) {
    const feature = new Feature({
      geometry: new Point(fromLonLat([event.lng, event.lat])),
    })
    feature.set('eventId', event.id)
    feature.set('eventTitle', event.title)
    feature.set('eventDate', event.date)
    feature.set('eventHostType', event.hostType)
    vectorSource.addFeature(feature)
  }

  const clusterSource = new Cluster({
    source: vectorSource,
    distance: 40,
  })

  const layer = new VectorLayer({
    source: clusterSource,
    style: (feature, resolution) => {
      const features = feature.get('features') as Feature[] | undefined
      const size = features?.length ?? 1

      if (size > 1) {
        // Cluster style with count text
        return new Style({
          image: new CircleStyle({
            radius: CLUSTER_RADIUS,
            fill: new Fill({ color: CLUSTER_FILL }),
            stroke: new Stroke({ color: STROKE_COLOR, width: STROKE_WIDTH }),
          }),
          text: new Text({
            text: size.toString(),
            fill: new Fill({ color: '#FFFFFF' }),
            stroke: new Stroke({ color: '#000000', width: 3 }),
          }),
        })
      }

      // Individual marker — get hostType from the sub-feature
      const subFeature = features?.[0] ?? feature
      const hostType = subFeature.get('eventHostType') as string
      const color = hostType === 'venue' ? VENUE_COLOR : USER_COLOR
      const radius = Math.max(BASE_RADIUS, BASE_RADIUS / Math.max(resolution, 0.1))

      return new Style({
        image: new CircleStyle({
          radius,
          fill: new Fill({ color }),
          stroke: new Stroke({ color: STROKE_COLOR, width: STROKE_WIDTH }),
        }),
      })
    },
  })

  // Dissolve clusters at zoom >= DISSOLVE_ZOOM
  layer.on('change:map', () => {
    const map = layer.getMap()
    if (!map) return
    const view = map.getView()
    const updateDistance = () => {
      const zoom = view.getZoom()
      clusterSource.setDistance(zoom != null && zoom >= DISSOLVE_ZOOM ? 0 : 40)
    }
    view.on('change:resolution', updateDistance)
    updateDistance() // initial call
  })

  return layer
}
