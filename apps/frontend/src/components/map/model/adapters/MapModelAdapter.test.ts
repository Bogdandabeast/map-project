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
  describe('edge Cases', () => {
    it('should accept out-of-range coordinates (no validation at adapter level)', () => {
      const invalidCenter: [number, number] = [200, 100] // invalid lon/lat

      adapter.setCenter(invalidCenter)

      expect(useMapStore.getState().center).toEqual(invalidCenter)
    })

    it('should accept negative zoom values', () => {
      const negativeZoom = -5

      adapter.setZoom(negativeZoom)

      expect(useMapStore.getState().zoom).toBe(negativeZoom)
    })

    it('should accept extremely large zoom values', () => {
      const hugeZoom = 9999

      adapter.setZoom(hugeZoom)

      expect(useMapStore.getState().zoom).toBe(hugeZoom)
    })

    it('should be idempotent when setting the same center twice', () => {
      const center = adapter.getCenter()

      const previousState = useMapStore.getState()

      adapter.setCenter(center)
      adapter.setCenter(center)

      const nextState = useMapStore.getState()

      expect(nextState).toBe(previousState)
    })

    it('should be idempotent when setting the same zoom twice', () => {
      const zoom = adapter.getZoom()

      const previousState = useMapStore.getState()

      adapter.setZoom(zoom)
      adapter.setZoom(zoom)

      const nextState = useMapStore.getState()

      expect(nextState).toBe(previousState)
    })
  })
})
