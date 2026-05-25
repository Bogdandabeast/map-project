import { doublePrecision, json, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const maps = pgTable('maps', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  bounds: json('bounds').notNull(), // { northEast: { lat, lng }, southWest: { lat, lng } }
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull(),
})

export const markers = pgTable('markers', {
  id: text('id').primaryKey(),
  mapId: text('mapId').notNull().references(() => maps.id, { onDelete: 'cascade' }),
  name: text('name'),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull(),
})
