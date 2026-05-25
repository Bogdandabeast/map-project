import type { MapController } from '../controller/MapController'
import type { MapModelAdapter } from '../model/adapters/MapModelAdapter'
import { useEffect, useRef } from 'react'
import { useMachine } from '../../../hooks/useMachine'
import { useMapStore } from '../model/stores/mapStore'
import { mapInitMachine } from './mapInitMachine'
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
  const [state, send] = useMachine(mapInitMachine)

  const center = useMapStore(state => state.center)
  const zoom = useMapStore(state => state.zoom)

  // Trigger initial load
  useEffect(() => {
    send({ type: 'START_INIT' })
  }, [])

  // Handle Asset Loading
  useEffect(() => {
    if (state.type !== 'LOADING_ASSETS')
      return

    let mounted = true

    async function loadAssets() {
      try {
        if (!createModel) {
          await import('../model/adapters/MapModelAdapter')
        }
        if (!createController) {
          await import('../controller/MapController')
        }
        if (mounted) {
          send({ type: 'ASSETS_LOADED' })
        }
      }
      catch (e) {
        if (mounted) {
          send({ type: 'INIT_FAILED', error: (e as Error).message })
        }
      }
    }

    loadAssets()

    return () => {
      mounted = false
    }
  }, [state.type, createModel, createController])

  // Handle Instantiation
  useEffect(() => {
    if (state.type !== 'INSTANTIATING' || !containerRef.current)
      return

    let mounted = true

    async function instantiate() {
      try {
        const model = createModel
          ? createModel()
          : new (await import('../model/adapters/MapModelAdapter')).MapModelAdapter()

        if (!mounted)
          return

        const controller = createController
          ? createController(model, { target: containerRef.current! })
          : new (await import('../controller/MapController')).MapController(model, {
              target: containerRef.current!,
            })

        if (mounted) {
          send({ type: 'CONTROLLER_READY', controller })
        }
      }
      catch (e) {
        if (mounted) {
          send({ type: 'INIT_FAILED', error: (e as Error).message })
        }
      }
    }

    instantiate()

    return () => {
      mounted = false
    }
  }, [state.type, createModel, createController])

  // Handle Map Creation (READY state)
  useEffect(() => {
    if (state.type !== 'READY')
      return

    state.controller.createMap()

    return () => {
      state.controller.destroy()
    }
  }, [state])

  useEffect(() => {
    if (state.type === 'READY') {
      state.controller.syncFromModel()
    }
  }, [center, zoom, state])

  if (state.type === 'ERROR') {
    return (
      <div className="map-view error">
        <p>
          Failed to load map:
          {state.error}
        </p>
      </div>
    )
  }

  return (
    <div className="map-view" ref={containerRef}>
      {state.type !== 'READY' && (
        <div className="map-view-overlay loading">
          <p>Loading map...</p>
        </div>
      )}
    </div>
  )
}
