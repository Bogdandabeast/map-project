import { randomUUID } from 'node:crypto'
import { beforeEach, describe, expect, it } from 'vitest'
import { app } from '../../app'
import { db } from '../../db'
import { maps, markers } from '../../modules/maps/schema'

describe('maps API Full Integration', () => {
  beforeEach(async () => {
    // Clear tables before each test
    await db.delete(markers)
    await db.delete(maps)
  })

  it('should complete the full map lifecycle: create -> get -> update markers -> query markers', async () => {
    // 1. Create a Map
    const createRes = await app.request('/api/maps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'World Map',
        bounds: {
          northEast: { lat: 90, lng: 180 },
          southWest: { lat: -90, lng: -180 },
        },
      }),
    })
    expect(createRes.status).toBe(201)
    const { id: mapId } = await createRes.json()
    expect(mapId).toBeDefined()

    // 2. Verify Map Retrieval
    const getRes = await app.request(`/api/maps/${mapId}`)
    expect(getRes.status).toBe(200)
    const mapData = await getRes.json()
    expect(mapData.name).toBe('World Map')

    // 3. Create Markers (direct DB insert for setup)
    const markerId = randomUUID()
    await db.insert(markers).values({
      id: markerId,
      mapId,
      name: 'Test Marker',
      lat: 10,
      lng: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // 4. Update Marker via API
    const updateRes = await app.request(`/api/maps/markers/${markerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: 20,
        lng: 20,
      }),
    })
    expect(updateRes.status).toBe(200)

    // 5. Query Markers in Bounds
    const boundsRes = await app.request(`/api/maps/${mapId}/markers?northEastLat=30&northEastLng=30&southWestLat=10&southWestLng=10`)
    expect(boundsRes.status).toBe(200)
    const boundsData = await boundsRes.json()
    expect(boundsData).toHaveLength(1)
    expect(boundsData[0].lat).toBe(20)
    expect(boundsData[0].lng).toBe(20)

    // 6. Query Markers out of Bounds
    const outRes = await app.request(`/api/maps/${mapId}/markers?northEastLat=0&northEastLng=0&southWestLat=-10&southWestLng=-10`)
    expect(outRes.status).toBe(200)
    const outData = await outRes.json()
    expect(outData).toHaveLength(0)
  })

  it('should return 404 for non-existent map', async () => {
    const res = await app.request(`/api/maps/${randomUUID()}`)
    expect(res.status).toBe(404)
  })

  it('should validate marker update input', async () => {
    const res = await app.request(`/api/maps/markers/${randomUUID()}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: 'invalid',
      }),
    })
    expect(res.status).toBe(400)
  })
})
