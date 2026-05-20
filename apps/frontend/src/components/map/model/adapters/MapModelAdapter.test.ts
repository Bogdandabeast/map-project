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
})
