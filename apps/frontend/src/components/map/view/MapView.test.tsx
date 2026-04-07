import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MapView from './MapView'

const createMapMock = vi.fn(() => ({}))
const destroyMock = vi.fn()
const syncFromModelMock = vi.fn()
const controllerConstructorMock = vi.fn()

vi.mock('../controller/MapController', () => {
  return {
    MapController: vi.fn().mockImplementation(() => {
      controllerConstructorMock()

      return {
        createMap: createMapMock,
        destroy: destroyMock,
        syncFromModel: syncFromModelMock,
      }
    }),
  }
})

vi.mock('../model/adapters/MapModelAdapter', () => {
  return {
    MapModelAdapter: vi.fn().mockImplementation(() => ({})),
  }
})

describe('mapView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the map container', () => {
      const { container } = render(<MapView />)

      expect(container.querySelector('.map-view')).toBeTruthy()
    })
  })

  describe('lifecycle', () => {
    it('should create the controller on mount', () => {
      render(<MapView />)

      expect(controllerConstructorMock).toHaveBeenCalledTimes(1)
    })

    it('should create the map on mount', () => {
      render(<MapView />)

      expect(createMapMock).toHaveBeenCalledTimes(1)
    })

    it('should not synchronize the model more than once during initial mount', () => {
      render(<MapView />)

      expect(syncFromModelMock).toHaveBeenCalledTimes(1)
    })

    it('should synchronize the model after mount', () => {
      render(<MapView />)

      expect(syncFromModelMock).toHaveBeenCalledTimes(1)
    })

    it('should destroy the map on unmount', () => {
      const { unmount } = render(<MapView />)

      unmount()

      expect(destroyMock).toHaveBeenCalledTimes(1)
    })
  })
})
