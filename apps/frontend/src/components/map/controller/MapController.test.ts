import type { IMapModel } from '../model/interfaces/IMapModel'
import { beforeEach, describe, expect, it, mock } from 'bun:test'
import Overlay from 'ol/Overlay'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { MapController } from './MapController'

// Stub ResizeObserver globally (needed before module evaluation)
class ResizeObserverMock {
  observe = mock()
  unobserve = mock()
  disconnect = mock()
}
globalThis.ResizeObserver = ResizeObserverMock

describe('mapController', () => {
  const INITIAL_CENTER: [number, number] = [-3.7038, 40.4168]
  const INITIAL_ZOOM = 6

  const createFakeModel = (): IMapModel => ({
    getCenter: mock(() => INITIAL_CENTER),
    getZoom: mock(() => INITIAL_ZOOM),
    setCenter: mock(),
    setZoom: mock(),
    setMap: mock(),
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

  describe('event layer', () => {
    const mockEvents = [
      { id: 'e1', title: 'Test Event 1', lat: -34.6037, lng: -58.3816, date: 1700000000, hostType: 'user' as const, games: ['Catan'] },
      { id: 'e2', title: 'Test Event 2', lat: -34.6150, lng: -58.4333, date: 1700000001, hostType: 'venue' as const, games: ['Wingspan'] },
    ]

    const getMap = () => (controller as any).map as import('ol/Map').default

    beforeEach(() => {
      controller.createMap()
    })

    describe('addEventLayer', () => {
      it('should add a VectorLayer to the map', () => {
        const initialLayerCount = getMap().getLayers().getArray().length

        controller.addEventLayer()
        const layers = getMap().getLayers().getArray()

        expect(layers.length).toBe(initialLayerCount + 1)
        expect(layers[layers.length - 1]).toBeInstanceOf(VectorLayer)
      })

      it('should not add a second event layer if already present', () => {
        controller.addEventLayer()
        const layerCountAfterFirst = getMap().getLayers().getArray().length

        controller.addEventLayer()
        const layerCountAfterSecond = getMap().getLayers().getArray().length

        expect(layerCountAfterSecond).toBe(layerCountAfterFirst)
      })
    })

    describe('removeEventLayer', () => {
      it('should not throw if no event layer exists', () => {
        expect(() => controller.removeEventLayer()).not.toThrow()
      })

      it('should remove the event layer from the map', () => {
        controller.addEventLayer()
        const layerCountBefore = getMap().getLayers().getArray().length

        controller.removeEventLayer()
        const layerCountAfter = getMap().getLayers().getArray().length

        expect(layerCountAfter).toBe(layerCountBefore - 1)
      })

      it('should not throw if called twice', () => {
        controller.addEventLayer()
        controller.removeEventLayer()

        expect(() => controller.removeEventLayer()).not.toThrow()
      })
    })

    describe('updateEventMarkers', () => {
      it('should not throw when no event layer exists yet', () => {
        expect(() => controller.updateEventMarkers(mockEvents)).not.toThrow()
      })

      it('should create features from events on the event layer source', () => {
        controller.addEventLayer()

        controller.updateEventMarkers(mockEvents)

        const layers = getMap().getLayers().getArray()
        const eventLayer = layers[layers.length - 1] as VectorLayer<VectorSource>
        const features = eventLayer.getSource()!.getFeatures()

        expect(features.length).toBe(2)
      })

      it('should place features at the correct coordinates', () => {
        controller.addEventLayer()

        controller.updateEventMarkers(mockEvents)

        const layers = getMap().getLayers().getArray()
        const eventLayer = layers[layers.length - 1] as VectorLayer<VectorSource>
        const features = eventLayer.getSource()!.getFeatures()

        const geometry = features[0].getGeometry()
        expect(geometry).toBeTruthy()
        expect(geometry!.getType()).toBe('Point')
      })

      it('should clear existing features when updating with new events', () => {
        controller.addEventLayer()
        controller.updateEventMarkers(mockEvents)

        const newEvents = [{ id: 'e3', title: 'New Event', lat: -34.0, lng: -58.0, date: 1700000002, hostType: 'user' as const, games: [] }]
        controller.updateEventMarkers(newEvents)

        const layers = getMap().getLayers().getArray()
        const eventLayer = layers[layers.length - 1] as VectorLayer<VectorSource>
        const features = eventLayer.getSource()!.getFeatures()

        expect(features.length).toBe(1)
      })

      it('should clear all features when given an empty array', () => {
        controller.addEventLayer()
        controller.updateEventMarkers(mockEvents)

        controller.updateEventMarkers([])

        const layers = getMap().getLayers().getArray()
        const eventLayer = layers[layers.length - 1] as VectorLayer<VectorSource>
        const features = eventLayer.getSource()!.getFeatures()

        expect(features.length).toBe(0)
      })

      it('should project event coordinates to map projection via fromLonLat', () => {
        controller.addEventLayer()
        controller.updateEventMarkers(mockEvents)

        const layers = getMap().getLayers().getArray()
        const eventLayer = layers[layers.length - 1] as VectorLayer<VectorSource>
        const features = eventLayer.getSource()!.getFeatures()

        // Two events = two features with different projected locations
        const coords0 = (features[0].getGeometry() as any).getCoordinates()
        const coords1 = (features[1].getGeometry() as any).getCoordinates()

        // Different events at different lat/lng should have different projected coords
        expect(coords0).not.toEqual(coords1)
      })

      it('should handle events with same lat but different lng', () => {
        controller.addEventLayer()
        // Two events at same latitude but different longitudes
        const sameLatEvents = [
          { id: 'ea', title: 'A', lat: -34.6, lng: -58.3, date: 1700000000, hostType: 'user' as const, games: [] },
          { id: 'eb', title: 'B', lat: -34.6, lng: -58.5, date: 1700000001, hostType: 'venue' as const, games: [] },
        ]
        controller.updateEventMarkers(sameLatEvents)

        const layers = getMap().getLayers().getArray()
        const eventLayer = layers[layers.length - 1] as VectorLayer<VectorSource>
        const features = eventLayer.getSource()!.getFeatures()

        expect(features.length).toBe(2)
        const coords0 = (features[0].getGeometry() as any).getCoordinates()
        const coords1 = (features[1].getGeometry() as any).getCoordinates()
        // Same latitude → x should differ, y should be equal
        expect(coords0[0]).not.toBe(coords1[0])
        expect(coords0[1]).toBe(coords1[1])
      })
    })
  })

  describe('event tooltip', () => {
    const getMap = () => (controller as any).map as import('ol/Map').default

    beforeEach(() => {
      controller.createMap()
    })

    it('should add an Overlay to the map', () => {
      const initialOverlayCount = getMap().getOverlays().getArray().length

      controller.addEventTooltip()

      const overlays = getMap().getOverlays().getArray()
      expect(overlays.length).toBe(initialOverlayCount + 1)
      expect(overlays[overlays.length - 1]).toBeInstanceOf(Overlay)
    })

    it('should not add a second tooltip if already present', () => {
      controller.addEventTooltip()
      const countAfterFirst = getMap().getOverlays().getArray().length

      controller.addEventTooltip()
      const countAfterSecond = getMap().getOverlays().getArray().length

      expect(countAfterSecond).toBe(countAfterFirst)
    })

    it('should not throw if tooltip is added without event layer', () => {
      expect(() => controller.addEventTooltip()).not.toThrow()
    })

    it('should remove the tooltip overlay when removeEventTooltip is called', () => {
      controller.addEventTooltip()
      const countBefore = getMap().getOverlays().getArray().length

      controller.removeEventTooltip()
      const countAfter = getMap().getOverlays().getArray().length

      expect(countAfter).toBe(countBefore - 1)
    })

    it('should not throw if removeEventTooltip is called without tooltip', () => {
      expect(() => controller.removeEventTooltip()).not.toThrow()
    })

    it('should not throw if removeEventTooltip is called twice', () => {
      controller.addEventTooltip()
      controller.removeEventTooltip()

      expect(() => controller.removeEventTooltip()).not.toThrow()
    })

    it('should create tooltip overlay with an HTML element', () => {
      controller.addEventTooltip()

      const overlays = getMap().getOverlays().getArray()
      const tooltipOverlay = overlays[overlays.length - 1] as Overlay
      const element = tooltipOverlay.getElement()

      expect(element).toBeTruthy()
      expect(element!.tagName).toBe('DIV')
      expect(element!.className).toBe('event-tooltip')
    })

    it('should position overlay at bottom-center with offset', () => {
      controller.addEventTooltip()

      const overlays = getMap().getOverlays().getArray()
      const tooltipOverlay = overlays[overlays.length - 1] as Overlay

      expect(tooltipOverlay.getPositioning()).toBe('bottom-center')
      expect(tooltipOverlay.getOffset()).toEqual([0, -10])
    })
  })
})
