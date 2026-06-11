/**
 * Events CRUD routes — Drizzle inline (no repository layer).
 *
 * POST   /api/events           — Create event
 * GET    /api/events?bbox=...  — Public event discovery (bbox search)
 * PATCH  /api/events/:id       — Edit event (creator only)
 * DELETE /api/events/:id       — Delete event (creator or mod/admin)
 * POST   /api/events/:id/cancel — Cancel event (creator only)
 *
 * All responses include a computed `status` field:
 *   cancelled → DB status is 'cancelled'
 *   past      → date < now
 *   full      → attendeeCount >= capacity
 *   upcoming  → otherwise
 */
import type { AuthFactory } from '../../types/auth'
import type { AnyDrizzleDb } from '../../types/database'
import type { AppEnv } from '../../types/hono'
import {
  createEventSchema,
  updateEventSchema,
} from '@repo/validations/events'
import { eq, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { createAuth } from '../../db/lib/auth'
import { createDb } from '../../db/lib/database'
import { events } from '../../db/schema/events-core'
import { optionalAuthMiddleware } from '../../middlewares/optionalAuth'
import { requireRoleMiddleware } from '../../middlewares/requireRole'

// ── Options ──────────────────────────────────────────────────────────

export interface EventRoutesOptions {
  authFactory?: AuthFactory
  getDb?: (env: AppEnv['Bindings']) => AnyDrizzleDb
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Compute the display status for an event based on its fields.
 * The DB `status` column stores 'cancelled' for cancelled events;
 * other statuses are computed at read time.
 */
export function computeEventStatus(
  event: {
    status: string
    date: number
    capacity: number
    attendeeCount?: number
  },
): string {
  if (event.status === 'cancelled')
    return 'cancelled'
  if (event.date < Date.now())
    return 'past'
  if (event.capacity > 0 && (event.attendeeCount ?? 0) >= event.capacity)
    return 'full'
  return 'upcoming'
}

// ── Factory ──────────────────────────────────────────────────────────

export function createEventRoutes(options: EventRoutesOptions = {}) {
  const authFactory = options.authFactory ?? createAuth
  const getDb = options.getDb ?? (env => createDb(env.DB))

  const routes = new Hono<AppEnv>()

  // Shared auth middleware for all event routes
  const auth = requireRoleMiddleware(authFactory, [
    'user',
    'premium',
    'moderator',
    'admin',
  ])

  // Public discovery endpoint (visitor-accessible)
  const optionalAuth = optionalAuthMiddleware(authFactory)

  // ── GET / — Public event discovery by bbox ──────────────────────

  routes.get('/', optionalAuth, async (c) => {
    const bbox = c.req.query('bbox')
    if (!bbox) {
      return c.json({ error: 'bbox parameter required (minLng,minLat,maxLng,maxLat)' }, 400)
    }

    const parts = bbox.split(',').map(Number)
    if (parts.length !== 4 || parts.some(isNaN)) {
      return c.json({ error: 'bbox must be four comma-separated numbers' }, 400)
    }

    const [minLng, minLat, maxLng, maxLat] = parts
    const db = getDb(c.env)

    const found = await db
      .select()
      .from(events)
      .where(
        sql`${events.lat} >= ${minLat} AND ${events.lat} <= ${maxLat}
            AND ${events.lng} >= ${minLng} AND ${events.lng} <= ${maxLng}
            AND ${events.status} != 'cancelled'`,
      )
      .all()

    // Map to response shape matching existing event response format
    const mapped = found.map((event) => {
      const computedStatus = computeEventStatus({
        status: event.status,
        date: event.date,
        capacity: event.capacity,
      })

      return {
        id: event.id,
        title: event.title,
        address: event.address,
        lat: event.lat,
        lng: event.lng,
        date: event.date,
        capacity: event.capacity,
        plannedGames: event.plannedGames,
        skillLevel: event.skillLevel,
        atmosphere: event.atmosphere,
        imageKey: event.imageKey,
        creatorId: event.creatorId,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        status: computedStatus,
      }
    })

    return c.json(mapped)
  })

  // ── POST / — Create event ──────────────────────────────────────

  routes.post('/', auth, async (c) => {
    const currentUser = c.var.user!

    let body: unknown
    try {
      body = await c.req.json()
    }
    catch {
      return c.json({ error: 'Invalid JSON body' }, 400)
    }

    const parsed = createEventSchema.safeParse(body)
    if (!parsed.success) {
      return c.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        400,
      )
    }

    const id = crypto.randomUUID()
    const db = getDb(c.env)

    await db.insert(events).values({
      id,
      title: parsed.data.title,
      address: parsed.data.address,
      lat: parsed.data.lat ?? 0,
      lng: parsed.data.lng ?? 0,
      date: parsed.data.date,
      capacity: parsed.data.capacity,
      plannedGames: parsed.data.plannedGames ?? [],
      skillLevel: parsed.data.skillLevel ?? null,
      atmosphere: parsed.data.atmosphere ?? null,
      creatorId: currentUser.id,
      status: 'upcoming',
    })

    const created = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1)

    if (!created[0]) {
      return c.json({ error: 'Event not found after creation' }, 500)
    }

    const event = created[0]
    const computedStatus = computeEventStatus({
      status: event.status,
      date: event.date,
      capacity: event.capacity,
    })

    return c.json(
      {
        id: event.id,
        title: event.title,
        address: event.address,
        lat: event.lat,
        lng: event.lng,
        date: event.date,
        capacity: event.capacity,
        plannedGames: event.plannedGames,
        skillLevel: event.skillLevel,
        atmosphere: event.atmosphere,
        imageKey: event.imageKey,
        creatorId: event.creatorId,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        status: computedStatus,
      },
      201,
    )
  })

  // ── GET /:id — Get single event ─────────────────────────────────

  routes.get('/:id', auth, async (c) => {
    const id = c.req.param('id')

    const db = getDb(c.env)

    const found = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1)

    if (!found[0]) {
      return c.json({ error: 'Event not found' }, 404)
    }

    const event = found[0]
    const computedStatus = computeEventStatus({
      status: event.status,
      date: event.date,
      capacity: event.capacity,
    })

    return c.json({
      id: event.id,
      title: event.title,
      address: event.address,
      lat: event.lat,
      lng: event.lng,
      date: event.date,
      capacity: event.capacity,
      plannedGames: event.plannedGames,
      skillLevel: event.skillLevel,
      atmosphere: event.atmosphere,
      imageKey: event.imageKey,
      creatorId: event.creatorId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      status: computedStatus,
    })
  })

  // ── PATCH /:id — Edit event (creator only) ─────────────────────

  routes.patch('/:id', auth, async (c) => {
    const currentUser = c.var.user!
    const id = c.req.param('id')

    const db = getDb(c.env)

    // Fetch the event
    const found = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1)

    if (!found[0]) {
      return c.json({ error: 'Event not found' }, 404)
    }

    const event = found[0]

    // Authorization: creator only
    if (event.creatorId !== currentUser.id) {
      return c.json({ error: 'Only the event creator can edit this event' }, 403)
    }

    let body: unknown
    try {
      body = await c.req.json()
    }
    catch {
      return c.json({ error: 'Invalid JSON body' }, 400)
    }

    const parsed = updateEventSchema.safeParse(body)
    if (!parsed.success) {
      return c.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        400,
      )
    }

    // Build update object from only the provided fields
    const updates: Record<string, unknown> = {}
    if (parsed.data.title !== undefined)
      updates.title = parsed.data.title
    if (parsed.data.address !== undefined)
      updates.address = parsed.data.address
    if (parsed.data.lat !== undefined)
      updates.lat = parsed.data.lat
    if (parsed.data.lng !== undefined)
      updates.lng = parsed.data.lng
    if (parsed.data.date !== undefined)
      updates.date = parsed.data.date
    if (parsed.data.capacity !== undefined)
      updates.capacity = parsed.data.capacity
    if (parsed.data.plannedGames !== undefined)
      updates.plannedGames = parsed.data.plannedGames
    if (parsed.data.skillLevel !== undefined)
      updates.skillLevel = parsed.data.skillLevel
    if (parsed.data.atmosphere !== undefined)
      updates.atmosphere = parsed.data.atmosphere
    updates.updatedAt = Date.now()

    if (Object.keys(updates).length === 0) {
      // No changes — return current event
      const computedStatus = computeEventStatus({
        status: event.status,
        date: event.date,
        capacity: event.capacity,
      })
      return c.json({ ...event, status: computedStatus })
    }

    await db.update(events).set(updates as any).where(eq(events.id, id))

    // Fetch updated event
    const updated = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1)

    if (!updated[0]) {
      return c.json({ error: 'Event not found after update' }, 500)
    }

    const ev = updated[0]
    const computedStatus = computeEventStatus({
      status: ev.status,
      date: ev.date,
      capacity: ev.capacity,
    })

    return c.json({
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
      status: computedStatus,
    })
  })

  // ── POST /:id/cancel — Cancel event (creator only) ─────────────

  routes.post('/:id/cancel', auth, async (c) => {
    const currentUser = c.var.user!
    const id = c.req.param('id')

    const db = getDb(c.env)

    const found = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1)

    if (!found[0]) {
      return c.json({ error: 'Event not found' }, 404)
    }

    const event = found[0]

    // Authorization: creator only
    if (event.creatorId !== currentUser.id) {
      return c.json({ error: 'Only the event creator can cancel this event' }, 403)
    }

    if (event.status === 'cancelled') {
      return c.json({ error: 'Event is already cancelled' }, 409)
    }

    await db
      .update(events)
      .set({ status: 'cancelled', updatedAt: Date.now() } as any)
      .where(eq(events.id, id))

    const cancelled = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1)

    const ev = cancelled[0]!
    return c.json({
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
      status: 'cancelled',
    })
  })

  // ── DELETE /:id — Delete event (creator or mod/admin) ──────────

  routes.delete('/:id', auth, async (c) => {
    const currentUser = c.var.user!
    const id = c.req.param('id')

    const db = getDb(c.env)

    const found = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1)

    if (!found[0]) {
      return c.json({ error: 'Event not found' }, 404)
    }

    const event = found[0]

    // Authorization: creator OR mod/admin
    const isCreator = event.creatorId === currentUser.id
    const isModOrAdmin = ['moderator', 'admin'].includes(
      (currentUser as { role?: string }).role ?? '',
    )

    if (!isCreator && !isModOrAdmin) {
      return c.json(
        { error: 'You do not have permission to delete this event' },
        403,
      )
    }

    await db.delete(events).where(eq(events.id, id))

    return c.body(null, 204)
  })

  return routes
}

/**
 * Pre-configured event routes using the real auth factory and D1 binding.
 */
export const eventRoutes = createEventRoutes()
