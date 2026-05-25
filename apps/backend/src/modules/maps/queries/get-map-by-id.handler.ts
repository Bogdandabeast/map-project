import type { QueryHandler } from '../../base'
import type { MapDTO } from '../dtos/responses'
import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { maps } from '../schema'

export const getMapByIdHandler: QueryHandler<{ id: string }, MapDTO | null> = async ({ id }) => {
  const map = await db.query.maps.findFirst({
    where: eq(maps.id, id),
  })

  if (!map)
    return null

  return {
    id: map.id,
    name: map.name,
    bounds: map.bounds,
  }
}
