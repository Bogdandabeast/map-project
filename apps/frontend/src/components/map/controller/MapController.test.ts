import type { IMapModel } from '../model/interfaces/IMapModel'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { MapController } from './MapController'

beforeAll(() => {
  class ResizeObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }

  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
})

describe('mapController', () => {
  const INITIAL_CENTER: [number, number] = [-3.7038, 40.4168]
  const INITIAL_ZOOM = 6

  const createFakeModel = (): IMapModel => ({
    getCenter: vi.fn(() => INITIAL_CENTER),
    getZoom: vi.fn(() => INITIAL_ZOOM),
    setCenter: vi.fn(),
    setZoom: vi.fn(),
    setMap: vi.fn(),
  })

  let fakeModel: IMapModel
  let fakeDiv: HTMLDivElement
  let controller: MapController

  beforeEach(() => {
    fakeModel = createFakeModel()
    fakeDiv = document.createElement('div')
    controller = new MapController(fakeModel, { target: fakeDiv })
  })

  describe('creation', () => {
    it('should create a map instance', () => {
      const map = controller.createMap()

      expect(map).toBeTruthy()
    })

    it('should create the map only once and reuse the same instance', () => {
      const firstMap = controller.createMap()
      const secondMap = controller.createMap()

      expect(firstMap).toBe(secondMap)
    })

    it('should read initial center from the model', () => {
      controller.createMap()

      expect(fakeModel.getCenter).toHaveBeenCalledTimes(1)
    })

    it('should read initial zoom from the model', () => {
      controller.createMap()

      expect(fakeModel.getZoom).toHaveBeenCalledTimes(1)
    })

    it('should store the map instance in the model', () => {
      const map = controller.createMap()

      expect(fakeModel.setMap).toHaveBeenCalledTimes(1)
      expect(fakeModel.setMap).toHaveBeenCalledWith(map)
    })
  })

  describe('destruction', () => {
    it('should not throw if destroy is called without a map', () => {
      expect(() => controller.destroy()).not.toThrow()
    })

    it('should not throw if destroy is called multiple times', () => {
      controller.createMap()

      expect(() => {
        controller.destroy()
        controller.destroy()
      }).not.toThrow()
    })

    it('should clear internal map reference after destroy', () => {
      controller.createMap()
      controller.destroy()

      expect((controller as any).map).toBeNull()
    })

    it('should allow recreating the map after destroy', () => {
      const firstMap = controller.createMap()

      controller.destroy()

      const secondMap = controller.createMap()

      expect(secondMap).toBeTruthy()
      expect(secondMap).not.toBe(firstMap)
    })
  })
})
