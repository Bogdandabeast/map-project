import { render } from '@testing-library/react'
import MapView from './MapView'

const createMapMock = vi.fn(() => ({}))
const destroyMock = vi.fn()
const syncFromModelMock = vi.fn()
const controllerConstructorMock = vi.fn()

function renderMapView() {
  return render(
    <MapView
      createModel={() => ({}) as any}
      createController={() => {
        controllerConstructorMock()
        return {
          createMap: createMapMock,
          destroy: destroyMock,
          syncFromModel: syncFromModelMock,
        }
      }}
    />,
  )
}

describe('mapView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the map container', () => {
      const { container } = renderMapView()

      expect(container.querySelector('.map-view')).toBeTruthy()
    })
  })

  describe('lifecycle', () => {
    it('should create the controller on mount', () => {
      renderMapView()

      expect(controllerConstructorMock).toHaveBeenCalledTimes(1)
    })

    it('should create the map on mount', () => {
      renderMapView()

      expect(createMapMock).toHaveBeenCalledTimes(1)
    })

    it('should not synchronize the model more than once during initial mount', () => {
      renderMapView()

      expect(syncFromModelMock).toHaveBeenCalledTimes(1)
    })

    it('should synchronize the model after mount', () => {
      renderMapView()

      expect(syncFromModelMock).toHaveBeenCalledTimes(1)
    })

    it('should destroy the map on unmount', () => {
      const { unmount } = renderMapView()

      unmount()

      expect(destroyMock).toHaveBeenCalledTimes(1)
    })
  })
})
