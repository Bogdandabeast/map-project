import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { MapModelAdapter } from '../model/adapters/MapModelAdapter'
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
  let adapter: MapModelAdapter
  let fakeDiv: HTMLDivElement
  let controller: MapController

  beforeEach(() => {
    adapter = new MapModelAdapter()
    fakeDiv = document.createElement('div')
    controller = new MapController(adapter, { target: fakeDiv })
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

    it('should allow recreating the map after destroy', () => {
      const firstMap = controller.createMap()

      controller.destroy()

      const secondMap = controller.createMap()

      expect(secondMap).toBeTruthy()
      expect(secondMap).not.toBe(firstMap)
    })
  })
})
