import { useEffect, useRef } from 'react'
import { MapController } from '../controller/MapController'
import { MapModelAdapter } from '../model/adapters/MapModelAdapter'
import { useMapStore } from '../model/stores/mapStore'
import 'ol/ol.css'
import './MapView.css'

/**
 * MapView component
 * Initializes and renders the map inside a container.
 * It creates the map controller once and keeps it in sync
 * with the store state (center and zoom).
 * @returns {JSX.Element}
 */
export default function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const controllerRef = useRef<MapController | null>(null)

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

  return (
    <div className="map-view" ref={containerRef} />
  )
}
