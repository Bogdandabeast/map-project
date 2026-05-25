import { describe, expect, it } from 'vitest'
import { app } from '../../app'

describe('maps API Integration', () => {
  it('should create a map', async () => {
    const res = await app.request('/api/maps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Map',
        bounds: {
          northEast: { lat: 10, lng: 10 },
          southWest: { lat: 0, lng: 0 },
        },
      }),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data).toHaveProperty('id')
  })

  it('should fetch a map by id', async () => {
    const createRes = await app.request('/api/maps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Fetch Map',
        bounds: {
          northEast: { lat: 10, lng: 10 },
          southWest: { lat: 0, lng: 0 },
        },
      }),
    })
    const { id } = await createRes.json()

    const res = await app.request(`/api/maps/${id}`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.id).toBe(id)
    expect(data.name).toBe('Fetch Map')
  })

  it('should return 404 for non-existent map', async () => {
    const res = await app.request('/api/maps/non-existent-id')
    expect(res.status).toBe(404)
  })

  it('should validate POST /maps input', async () => {
    const res = await app.request('/api/maps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '', // invalid: min(1)
        bounds: {
          northEast: { lat: 10, lng: 10 },
          southWest: { lat: 0, lng: 0 },
        },
      }),
    })
    expect(res.status).toBe(400)
  })
})
