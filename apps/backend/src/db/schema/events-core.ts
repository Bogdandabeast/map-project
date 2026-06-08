import { relations, sql } from 'drizzle-orm'
import {
  customType,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { user } from './auth'

// ── Custom JSON array type for planned_games ────────────────────
const jsonArray = customType<{ data: string[], driverData: string }>({
  dataType() {
    return 'text'
  },
  fromDriver(value: string): string[] {
    if (!value)
      return []
    try {
      return JSON.parse(value) as string[]
    }
    catch {
      return []
    }
  },
  toDriver(value: string[]): string {
    return JSON.stringify(value ?? [])
  },
})

// ── Events table ─────────────────────────────────────────────────
export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  address: text('address').notNull(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  date: integer('date').notNull(),
  capacity: integer('capacity').notNull(),
  plannedGames: jsonArray('planned_games'),
  skillLevel: text('skill_level'),
  atmosphere: text('atmosphere'),
  imageKey: text('image_key'),
  status: text('status').notNull().default('upcoming'),
  creatorId: text('creator_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at')
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at')
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
})

// ── Event Attendees (junction) table ─────────────────────────────
export const eventAttendees = sqliteTable(
  'event_attendees',
  {
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    rsvpAt: integer('rsvp_at')
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.eventId, table.userId] }),
  }),
)

// ── Drizzle Relations ─────────────────────────────────────────────
export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(user, {
    fields: [events.creatorId],
    references: [user.id],
  }),
  attendees: many(eventAttendees),
}))

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, {
    fields: [eventAttendees.eventId],
    references: [events.id],
  }),
  user: one(user, {
    fields: [eventAttendees.userId],
    references: [user.id],
  }),
}))

// ── drizzle-zod schemas ───────────────────────────────────────────
export const insertEventSchema = createInsertSchema(events, {
  title: schema => schema.min(3).max(200),
  address: schema => schema.min(1).max(500),
  lat: schema => schema.min(-90).max(90),
  lng: schema => schema.min(-180).max(180),
  capacity: schema => schema.min(1).max(10000),
})

export const selectEventSchema = createSelectSchema(events)

export const insertAttendeeSchema = createInsertSchema(eventAttendees)
export const selectAttendeeSchema = createSelectSchema(eventAttendees)
