import { describe, expect, it, vi } from 'bun:test'
import { db } from '../../../db'
import { updateMarkerHandler } from '../commands/update-marker.handler'

vi.mock('../../../db', () => ({
  db: {
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([{ id: 'marker-1' }]),
  },
}))

describe('updateMarkerHandler', () => {
  it('should update marker coordinates and return success', async () => {
    const request = {
      id: 'marker-1',
      lat: 12.3,
      lng: 45.6,
    }

    const result = await updateMarkerHandler(request)

    expect(result).toBe(true)
    expect(db.update).toHaveBeenCalled()
    expect(db.set).toHaveBeenCalledWith(expect.objectContaining({
      lat: 12.3,
      lng: 45.6,
    }))
  })

  it('should handle different coordinates', async () => {
    const request = {
      id: 'marker-2',
      lat: -1.1,
      lng: 100.5,
    }

    await updateMarkerHandler(request)

    expect(db.set).toHaveBeenCalledWith(expect.objectContaining({
      lat: -1.1,
      lng: 100.5,
    }))
  })
})
