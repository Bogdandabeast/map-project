import { useCallback, useEffect, useRef, useState } from 'react'
import { Collection, Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Circle, Fill, Stroke, Style } from 'ol/style'
import { fromLonLat, toLonLat } from 'ol/proj'
import type { TranslateEvent } from 'ol/interaction/Translate'
import Translate from 'ol/interaction/Translate'
import { useMapStore } from '../map/model/stores/mapStore'

export interface LocationPickerProps {
  /** Initial center [lng, lat]. Defaults to mapStore.center */
  initialCenter?: [number, number]
  /** Callback fired when the pin position changes (after drag ends) */
  onLocationChange: (lat: number, lng: number) => void
}

/**
 * Self-contained OpenLayers mini-map with a draggable pin.
 *
 * - Default center comes from `mapStore.center` or the `initialCenter` prop.
 * - Pin starts at the map center and can be dragged.
 * - `onLocationChange` fires after each drag with `(lat, lng)`.
 * - No global store dependency for the OL instance — fully isolated.
 */
export function LocationPicker({ initialCenter, onLocationChange }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const pinRef = useRef<Feature | null>(null)
  const viewRef = useRef<View | null>(null)
  // Track whether this is the initial pin placement (first render)
  const initialPinSet = useRef(false)

  // Read store center as fallback
  const storeCenter = useMapStore(s => s.center)
  const center = initialCenter ?? storeCenter

  // Stable callback ref to avoid re-creating interactions
  const onLocationChangeRef = useRef(onLocationChange)
  onLocationChangeRef.current = onLocationChange

  // Track lat/lng for display
  const [coords, setCoords] = useState<[number, number] | null>(null)

  // Notify parent of pin position
  const notifyCoords = useCallback(() => {
    const pin = pinRef.current
    if (!pin) return
    const geom = pin.getGeometry()
    if (!geom) return
    const coords = geom.getCoordinates()
    if (!coords) return
    const [lng, lat] = toLonLat(coords)
    setCoords([lat, lng])
    onLocationChangeRef.current(lat, lng)
  }, [])

  // Update initial pin position when center changes (only once)
  useEffect(() => {
    const pin = pinRef.current
    if (!pin || initialPinSet.current) return
    pin.getGeometry()?.setCoordinates(fromLonLat(center))
    initialPinSet.current = true
    notifyCoords()
  }, [center, notifyCoords])

  // Create map on mount
  useEffect(() => {
    if (!containerRef.current) return

    const pinPoint = new Point(fromLonLat(center))

    const pinFeature = new Feature(pinPoint)
    pinFeature.setStyle(
      new Style({
        image: new Circle({
          radius: 10,
          fill: new Fill({ color: '#1e40af' }),
          stroke: new Stroke({ color: '#fff', width: 2 }),
        }),
      }),
    )
    pinRef.current = pinFeature

    const vectorSource = new VectorSource({ features: [pinFeature] })
    const vectorLayer = new VectorLayer({ source: vectorSource })

    const tileLayer = new TileLayer({ source: new OSM() })

    const view = new View({
      center: fromLonLat(center),
      zoom: 14,
    })
    viewRef.current = view

    const map = new Map({
      target: containerRef.current,
      layers: [tileLayer, vectorLayer],
      view,
      controls: [],
      interactions: [], // We'll add only Translate
    })

    // Add translate interaction for the pin
    const translate = new Translate({
      features: new Collection([pinFeature]),
    })

    translate.on('translateend', (_event: TranslateEvent) => {
      notifyCoords()
    })

    map.addInteraction(translate)
    mapRef.current = map

    // Notify initial position
    notifyCoords()

    return () => {
      map.setTarget(undefined)
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount — center is used for initial position

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div
        data-testid="location-picker-map"
        ref={containerRef}
        style={{ width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden' }}
      />
      {coords && (
        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0', textAlign: 'center' }}>
          {coords[0].toFixed(4)}, {coords[1].toFixed(4)}
        </p>
      )}
    </div>
  )
}
