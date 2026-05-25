import { describe, expect, it } from 'bun:test'
import { CreateMapSchema, UpdateMarkerSchema } from '../maps/dtos/requests'

describe('Maps Request DTOs', () => {
  it('should validate a valid CreateMap request', () => {
    const valid = {
      name: 'My Map',
      bounds: {
        northEast: { lat: 10, lng: 10 },
        southWest: { lat: -10, lng: -10 },
      },
    }
    expect(CreateMapSchema.safeParse(valid).success).toBe(true)
  })

  it('should invalidate CreateMap request with missing name', () => {
    const invalid = {
      bounds: {
        northEast: { lat: 10, lng: 10 },
        southWest: { lat: -10, lng: -10 },
      },
    }
    expect(CreateMapSchema.safeParse(invalid).success).toBe(false)
  })

  it('should validate a valid UpdateMarker request', () => {
    const valid = {
      lat: 10.1,
      lng: 20.2,
    }
    expect(UpdateMarkerSchema.safeParse(valid).success).toBe(true)
  })

  it('should invalidate UpdateMarker request with missing lat', () => {
    const invalid = {
      lng: 20.2,
    }
    expect(UpdateMarkerSchema.safeParse(invalid).success).toBe(false)
  })
})
