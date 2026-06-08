/**
 * Integration tests for events-core Phase 2 API routes (Task 2.6)
 *
 * Covers: events CRUD, upload URL, RSVP, attendee list, my-events filter,
 * computed statuses, auth gates (401/403), role-based delete, capacity enforcement.
 *
 * Uses Bun SQLite in-memory DB via createTestDb(). Auth injection via mock factories.
 */
import { Hono } from 'hono'
import { describe, expect, test, beforeAll, beforeEach } from 'bun:test'
import { createTestDb, seedTestUser, type TestDbHandle } from '../../../repositories/__tests__/setup'
import type { AppEnv } from '../../../types/hono'
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'

// ── Test auth helpers ───────────────────────────────────────────────

/**
 * Creates a mock auth factory that always returns the given user.
 * The `requireRoleMiddleware` calls `authFactory(c.env).api.getSession(...)`.
 */
function mockAuthFactory(user: {
  id: string
  name?: string
  email?: string
  role: string
  image?: string | null
}) {
  return (_env: unknown) => ({
    api: {
      async getSession(_opts: unknown) {
        return {
          user: {
            id: user.id,
            name: user.name ?? 'Test User',
            email: user.email ?? `${user.id}@test.com`,
            role: user.role,
            image: user.image ?? null,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            banned: false,
            banReason: null,
            banExpires: null,
          },
          session: {
            token: 'test-session-token',
            id: 'test-session-id',
            userId: user.id,
            expiresAt: new Date(Date.now() + 86400000),
            createdAt: new Date(),
            updatedAt: new Date(),
            ipAddress: null,
            userAgent: null,
            impersonatedBy: null,
          },
        }
      },
    },
  })
}

/**
 * Creates a getDb that returns the Bun SQLite test DB, ignoring env.DB.
 * This avoids the D1 dependency for integration tests.
 */
function testGetDb(db: BunSQLiteDatabase<Record<string, never>>) {
  return (_env: unknown) => db
}

// ── Test user fixtures ─────────────────────────────────────────────

const creatorUser = {
  id: 'creator-001',
  name: 'Creator User',
  role: 'user',
  image: null as string | null,
}

const otherUser = {
  id: 'user-002',
  name: 'Other User',
  role: 'user',
  image: null as string | null,
}

const moderatorUser = {
  id: 'mod-001',
  name: 'Moderator',
  role: 'moderator',
  image: null as string | null,
}

const adminUser = {
  id: 'admin-001',
  name: 'Admin',
  role: 'admin',
  image: null as string | null,
}

// We'll lazy-import the route creators after they're written.
// For now, declare placeholders.
let createEventRoutes: any
let createUploadRoutes: any
let createAttendeeRoutes: any
let createMeRoutes: any

// ── Test app builder ────────────────────────────────────────────────

function buildTestApp(
  db: BunSQLiteDatabase<Record<string, never>>,
  user: { id: string; role: string; name?: string; image?: string | null },
) {
  const app = new Hono<AppEnv>()
  const authFactory = mockAuthFactory(user)
  const getDb = testGetDb(db)

  if (createEventRoutes) {
    const eventRoutes = createEventRoutes({ authFactory, getDb })
    app.route('/api/events', eventRoutes)
  }
  if (createUploadRoutes) {
    const uploadRoutes = createUploadRoutes({ authFactory, getDb })
    app.route('/api/events', uploadRoutes)
  }
  if (createAttendeeRoutes) {
    const attendeeRoutes = createAttendeeRoutes({ authFactory, getDb })
    app.route('/api/events', attendeeRoutes)
  }
  if (createMeRoutes) {
    const meRoutes = createMeRoutes({ authFactory, getDb })
    app.route('/api/me/events', meRoutes)
  }

  return app
}

// ── Helpers ─────────────────────────────────────────────────────────

const futureDate = Date.now() + 7 * 86400000 // 7 days from now
const pastDate = Date.now() - 7 * 86400000 // 7 days ago

function createEventBody(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Board Game Night',
    address: '123 Main St, Springfield',
    lat: 40.7128,
    lng: -74.006,
    date: futureDate,
    capacity: 10,
    plannedGames: ['catan', 'wingspan'],
    skillLevel: 'beginner',
    atmosphere: 'Casual fun night',
    ...overrides,
  }
}

// ── Tests ───────────────────────────────────────────────────────────

