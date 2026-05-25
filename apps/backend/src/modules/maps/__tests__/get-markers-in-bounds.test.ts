import { describe, expect, it, vi } from 'bun:test'
import { db } from '../../../db'
import { getMarkersInBoundsHandler } from '../queries/get-markers-in-bounds.handler'

vi.mock('../../../db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([
      { id: 'm1', mapId: 'map-1', name: 'Marker 1', lat: 5, lng: 5 },
      { id: 'm2', mapId: 'map-1', name: 'Marker 2', lat: 6, lng: 6 },
    ]),
  },
}))

describe('getMarkersInBoundsHandler', () => {
  it('should return markers within the given bounds', async () => {
    const query = {
      mapId: 'map-1',
      bounds: {
        northEast: { lat: 10, lng: 10 },
        southWest: { lat: 0, lng: 0 },
      },
    }

    const result = await getMarkersInBoundsHandler(query)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      id: 'm1',
      mapId: 'map-1',
      name: 'Marker 1',
      lat: 5,
      lng: 5,
    })
  })

  it('should return an empty list when no markers are in bounds', async () => {
    (db.select().from().where as any).mockResolvedValueOnce([])

    const query = {
      mapId: 'map-1',
      bounds: {
        northEast: { lat: -10, lng: -10 },
        southWest: { lat: -20, lng: -20 },
      },
    }

    const result = await getMarkersInBoundsHandler(query)

    expect(result).toEqual([])
  })
})
