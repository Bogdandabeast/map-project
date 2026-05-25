import type { CommandHandler } from '../../base'
import type { UpdateMarkerRequest } from '../dtos/requests'
import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { markers } from '../schema'

export const updateMarkerHandler: CommandHandler<{ id: string } & UpdateMarkerRequest, boolean> = async (data) => {
  const { id, ...updateData } = data

  const [updated] = await db.update(markers)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(markers.id, id))
    .returning({ id: markers.id })

  return !!updated
}
