/**
 * My Events listing — Drizzle inline.
 *
 * GET /api/me/events?filter=created|attending|all
 *   Sorted by date descending. Includes computed status.
 *   - created: events where creatorId = current user
 *   - attending: events where user has RSVP'd
 *   - all: both (default)
 */
import type { AuthFactory } from '../../types/auth'
import type { AppEnv } from '../../types/hono'
import type { AnyDrizzleDb } from '../../types/database'
import { desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { createAuth } from '../../db/lib/auth'
import { createDb } from '../../db/lib/database'
import { eventAttendees, events } from '../../db/schema/events-core'
import { requireRoleMiddleware } from '../../middlewares/requireRole'
import { computeEventStatus } from './events.routes'

export interface MeRoutesOptions {
  authFactory?: AuthFactory
  getDb?: (env: AppEnv['Bindings']) => AnyDrizzleDb
}

export function createMeRoutes(options: MeRoutesOptions = {}) {
  const authFactory = options.authFactory ?? createAuth
  const getDb = options.getDb ?? (env => createDb(env.DB))

  const routes = new Hono<AppEnv>()

  const auth = requireRoleMiddleware(authFactory, [
    'user',
    'premium',
    'moderator',
    'admin',
  ])

  // ── GET / ─────────────────────────────────────────────────────

  routes.get('/', auth, async (c) => {
    const currentUser = c.var.user!
    const filter = (c.req.query('filter') || 'all').toLowerCase()

    if (!['created', 'attending', 'all'].includes(filter)) {
      return c.json({ error: 'Invalid filter. Use: created, attending, or all' }, 400)
    }

    const db = getDb(c.env)
    let result: any[] = []

    if (filter === 'created' || filter === 'all') {
      const created = await db
        .select()
        .from(events)
        .where(eq(events.creatorId, currentUser.id))
        .orderBy(desc(events.date))

      result.push(...created)
    }

    if (filter === 'attending' || filter === 'all') {
      // Get events where user has RSVP'd
      const attendingRows = await db
        .select({
          id: events.id,
          title: events.title,
          address: events.address,
          lat: events.lat,
          lng: events.lng,
          date: events.date,
          capacity: events.capacity,
          plannedGames: events.plannedGames,
          skillLevel: events.skillLevel,
          atmosphere: events.atmosphere,
          imageKey: events.imageKey,
          status: events.status,
          creatorId: events.creatorId,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
        })
        .from(events)
        .innerJoin(eventAttendees, eq(events.id, eventAttendees.eventId))
        .where(eq(eventAttendees.userId, currentUser.id))
        .orderBy(desc(events.date))

      // Merge, avoiding duplicates when filter=all
      const existingIds = new Set(result.map((e: any) => e.id))
      for (const row of attendingRows) {
        if (!existingIds.has(row.id)) {
          result.push(row)
          existingIds.add(row.id)
        }
      }
    }

    // Sort merged result by date descending
    result.sort((a: any, b: any) => b.date - a.date)

    // Compute status for each event
    const eventsWithStatus = result.map((ev: any) => ({
      id: ev.id,
      title: ev.title,
      address: ev.address,
      lat: ev.lat,
      lng: ev.lng,
      date: ev.date,
      capacity: ev.capacity,
      plannedGames: ev.plannedGames,
      skillLevel: ev.skillLevel,
      atmosphere: ev.atmosphere,
      imageKey: ev.imageKey,
      creatorId: ev.creatorId,
      createdAt: ev.createdAt,
      updatedAt: ev.updatedAt,
      status: computeEventStatus({
        status: ev.status,
        date: ev.date,
        capacity: ev.capacity,
      }),
    }))

    return c.json(eventsWithStatus)
  })

  return routes
}

export const meRoutes = createMeRoutes()
