import type { MapDTO, MarkerDTO } from '../maps/dtos/responses'
import { describe, expect, it } from 'bun:test'

describe('Maps Response DTOs', () => {
  it('should allow creating a MapDTO', () => {
    const map: MapDTO = {
      id: '1',
      name: 'Test Map',
      bounds: {
        northEast: { lat: 10, lng: 10 },
        southWest: { lat: -10, lng: -10 },
      },
    }
    expect(map.id).toBe('1')
  })

  it('should allow creating a MarkerDTO', () => {
    const marker: MarkerDTO = {
      id: 'm1',
      mapId: '1',
      name: 'Marker 1',
      lat: 10.1,
      lng: 20.2,
    }
    expect(marker.id).toBe('m1')
  })
})
