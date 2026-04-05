import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MapView from './MapView'

const mocks = vi.hoisted(() => {
  return {
    createMapMock: vi.fn(() => ({})),
    destroyMock: vi.fn(),
    syncFromModelMock: vi.fn(),
    constructorMock: vi.fn(),
  }
})

vi.mock('../controller/MapController', () => {
  return {
    MapController: vi.fn().mockImplementation(() => {
      mocks.constructorMock()

      return {
        createMap: mocks.createMapMock,
        destroy: mocks.destroyMock,
        syncFromModel: mocks.syncFromModelMock,
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

  it('renderiza el contenedor del mapa', () => {
    const { container } = render(<MapView />)

    const mapDiv = container.querySelector('.map-view')
    expect(mapDiv).toBeTruthy()
  })

  it('crea el controlador y el mapa al montar', () => {
    render(<MapView />)

    expect(mocks.constructorMock).toHaveBeenCalledTimes(1)
    expect(mocks.createMapMock).toHaveBeenCalledTimes(1)
  })

  it('sincroniza el modelo tras el montaje', () => {
    render(<MapView />)

    expect(mocks.syncFromModelMock).toHaveBeenCalled()
  })

  it('destruye el mapa al desmontar', () => {
    const { unmount } = render(<MapView />)

    unmount()

    expect(mocks.destroyMock).toHaveBeenCalledTimes(1)
  })
})
