import { beforeEach, describe, expect, it, vi } from 'bun:test'
import { db } from '../../../db'
import { setupMapHandler } from '../commands/setup-map.handler'

const mockTx = {
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([{ id: 'mock-map-id' }]),
}

vi.mock('../../../db', () => ({
  db: {
    transaction: vi.fn(cb => cb(mockTx)),
  },
}))

describe('setupMapHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a map and its initial markers atomically', async () => {
    const request = {
      name: 'Setup Map',
      bounds: {
        northEast: { lat: 10, lng: 10 },
        southWest: { lat: -10, lng: -10 },
      },
      initialMarkers: [
        { name: 'Marker 1', lat: 1, lng: 1 },
        { name: 'Marker 2', lat: 2, lng: 2 },
      ],
    }

    const result = await setupMapHandler(request)

    expect(result).toEqual({ mapId: 'mock-map-id' })
    expect(db.transaction).toHaveBeenCalled()
    expect(mockTx.insert).toHaveBeenCalledTimes(2) // Once for map, once for markers
  })

  it('should create map without markers if initialMarkers is empty', async () => {
    const request = {
      name: 'No Markers Map',
      bounds: {
        northEast: { lat: 10, lng: 10 },
        southWest: { lat: -10, lng: -10 },
      },
      initialMarkers: [],
    }

    await setupMapHandler(request)

    expect(mockTx.insert).toHaveBeenCalledTimes(1)
  })
})
