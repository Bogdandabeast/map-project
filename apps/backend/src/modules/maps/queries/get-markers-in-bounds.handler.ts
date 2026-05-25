import type { QueryHandler } from '../../base'
import type { MarkerDTO } from '../dtos/responses'
import { and, eq, gte, lte } from 'drizzle-orm'
import { db } from '../../../db'
import { markers } from '../schema'

export const getMarkersInBoundsHandler: QueryHandler<{ mapId: string, bounds: { northEast: { lat: number, lng: number }, southWest: { lat: number, lng: number } } }, MarkerDTO[]> = async ({ mapId, bounds }) => {
  const results = await db.select().from(markers).where(
    and(
      eq(markers.mapId, mapId),
      gte(markers.lat, bounds.southWest.lat),
      lte(markers.lat, bounds.northEast.lat),
      gte(markers.lng, bounds.southWest.lng),
      lte(markers.lng, bounds.northEast.lng),
    ),
  )

  return results.map(m => ({
    id: m.id,
    mapId: m.mapId,
    name: m.name,
    lat: m.lat,
    lng: m.lng,
  }))
}
