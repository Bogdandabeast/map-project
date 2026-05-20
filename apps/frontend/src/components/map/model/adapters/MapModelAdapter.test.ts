import { beforeEach, describe, expect, it } from 'vitest'
import { useMapStore } from '../stores/mapStore'
import { MapModelAdapter } from './MapModelAdapter'

describe('mapModelAdapter', () => {
  let adapter: MapModelAdapter

  beforeEach(() => {
    useMapStore.setState({
      map: null,
      center: [-3.7038, 40.4168],
      zoom: 6,
    })
    adapter = new MapModelAdapter()
  })

  it('should be a thin wrapper around the store', () => {
    const newCenter: [number, number] = [-4, 41]
    adapter.setCenter(newCenter)
    expect(useMapStore.getState().center).toEqual(newCenter)
  })

  it('should get and set center correctly', () => {
    const newCenter: [number, number] = [5, 10]
    adapter.setCenter(newCenter)
    expect(adapter.getCenter()).toEqual(newCenter)
    expect(useMapStore.getState().center).toEqual(newCenter)
  })

  it('should get and set zoom correctly', () => {
    const newZoom = 15
    adapter.setZoom(newZoom)
    expect(adapter.getZoom()).toBe(newZoom)
    expect(useMapStore.getState().zoom).toBe(newZoom)
  })

  it('should set map instance', () => {
    const fakeMap = { fake: true } as any
    adapter.setMap(fakeMap)
    expect(useMapStore.getState().map).toBe(fakeMap)
  })

  it('should reflect store changes in adapter getters', () => {
    useMapStore.setState({ center: [1, 2], zoom: 8 })
    expect(adapter.getCenter()).toEqual([1, 2])
    expect(adapter.getZoom()).toBe(8)
  })
})