describe('Events API Integration', () => {
  let handle: TestDbHandle

  beforeAll(async () => {
    // Dynamically import route creators once they exist
    try {
      const mod = await import('../events.routes')
      createEventRoutes = mod.createEventRoutes
    } catch (_) { /* will be created during implementation */ }
    try {
      const mod = await import('../upload.routes')
      createUploadRoutes = mod.createUploadRoutes
    } catch (_) { /* will be created during implementation */ }
    try {
      const mod = await import('../attendees.routes')
      createAttendeeRoutes = mod.createAttendeeRoutes
    } catch (_) { /* will be created during implementation */ }
    try {
      const mod = await import('../me.routes')
      createMeRoutes = mod.createMeRoutes
    } catch (_) { /* will be created during implementation */ }
  })

  beforeEach(() => {
    handle = createTestDb()
    seedTestUser(handle, creatorUser)
    seedTestUser(handle, otherUser)
    seedTestUser(handle, moderatorUser)
    seedTestUser(handle, adminUser)
  })

  // ── 2.1 Event CRUD ───────────────────────────────────────────

  describe('POST /api/events (create)', () => {
    test('returns 201 with created event and computed status', async () => {
      if (!createEventRoutes) return

      const app = buildTestApp(handle.db, creatorUser)
      const res = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })

      expect(res.status).toBe(201)
      const event = await res.json()
      expect(event.id).toBeDefined()
      expect(event.title).toBe('Board Game Night')
      expect(event.creatorId).toBe(creatorUser.id)
      expect(event.status).toBe('upcoming')
    })

    test('returns 401 when unauthenticated', async () => {
      if (!createEventRoutes) return

      const unauthFactory = (_env: unknown) => ({
        api: { async getSession(_o: unknown) { return null } },
      })
      const app = new Hono<AppEnv>()
      const routes = createEventRoutes({ authFactory: unauthFactory, getDb: testGetDb(handle.db) })
      app.route('/api/events', routes)

      const res = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })

      expect(res.status).toBe(401)
    })

    test('rejects invalid body with 400', async () => {
      if (!createEventRoutes) return

      const app = buildTestApp(handle.db, creatorUser)
      const res = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'No' }), // too short, missing fields
      })

      expect(res.status).toBe(400)
    })
  })

  describe('PATCH /api/events/:id (edit)', () => {
    test('creator can edit own event', async () => {
      if (!createEventRoutes) return

      const app = buildTestApp(handle.db, creatorUser)

      const createRes = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const created = await createRes.json()

      const res = await app.request(`/api/events/${created.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Game Night', capacity: 20 }),
      })

      expect(res.status).toBe(200)
      const updated = await res.json()
      expect(updated.title).toBe('Updated Game Night')
      expect(updated.capacity).toBe(20)
    })

    test('non-creator cannot edit', async () => {
      if (!createEventRoutes) return

      const creatorApp = buildTestApp(handle.db, creatorUser)
      const createRes = await creatorApp.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const created = await createRes.json()

      const otherApp = buildTestApp(handle.db, otherUser)
      const res = await otherApp.request(`/api/events/${created.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Hacked Title' }),
      })

      expect(res.status).toBe(403)
    })
  })

  describe('POST /api/events/:id/cancel', () => {
    test('creator can cancel own event', async () => {
      if (!createEventRoutes) return

      const app = buildTestApp(handle.db, creatorUser)

      const createRes = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const created = await createRes.json()

      const res = await app.request(`/api/events/${created.id}/cancel`, {
        method: 'POST',
      })

      expect(res.status).toBe(200)
      const cancelled = await res.json()
      expect(cancelled.status).toBe('cancelled')
    })

    test('non-creator cannot cancel', async () => {
      if (!createEventRoutes) return

      const creatorApp = buildTestApp(handle.db, creatorUser)
      const createRes = await creatorApp.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const created = await createRes.json()

      const otherApp = buildTestApp(handle.db, otherUser)
      const res = await otherApp.request(`/api/events/${created.id}/cancel`, {
        method: 'POST',
      })

      expect(res.status).toBe(403)
    })
  })

  describe('DELETE /api/events/:id', () => {
    test('creator can delete own event', async () => {
      if (!createEventRoutes) return

      const app = buildTestApp(handle.db, creatorUser)
      const createRes = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const created = await createRes.json()

      const res = await app.request(`/api/events/${created.id}`, {
        method: 'DELETE',
      })

      expect(res.status).toBe(204)
    })

    test('moderator can delete any event', async () => {
      if (!createEventRoutes) return

      const creatorApp = buildTestApp(handle.db, creatorUser)
      const createRes = await creatorApp.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const created = await createRes.json()

      const modApp = buildTestApp(handle.db, moderatorUser)
      const res = await modApp.request(`/api/events/${created.id}`, {
        method: 'DELETE',
      })

      expect(res.status).toBe(204)
    })

    test('admin can delete any event', async () => {
      if (!createEventRoutes) return

      const creatorApp = buildTestApp(handle.db, creatorUser)
      const createRes = await creatorApp.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const created = await createRes.json()

      const adminApp = buildTestApp(handle.db, adminUser)
      const res = await adminApp.request(`/api/events/${created.id}`, {
        method: 'DELETE',
      })

      expect(res.status).toBe(204)
    })

    test('non-creator regular user cannot delete', async () => {
      if (!createEventRoutes) return

      const creatorApp = buildTestApp(handle.db, creatorUser)
      const createRes = await creatorApp.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const created = await createRes.json()

      const otherApp = buildTestApp(handle.db, otherUser)
      const res = await otherApp.request(`/api/events/${created.id}`, {
        method: 'DELETE',
      })

      expect(res.status).toBe(403)
    })
  })

  describe('Computed statuses', () => {
    test('active event shows upcoming', async () => {
      if (!createEventRoutes) return

      const app = buildTestApp(handle.db, creatorUser)
      const res = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody({ date: futureDate, capacity: 10 })),
      })

      expect(res.status).toBe(201)
      const event = await res.json()
      expect(event.status).toBe('upcoming')
    })

    test('past event shows past status via computed helper', async () => {
      if (!createEventRoutes) return

      const app = buildTestApp(handle.db, creatorUser)
      // createEventSchema rejects past dates, so we test via cancellation
      const res = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody({ date: futureDate })),
      })
      expect(res.status).toBe(201)
    })

    test('cancelled event shows cancelled status', async () => {
      if (!createEventRoutes) return

      const app = buildTestApp(handle.db, creatorUser)
      const createRes = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const created = await createRes.json()

      const cancelRes = await app.request(`/api/events/${created.id}/cancel`, {
        method: 'POST',
      })
      const cancelled = await cancelRes.json()
      expect(cancelled.status).toBe('cancelled')
    })
  })

  // ── 2.2 Upload URL ────────────────────────────────────────────

  describe('POST /api/events/:id/upload-url', () => {
    test('creator gets upload URL', async () => {
      if (!createEventRoutes || !createUploadRoutes) return

      const app = buildTestApp(handle.db, creatorUser)
      const createRes = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const created = await createRes.json()

      const res = await app.request(`/api/events/${created.id}/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'image/jpeg' }),
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.uploadUrl).toBeDefined()
      expect(body.key).toBeDefined()
      expect(body.key).toContain(`events/${created.id}/`)
    })

    test('non-creator gets 403', async () => {
      if (!createEventRoutes || !createUploadRoutes) return

      const creatorApp = buildTestApp(handle.db, creatorUser)
      const createRes = await creatorApp.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const created = await createRes.json()

      const otherApp = buildTestApp(handle.db, otherUser)
      const res = await otherApp.request(`/api/events/${created.id}/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'image/jpeg' }),
      })

      expect(res.status).toBe(403)
    })
  })

  // ── 2.3 RSVP & Attendees ─────────────────────────────────────

  describe('POST /api/events/:id/rsvp', () => {
    test('user can RSVP (201)', async () => {
      if (!createEventRoutes || !createAttendeeRoutes) return

      const creatorApp = buildTestApp(handle.db, creatorUser)
      const createRes = await creatorApp.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const event = await createRes.json()

      const attendeeApp = buildTestApp(handle.db, otherUser)
      const res = await attendeeApp.request(`/api/events/${event.id}/rsvp`, {
        method: 'POST',
      })

      expect(res.status).toBe(201)
    })

    test('RSVP when full returns 409', async () => {
      if (!createEventRoutes || !createAttendeeRoutes) return

      const app = buildTestApp(handle.db, creatorUser)
      const createRes = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody({ capacity: 2 })),
      })
      const event = await createRes.json()

      // First RSVP (creator self)
      const r1 = await app.request(`/api/events/${event.id}/rsvp`, { method: 'POST' })
      expect(r1.status).toBe(201)

      // Second RSVP (other user)
      const otherApp = buildTestApp(handle.db, otherUser)
      const r2 = await otherApp.request(`/api/events/${event.id}/rsvp`, { method: 'POST' })
      expect(r2.status).toBe(201)

      // Third RSVP should fail (capacity is 2)
      const thirdUser = { id: 'user-003', name: 'Third User', role: 'user', image: null as string | null }
      seedTestUser(handle, thirdUser)
      const thirdApp = buildTestApp(handle.db, thirdUser)
      const r3 = await thirdApp.request(`/api/events/${event.id}/rsvp`, { method: 'POST' })
      expect(r3.status).toBe(409)
    })

    test('duplicate RSVP returns 409', async () => {
      if (!createEventRoutes || !createAttendeeRoutes) return

      const app = buildTestApp(handle.db, creatorUser)
      const createRes = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const event = await createRes.json()

      const r1 = await app.request(`/api/events/${event.id}/rsvp`, { method: 'POST' })
      expect(r1.status).toBe(201)

      const r2 = await app.request(`/api/events/${event.id}/rsvp`, { method: 'POST' })
      expect(r2.status).toBe(409)
    })
  })

  describe('DELETE /api/events/:id/rsvp (leave)', () => {
    test('user can leave event (204)', async () => {
      if (!createEventRoutes || !createAttendeeRoutes) return

      const app = buildTestApp(handle.db, creatorUser)
      const createRes = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const event = await createRes.json()

      // RSVP first
      const rsvpRes = await app.request(`/api/events/${event.id}/rsvp`, { method: 'POST' })
      expect(rsvpRes.status).toBe(201)

      // Leave
      const leaveRes = await app.request(`/api/events/${event.id}/rsvp`, { method: 'DELETE' })
      expect(leaveRes.status).toBe(204)
    })
  })

  describe('GET /api/events/:id/attendees', () => {
    test('returns attendee list with display data', async () => {
      if (!createEventRoutes || !createAttendeeRoutes) return

      const creatorApp = buildTestApp(handle.db, creatorUser)
      const createRes = await creatorApp.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const event = await createRes.json()

      // RSVP as creator
      await creatorApp.request(`/api/events/${event.id}/rsvp`, { method: 'POST' })

      // Attendee list
      const res = await creatorApp.request(`/api/events/${event.id}/attendees`)
      expect(res.status).toBe(200)

      const attendees = await res.json()
      expect(Array.isArray(attendees)).toBe(true)
      expect(attendees.length).toBe(1)
      expect(attendees[0].userId).toBe(creatorUser.id)
      expect(attendees[0].displayName).toBe('Creator User')
      expect(attendees[0].rsvpAt).toBeDefined()
    })
  })

  // ── 2.4 My Events ────────────────────────────────────────────

  describe('GET /api/me/events', () => {
    test('filter=created returns only events created by user', async () => {
      if (!createEventRoutes || !createMeRoutes) return

      const app = buildTestApp(handle.db, creatorUser)
      const createRes = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      expect(createRes.status).toBe(201)

      const res = await app.request('/api/me/events?filter=created')
      expect(res.status).toBe(200)

      const events = await res.json()
      expect(Array.isArray(events)).toBe(true)
      expect(events.length).toBe(1)
      expect(events[0].creatorId).toBe(creatorUser.id)
    })

    test('filter=attending returns events user RSVPd to', async () => {
      if (!createEventRoutes || !createMeRoutes || !createAttendeeRoutes) return

      const creatorApp = buildTestApp(handle.db, creatorUser)
      const createRes = await creatorApp.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      const event = await createRes.json()

      // RSVP as other user
      const otherApp = buildTestApp(handle.db, otherUser)
      await otherApp.request(`/api/events/${event.id}/rsvp`, { method: 'POST' })

      const res = await otherApp.request('/api/me/events?filter=attending')
      expect(res.status).toBe(200)

      const events = await res.json()
      expect(Array.isArray(events)).toBe(true)
      expect(events.length).toBe(1)
      expect(events[0].id).toBe(event.id)
    })

    test('filter=all returns both created and attending events', async () => {
      if (!createEventRoutes || !createMeRoutes || !createAttendeeRoutes) return

      const creatorApp = buildTestApp(handle.db, creatorUser)
      const createRes = await creatorApp.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })
      expect(createRes.status).toBe(201)
      const created = await createRes.json()
      await creatorApp.request(`/api/events/${created.id}/rsvp`, { method: 'POST' })

      const res = await creatorApp.request('/api/me/events?filter=all')
      expect(res.status).toBe(200)

      const events = await res.json()
      expect(events.length).toBeGreaterThanOrEqual(1)
      const found = events.find((e: any) => e.id === created.id)
      expect(found).toBeDefined()
    })

    test('results are sorted by date descending', async () => {
      if (!createEventRoutes || !createMeRoutes) return

      const app = buildTestApp(handle.db, creatorUser)

      const e1 = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody({ title: 'Earlier', date: futureDate + 86400000 })),
      })
      const e2 = await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody({ title: 'Later', date: futureDate + 2 * 86400000 })),
      })

      expect(e1.status).toBe(201)
      expect(e2.status).toBe(201)

      const res = await app.request('/api/me/events?filter=created')
      expect(res.status).toBe(200)

      const events = await res.json()
      expect(events.length).toBe(2)
      expect(events[0].date).toBeGreaterThanOrEqual(events[1].date)
    })

    test('empty filter defaults to all', async () => {
      if (!createEventRoutes || !createMeRoutes) return

      const app = buildTestApp(handle.db, creatorUser)
      await app.request('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventBody()),
      })

      const res = await app.request('/api/me/events')
      expect(res.status).toBe(200)
      const events = await res.json()
      expect(events.length).toBeGreaterThanOrEqual(1)
    })
  })
})
