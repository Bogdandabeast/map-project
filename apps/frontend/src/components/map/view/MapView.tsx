import { useEffect, useRef } from 'react'
import type { EventMarker } from '../../discovery/types'
import { MapController } from '../controller/MapController'
import { MapModelAdapter } from '../model/adapters/MapModelAdapter'
import { useMapStore } from '../model/stores/mapStore'
import 'ol/ol.css'
import './MapView.css'

export interface MapViewProps {
  /** Event markers to display on the map. Clears layer when empty/undefined. */
  events?: EventMarker[]
}

/**
 * MapView component
 * Initializes and renders the map inside a container.
 * It creates the map controller once and keeps it in sync
 * with the store state (center and zoom).
 * @param props.events Optional event markers to render as map markers
 * @returns {JSX.Element}
 */
export default function MapView({ events }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const controllerRef = useRef<MapController | null>(null)
  const hasEventLayerRef = useRef(false)

  const center = useMapStore(state => state.center)
  const zoom = useMapStore(state => state.zoom)

  useEffect(() => {
    if (!containerRef.current || controllerRef.current)
      return

    const model = new MapModelAdapter()

    const controller = new MapController(model, {
      target: containerRef.current,
    })

    controller.createMap()
    controllerRef.current = controller

    return () => {
      controller.destroy()
      controllerRef.current = null
    }
  }, [])

  useEffect(() => {
    controllerRef.current?.syncFromModel()
  }, [center, zoom])

  // Wire event markers to the map layer
  useEffect(() => {
    const controller = controllerRef.current
    if (!controller)
      return

    if (events && events.length > 0) {
      // Ensure event layer exists before updating markers
      controller.addEventLayer()
      controller.addEventTooltip()
      hasEventLayerRef.current = true
      controller.updateEventMarkers(events)
    }
    else if (hasEventLayerRef.current) {
      // Clear markers but keep the layer (allows re-searches to be fast)
      controller.updateEventMarkers([])
    }
  }, [events])

  return (
    <div className="map-view" ref={containerRef} />
  )
}
