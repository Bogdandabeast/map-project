import { useEffect, useRef } from 'react'
import type { MapController } from '../controller/MapController'
import type { MapModelAdapter } from '../model/adapters/MapModelAdapter'
import { useMapStore } from '../model/stores/mapStore'
import 'ol/ol.css'
import './MapView.css'

type ModelFactory = () => MapModelAdapter
type ControllerFactory = (
  model: MapModelAdapter,
  options: { target: HTMLElement },
) => MapController

interface MapViewDeps {
  createModel?: ModelFactory
  createController?: ControllerFactory
}

/**
 * MapView component
 * Initializes and renders the map inside a container.
 * It creates the map controller once and keeps it in sync
 * with the store state (center and zoom).
 *
 * Accepts optional factory functions for testing — when omitted
 * the real MapModelAdapter and MapController are loaded dynamically.
 *
 * @returns {JSX.Element}
 */
export default function MapView(deps: MapViewDeps = {}) {
  const { createModel, createController } = deps
  const containerRef = useRef<HTMLDivElement | null>(null)
  const controllerRef = useRef<MapController | null>(null)

  const center = useMapStore(state => state.center)
  const zoom = useMapStore(state => state.zoom)

  useEffect(() => {
    if (!containerRef.current || controllerRef.current)
      return

    let mounted = true

    async function init() {
      const model = createModel
        ? createModel()
        : new (await import('../model/adapters/MapModelAdapter')).MapModelAdapter()

      if (!mounted) return

      const controller = createController
        ? createController(model, { target: containerRef.current! })
        : new (await import('../controller/MapController')).MapController(model, {
            target: containerRef.current!,
          })

      if (!mounted) {
        controller.destroy()
        return
      }

      controller.createMap()
      controllerRef.current = controller
    }

    init()

    return () => {
      mounted = false
      controllerRef.current?.destroy()
      controllerRef.current = null
    }
  }, [createModel, createController])

  useEffect(() => {
    controllerRef.current?.syncFromModel()
  }, [center, zoom])

  return (
    <div className="map-view" ref={containerRef} />
  )
}
