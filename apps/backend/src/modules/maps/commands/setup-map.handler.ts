import type { CommandHandler } from '../../base'
import { db } from '../../../db'
import { maps, markers } from '../schema'

export interface SetupMapRequest {
  name: string
  bounds: {
    northEast: { lat: number, lng: number }
    southWest: { lat: number, lng: number }
  }
  initialMarkers: Array<{ name: string, lat: number, lng: number }>
}

export const setupMapHandler: CommandHandler<SetupMapRequest, { mapId: string }> = async (data) => {
  return await db.transaction(async (tx) => {
    const [map] = await tx.insert(maps).values({
      id: crypto.randomUUID(),
      name: data.name,
      bounds: data.bounds,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning({ id: maps.id })

    if (data.initialMarkers.length > 0) {
      const markersToInsert = data.initialMarkers.map(m => ({
        id: crypto.randomUUID(),
        mapId: map.id,
        name: m.name,
        lat: m.lat,
        lng: m.lng,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      await tx.insert(markers).values(markersToInsert)
    }

    return { mapId: map.id }
  })
}
