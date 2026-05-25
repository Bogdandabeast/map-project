import { describe, expect, it, vi } from 'bun:test'
import { db } from '../../../db'
import { createMapHandler } from '../commands/create-map.handler'

vi.mock('../../../db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 'mock-map-id' }]),
  },
}))

describe('createMapHandler', () => {
  it('should insert a map and return its id', async () => {
    const request = {
      name: 'Test Map',
      bounds: {
        northEast: { lat: 10, lng: 10 },
        southWest: { lat: -10, lng: -10 },
      },
    }

    const result = await createMapHandler(request)

    expect(result).toEqual({ id: 'mock-map-id' })
    expect(db.insert).toHaveBeenCalled()
    expect(db.values).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test Map',
      bounds: request.bounds,
    }))
  })

  it('should handle a different map name', async () => {
    const request = {
      name: 'Another Map',
      bounds: {
        northEast: { lat: 20, lng: 20 },
        southWest: { lat: 0, lng: 0 },
      },
    }

    await createMapHandler(request)

    expect(db.values).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Another Map',
    }))
  })
})
