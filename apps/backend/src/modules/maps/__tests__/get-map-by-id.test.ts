import { describe, expect, it, vi } from 'bun:test'
import { db } from '../../../db'
import { getMapByIdHandler } from '../queries/get-map-by-id.handler'

vi.mock('../../../db', () => ({
  db: {
    query: {
      maps: {
        findFirst: vi.fn(),
      },
    },
  },
}))

describe('getMapByIdHandler', () => {
  it('should return a MapDTO when map exists', async () => {
    const mockMap = {
      id: 'map-1',
      name: 'Test Map',
      bounds: {
        northEast: { lat: 10, lng: 10 },
        southWest: { lat: -10, lng: -10 },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (db.query.maps.findFirst as any).mockResolvedValue(mockMap)

    const result = await getMapByIdHandler({ id: 'map-1' })

    expect(result).toEqual({
      id: 'map-1',
      name: 'Test Map',
      bounds: mockMap.bounds,
    })
  })

  it('should return null when map does not exist', async () => {
    (db.query.maps.findFirst as any).mockResolvedValue(null)

    const result = await getMapByIdHandler({ id: 'non-existent' })

    expect(result).toBeNull()
  })
})
