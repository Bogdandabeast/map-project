/**
 * RSVP and attendee management — Drizzle inline.
 *
 * POST   /api/events/:id/rsvp        — RSVP (409 if full or duplicate)
 * DELETE /api/events/:id/rsvp        — Leave event
 * GET    /api/events/:id/attendees   — Attendee list (displayName, avatarUrl, rsvpAt)
 */
import type { AuthFactory } from '../../types/auth'
import type { AppEnv } from '../../types/hono'
import type { AnyDrizzleDb } from '../../types/database'
import { count, eq, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { createAuth } from '../../db/lib/auth'
import { createDb } from '../../db/lib/database'
import { eventAttendees, events } from '../../db/schema/events-core'
import { user } from '../../db/schema/auth'
import { requireRoleMiddleware } from '../../middlewares/requireRole'

export interface AttendeeRoutesOptions {
  authFactory?: AuthFactory
  getDb?: (env: AppEnv['Bindings']) => AnyDrizzleDb
}

export function createAttendeeRoutes(options: AttendeeRoutesOptions = {}) {
  const authFactory = options.authFactory ?? createAuth
  const getDb = options.getDb ?? (env => createDb(env.DB))

  const routes = new Hono<AppEnv>()

  const auth = requireRoleMiddleware(authFactory, [
    'user',
    'premium',
    'moderator',
    'admin',
  ])

  // ── POST /:id/rsvp ────────────────────────────────────────────

  routes.post('/:id/rsvp', auth, async (c) => {
    const currentUser = c.var.user!
    const eventId = c.req.param('id')

    const db = getDb(c.env)

    // Fetch event
    const found = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1)

    if (!found[0]) {
      return c.json({ error: 'Event not found' }, 404)
    }

    const event = found[0]

    if (event.status === 'cancelled') {
      return c.json({ error: 'Cannot RSVP to a cancelled event' }, 400)
    }

    // Check if user already RSVP'd
    const existing = await db
      .select()
      .from(eventAttendees)
      .where(
        sql`${eventAttendees.eventId} = ${eventId} AND ${eventAttendees.userId} = ${currentUser.id}`,
      )
      .limit(1)

    if (existing.length > 0) {
      return c.json({ error: 'You have already RSVP\'d to this event' }, 409)
    }

    // Count current attendees
    const countResult = await db
      .select({ count: count() })
      .from(eventAttendees)
      .where(eq(eventAttendees.eventId, eventId))

    const currentCount = countResult[0]?.count ?? 0

    // Check capacity
    if (currentCount >= event.capacity) {
      return c.json({ error: 'Event is full' }, 409)
    }

    // Insert RSVP
    await db.insert(eventAttendees).values({
      eventId,
      userId: currentUser.id,
    })

    return c.json({ eventId, userId: currentUser.id, rsvpAt: Date.now() }, 201)
  })

  // ── DELETE /:id/rsvp ──────────────────────────────────────────

  routes.delete('/:id/rsvp', auth, async (c) => {
    const currentUser = c.var.user!
    const eventId = c.req.param('id')

    const db = getDb(c.env)

    // Check if RSVP exists
    const existing = await db
      .select()
      .from(eventAttendees)
      .where(
        sql`${eventAttendees.eventId} = ${eventId} AND ${eventAttendees.userId} = ${currentUser.id}`,
      )
      .limit(1)

    if (existing.length === 0) {
      return c.json({ error: 'You have not RSVP\'d to this event' }, 404)
    }

    await db
      .delete(eventAttendees)
      .where(
        sql`${eventAttendees.eventId} = ${eventId} AND ${eventAttendees.userId} = ${currentUser.id}`,
      )

    return c.body(null, 204)
  })

  // ── GET /:id/attendees ────────────────────────────────────────

  routes.get('/:id/attendees', auth, async (c) => {
    const eventId = c.req.param('id')

    const db = getDb(c.env)

    // Verify event exists
    const found = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1)

    if (!found[0]) {
      return c.json({ error: 'Event not found' }, 404)
    }

    // Join eventAttendees with user table for display data
    // Using raw SQL via db.run for the join since drizzle ORM typed relations
    // may not be available in the test DB context
    const rows = await db
      .select({
        userId: eventAttendees.userId,
        displayName: user.name,
        avatarUrl: user.image,
        rsvpAt: eventAttendees.rsvpAt,
      })
      .from(eventAttendees)
      .innerJoin(user, eq(eventAttendees.userId, user.id))
      .where(eq(eventAttendees.eventId, eventId))
      .orderBy(sql`${eventAttendees.rsvpAt} ASC`)

    return c.json(rows)
  })

  return routes
}

export const attendeeRoutes = createAttendeeRoutes()
