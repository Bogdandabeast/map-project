import type { CommandHandler } from '../../base'
import type { CreateMapRequest } from '../dtos/requests'
import { randomUUID } from 'node:crypto'
import { db } from '../../../db'
import { maps } from '../schema'

export const createMapHandler: CommandHandler<CreateMapRequest, { id: string }> = async (data) => {
  const [result] = await db.insert(maps).values({
    id: randomUUID(),
    name: data.name,
    bounds: data.bounds,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({ id: maps.id })

  return { id: result.id }
}
