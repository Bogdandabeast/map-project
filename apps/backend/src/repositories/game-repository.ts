import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'
import { desc, eq, like, sql } from 'drizzle-orm'
import { game } from '../db/schema/game'

/**
 * Game repository provides data access for the game catalog.
 * Works with any drizzle-orm SQLite driver (Bun SQLite, D1, libSQL, etc.).
 */

// ── Game input types ───────────────────────────────────────────────

export interface UpsertGameInput {
  bggId: number
  title: string
  description: string | null
  imageUrl: string | null
  coverImage: string | null
  minPlayers: number | null
  maxPlayers: number | null
  duration: number | null
  source: 'manual' | 'bgg'
}

// ── Repository interface ──────────────────────────────────────────

export interface GameRepository {
  searchByName: (query: string, limit?: number) => Promise<Array<typeof game.$inferSelect>>
  findById: (id: string) => Promise<typeof game.$inferSelect | null>
  getPopular: (limit?: number) => Promise<Array<typeof game.$inferSelect>>
  getRecent: (limit?: number) => Promise<Array<typeof game.$inferSelect>>
  upsert: (input: UpsertGameInput) => Promise<typeof game.$inferSelect>
  incrementAccess: (id: string) => Promise<void>
}

// ── Factory ───────────────────────────────────────────────────────

export function createGameRepository(
  db: BunSQLiteDatabase<{ game: typeof game }>,
): GameRepository {
  return {
    async searchByName(query: string, limit = 20) {
      return db
        .select()
        .from(game)
        .where(like(game.title, `%${query}%`))
        .limit(limit)
        .all()
    },

    async findById(id: string) {
      const results = await db
        .select()
        .from(game)
        .where(eq(game.id, id))
        .limit(1)
        .all()
      return results[0] ?? null
    },

    async getPopular(limit = 50) {
      return db
        .select()
        .from(game)
        .orderBy(desc(game.accessCount))
        .limit(limit)
        .all()
    },

    async getRecent(limit = 20) {
      return db
        .select()
        .from(game)
        .orderBy(desc(game.createdAt))
        .limit(limit)
        .all()
    },

    async upsert(input: UpsertGameInput) {
      const values = {
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        coverImage: input.coverImage,
        minPlayers: input.minPlayers,
        maxPlayers: input.maxPlayers,
        duration: input.duration,
        bggId: input.bggId,
        accessCount: 0,
        source: input.source,
      }

      await db
        .insert(game)
        .values(values)
        .onConflictDoUpdate({
          target: game.bggId,
          set: {
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl,
            coverImage: input.coverImage,
            minPlayers: input.minPlayers,
            maxPlayers: input.maxPlayers,
            duration: input.duration,
            source: input.source,
            updatedAt: sql`(cast(unixepoch('subsecond') * 1000 as integer))`,
          },
        })
        .run()

      // Return the upserted game by bggId
      const result = await db
        .select()
        .from(game)
        .where(eq(game.bggId, input.bggId))
        .limit(1)
        .all()

      return result[0]
    },

    async incrementAccess(id: string) {
      await db
        .update(game)
        .set({
          accessCount: sql`${game.accessCount} + 1`,
        })
        .where(eq(game.id, id))
        .run()
    },
  }
}
