import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const game = sqliteTable('game', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  minPlayers: integer('min_players'),
  maxPlayers: integer('max_players'),
  duration: integer('duration'),
  coverImage: text('cover_image'),
  bggId: integer('bgg_id').unique(),
  accessCount: integer('access_count').notNull().default(0),
  source: text('source').notNull().default('manual'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
})

export const insertGameSchema = createInsertSchema(game, {
  title: schema => schema.min(1).max(500),
  minPlayers: schema => schema.min(1).max(99),
  maxPlayers: schema => schema.min(1).max(99),
  duration: schema => schema.min(0).max(1440),
})

export const selectGameSchema = createSelectSchema(game)
