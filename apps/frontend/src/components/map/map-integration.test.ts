import * as proj from 'ol/proj'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MapController } from './controller/MapController'
import { MapModelAdapter } from './model/adapters/MapModelAdapter'
import { useMapStore } from './model/stores/mapStore'

// Mock ol/proj
vi.mock('ol/proj', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ol/proj')>()
  return {
    ...actual,
    toLonLat: vi.fn((coords: any) => actual.toLonLat(coords)),
  }
})

// Mock ol/Map
vi.mock('ol/Map', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      const listeners: Record<string, Array<(...args: any[]) => any>> = {}
      return {
        on: vi.fn((event, callback) => {
          if (!listeners[event])
            listeners[event] = []
          listeners[event].push(callback)
          return 'fake-key'
        }),
        dispose: vi.fn(),
        setLayers: vi.fn(),
        trigger: (event: string) => {
          if (listeners[event]) {
            listeners[event].forEach(cb => cb())
          }
        },
      }
    }),
  }
})

// Mock ol/View
vi.mock('ol/View', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      let center = [0, 0]
      let zoom = 6
      return {
        getCenter: vi.fn(() => center),
        getZoom: vi.fn(() => zoom),
        setCenter: vi.fn((c) => { center = c }),
        setZoom: vi.fn((z) => { zoom = z }),
      }
    }),
  }
})

describe('map Integration', () => {
  let adapter: MapModelAdapter
  let controller: MapController
  let target: HTMLDivElement

  beforeEach(() => {
    vi.clearAllMocks()
    useMapStore.setState({
      map: null,
      center: [-3.7038, 40.4168],
      zoom: 6,
    })

    target = document.createElement('div')
    adapter = new MapModelAdapter()
    controller = new MapController(adapter, { target })
  })

  it('should synchronize map movement to the store', () => {
    const map = controller.createMap()

    const view = (controller as any).view
    const newCenter: [number, number] = [10, 20]
    const newZoom = 12

    view.setCenter([0, 0])
    view.setZoom(newZoom)

    vi.mocked(proj.toLonLat).mockReturnValue(newCenter)

    map.trigger('moveend')

    expect(useMapStore.getState().center).toEqual(newCenter)
    expect(useMapStore.getState().zoom).toBe(newZoom)
  })

  it('should synchronize store changes back to the map view', () => {
    controller.createMap()
    const view = (controller as any).view

    const newCenter: [number, number] = [15, 25]
    const newZoom = 8

    useMapStore.getState().setCenter(newCenter)
    useMapStore.getState().setZoom(newZoom)

    controller.syncFromModel()

    expect(view.setCenter).toHaveBeenCalledWith(proj.fromLonLat(newCenter))
    expect(view.setZoom).toHaveBeenCalledWith(newZoom)
  })

  it('should complete the full loop: Map -> Store -> Map', () => {
    const map = controller.createMap()
    const view = (controller as any).view

    const moveCenter: [number, number] = [100, 100]
    vi.mocked(proj.toLonLat).mockReturnValue(moveCenter)

    map.trigger('moveend')
    expect(useMapStore.getState().center).toEqual(moveCenter)

    const syncCenter: [number, number] = [200, 200]
    useMapStore.getState().setCenter(syncCenter)
    controller.syncFromModel()

    expect(view.setCenter).toHaveBeenCalledWith(proj.fromLonLat(syncCenter))
  })
})
