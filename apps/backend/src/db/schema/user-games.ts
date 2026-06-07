import { sql } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { user } from './auth'
import { game } from './game'

export const userGames = sqliteTable(
  'user_games',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    gameId: text('game_id')
      .notNull()
      .references(() => game.id, { onDelete: 'cascade' }),
    skillLevel: text('skill_level'), // 'beginner' | 'intermediate' | 'advanced'
    owned: integer('owned', { mode: 'boolean' }).default(true).notNull(),
    addedAt: integer('added_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.userId, table.gameId] }),
  }),
)
