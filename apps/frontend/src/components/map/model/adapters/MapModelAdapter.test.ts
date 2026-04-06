import { beforeEach, describe, expect, it } from 'vitest'
import { useMapStore } from '../stores/mapStore'
import { MapModelAdapter } from './MapModelAdapter'

describe('mapModelAdapter', () => {
  const INITIAL_CENTER: [number, number] = [-3.7038, 40.4168]
  const INITIAL_ZOOM = 6

  let adapter: MapModelAdapter

  beforeEach(() => {
    useMapStore.setState({
      map: null,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    })

    adapter = new MapModelAdapter()
  })

  describe('getters', () => {
    it('should return the current center from the store', () => {
      const center = adapter.getCenter()

      expect(center).toEqual(INITIAL_CENTER)
    })

    it('should return the current zoom from the store', () => {
      const zoom = adapter.getZoom()

      expect(zoom).toBe(INITIAL_ZOOM)
    })
  })

  describe('setters', () => {
    it('should update the center in the store', () => {
      const newCenter: [number, number] = [-4, 41]

      adapter.setCenter(newCenter)

      expect(useMapStore.getState().center).toEqual(newCenter)
    })

    it('should update the zoom in the store', () => {
      const newZoom = 10

      adapter.setZoom(newZoom)

      expect(useMapStore.getState().zoom).toBe(newZoom)
    })

    it('should store the map instance in the store', () => {
      const fakeMap = { id: 'map-instance' } as any

      adapter.setMap(fakeMap)

      expect(useMapStore.getState().map).toBe(fakeMap)
    })

    it('should allow setting the map to null', () => {
      adapter.setMap(null)

      expect(useMapStore.getState().map).toBeNull()
    })
  })
})
