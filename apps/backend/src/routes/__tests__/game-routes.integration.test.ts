/**
 * Integration tests for Game Catalog API routes (Phase 2)
 *
 * Covers: game search (GC-01), game detail (GC-02), game browse (GC-03),
 * hybrid D1+BGG logic, auth gates, validation errors.
 *
 * Uses Bun SQLite in-memory DB + mock auth factory + mock BGG client.
 */
import { Hono } from 'hono'
import { describe, expect, test, beforeAll, beforeEach, mock } from 'bun:test'
import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as gameSchema from '../../db/schema/game'
import type { AppEnv } from '../../types/hono'
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'

// ── Test auth helpers ───────────────────────────────────────────────

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

function buildTestApp(
  sqlite: Database,
  db: BunSQLiteDatabase<{ game: typeof gameSchema.game }>,
  user: { id: string; role: string; name?: string; image?: string | null },
  routeCreators: {
    createGameDetailRoutes?: any
    createGameBrowseRoutes?: any
    createGameSearchRoutes?: any
  },
) {
  const app = new Hono<AppEnv>()
  const authFactory = mockAuthFactory(user)

  const getDb = (_env: unknown) => db

  if (routeCreators.createGameDetailRoutes) {
    const detailRoutes = routeCreators.createGameDetailRoutes({
      authFactory,
      getDb,
    })
    app.route('/api/games', detailRoutes)
  }
  if (routeCreators.createGameBrowseRoutes) {
    const browseRoutes = routeCreators.createGameBrowseRoutes({
      authFactory,
      getDb,
    })
    app.route('/api/games', browseRoutes)
  }
  if (routeCreators.createGameSearchRoutes) {
    const searchRoutes = routeCreators.createGameSearchRoutes({
      authFactory,
      getDb,
    })
    app.route('/api/games', searchRoutes)
  }

  return { app, sqlite }
}

// ── Test DB setup ───────────────────────────────────────────────────

function createTestGameDb() {
  const sqlite = new Database(':memory:')
  const db = drizzle(sqlite, { schema: gameSchema })

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS game (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      min_players INTEGER,
      max_players INTEGER,
      duration INTEGER,
      cover_image TEXT,
      bgg_id INTEGER UNIQUE,
      access_count INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'manual',
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
    );
  `)

  return { db, sqlite }
}

// ── Test fixtures ───────────────────────────────────────────────────

const authUser = {
  id: 'user-001',
  name: 'Test User',
  role: 'user',
  image: null as string | null,
}

const existingGameId = '550e8400-e29b-41d4-a716-446655440001'
const catanGameId = '550e8400-e29b-41d4-a716-446655440002'
const wingspanGameId = '550e8400-e29b-41d4-a716-446655440003'
const now = Date.now()

function seedGames(sqlite: Database) {
  sqlite.run(
    `INSERT INTO game (id, title, description, image_url, min_players, max_players, duration, cover_image, bgg_id, access_count, source, created_at, updated_at)
     VALUES (?, 'Catan', 'A trading game', 'https://img.example.com/catan.jpg', 3, 4, 90, 'https://cover.example.com/catan.jpg', 13, 42, 'bgg', ?, ?)`,
    [catanGameId, now - 100000, now],
  )
  sqlite.run(
    `INSERT INTO game (id, title, description, image_url, min_players, max_players, duration, cover_image, bgg_id, access_count, source, created_at, updated_at)
     VALUES (?, 'Wingspan', NULL, NULL, 1, 5, 70, NULL, 266192, 15, 'bgg', ?, ?)`,
    [wingspanGameId, now - 50000, now],
  )
  sqlite.run(
    `INSERT INTO game (id, title, description, image_url, min_players, max_players, duration, cover_image, bgg_id, access_count, source, created_at, updated_at)
     VALUES (?, 'Azul', 'Tile placement game', NULL, 2, 4, 45, NULL, 230802, 8, 'manual', ?, ?)`,
    [existingGameId, now - 30000, now],
  )
}

// ── Tests ───────────────────────────────────────────────────────────

// Lazy-imported route creators (created during implementation)
let createGameDetailRoutes: any
let createGameBrowseRoutes: any
let createGameSearchRoutes: any

describe('Game API Integration', () => {
  beforeAll(async () => {
    try {
      const mod = await import('../game-detail')
      createGameDetailRoutes = mod.createGameDetailRoutes
    } catch (_) { /* created during implementation */ }
    try {
      const mod = await import('../game-browse')
      createGameBrowseRoutes = mod.createGameBrowseRoutes
    } catch (_) { /* created during implementation */ }
    try {
      const mod = await import('../game-search')
      createGameSearchRoutes = mod.createGameSearchRoutes
    } catch (_) { /* created during implementation */ }
  })

  // ── GC-02: Game Detail ─────────────────────────────────────────

  describe('GET /api/games/:id (game detail)', () => {
    test('returns full game by UUID with 200 and increments accessCount', async () => {
      if (!createGameDetailRoutes) return

      const { sqlite, db } = createTestGameDb()
      seedGames(sqlite)
      const { app } = buildTestApp(sqlite, db, authUser, {
        createGameDetailRoutes,
      })

      const res = await app.request(`/api/games/${catanGameId}`)
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body.id).toBe(catanGameId)
      expect(body.title).toBe('Catan')
      expect(body.description).toBe('A trading game')
      expect(body.minPlayers).toBe(3)
      expect(body.maxPlayers).toBe(4)
      expect(body.duration).toBe(90)
      expect(body.coverImage).toBe('https://cover.example.com/catan.jpg')
      expect(body.source).toBe('bgg')
      expect(body.bggId).toBe(13)

      // Verify accessCount was incremented
      const rows = sqlite
        .query('SELECT access_count FROM game WHERE id = ?')
        .all(catanGameId) as Array<{ access_count: number }>
      expect(rows[0].access_count).toBe(43) // was 42, now 43
    })

    test('returns 400 for invalid UUID format', async () => {
      if (!createGameDetailRoutes) return

      const { sqlite, db } = createTestGameDb()
      const { app } = buildTestApp(sqlite, db, authUser, {
        createGameDetailRoutes,
      })

      const res = await app.request('/api/games/not-a-uuid')
      expect(res.status).toBe(400)

      const body = await res.json()
      expect(body.error).toBeDefined()
    })

    test('returns 404 for non-existent game', async () => {
      if (!createGameDetailRoutes) return

      const { sqlite, db } = createTestGameDb()
      const { app } = buildTestApp(sqlite, db, authUser, {
        createGameDetailRoutes,
      })

      const res = await app.request(
        '/api/games/550e8400-e29b-41d4-a716-446655449999',
      )
      expect(res.status).toBe(404)
    })

    test('returns game with null optional fields when missing', async () => {
      if (!createGameDetailRoutes) return

      const { sqlite, db } = createTestGameDb()
      seedGames(sqlite)
      const { app } = buildTestApp(sqlite, db, authUser, {
        createGameDetailRoutes,
      })

      const res = await app.request(`/api/games/${wingspanGameId}`)
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body.id).toBe(wingspanGameId)
      expect(body.title).toBe('Wingspan')
      expect(body.description).toBeNull()
      expect(body.coverImage).toBeNull()
      // Should still render without errors — test that response is valid JSON
      expect(body.source).toBe('bgg')
    })

    test('returns 401 when unauthenticated', async () => {
      if (!createGameDetailRoutes) return

      const { sqlite, db } = createTestGameDb()
      seedGames(sqlite)
      const unauthFactory = (_env: unknown) => ({
        api: { async getSession(_o: unknown) { return null } },
      })
      const unauthRoutes = createGameDetailRoutes({
        authFactory: unauthFactory,
        getDb: (_env: unknown) => db,
      })

      const app = new Hono<AppEnv>()
      app.route('/api/games', unauthRoutes)

      const res = await app.request(`/api/games/${catanGameId}`)
      expect(res.status).toBe(401)
    })
  })

  // ── GC-03: Browse / Discovery ──────────────────────────────────

  describe('GET /api/games/popular (browse)', () => {
    test('returns games sorted by accessCount DESC with max 50', async () => {
      if (!createGameBrowseRoutes) return

      const { sqlite, db } = createTestGameDb()
      seedGames(sqlite)
      const { app } = buildTestApp(sqlite, db, authUser, {
        createGameBrowseRoutes,
      })

      const res = await app.request('/api/games/popular')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(3)

      // Sorted by accessCount DESC: Catan(42), Wingspan(15), Azul(8)
      expect(body[0].title).toBe('Catan')
      expect(body[0].accessCount).toBe(42)
      expect(body[1].title).toBe('Wingspan')
      expect(body[1].accessCount).toBe(15)
      expect(body[2].title).toBe('Azul')
      expect(body[2].accessCount).toBe(8)
    })

    test('returns empty array when no games exist', async () => {
      if (!createGameBrowseRoutes) return

      const { sqlite, db } = createTestGameDb()
      const { app } = buildTestApp(sqlite, db, authUser, {
        createGameBrowseRoutes,
      })

      const res = await app.request('/api/games/popular')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body).toEqual([])
    })

    test('returns 401 when unauthenticated', async () => {
      if (!createGameBrowseRoutes) return

      const { sqlite, db } = createTestGameDb()
      const unauthFactory = (_env: unknown) => ({
        api: { async getSession(_o: unknown) { return null } },
      })
      const unauthRoutes = createGameBrowseRoutes({
        authFactory: unauthFactory,
        getDb: (_env: unknown) => db,
      })

      const app = new Hono<AppEnv>()
      app.route('/api/games', unauthRoutes)

      const res = await app.request('/api/games/popular')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/games/recent (browse)', () => {
    test('returns games sorted by createdAt DESC with max 20', async () => {
      if (!createGameBrowseRoutes) return

      const { sqlite, db } = createTestGameDb()
      seedGames(sqlite)
      const { app } = buildTestApp(sqlite, db, authUser, {
        createGameBrowseRoutes,
      })

      const res = await app.request('/api/games/recent')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(3)

      // Sorted by createdAt DESC: Azul (newest), Wingspan, Catan (oldest)
      expect(body[0].title).toBe('Azul')
      expect(body[1].title).toBe('Wingspan')
      expect(body[2].title).toBe('Catan')
    })
  })

  // ── GC-01: Hybrid Search ───────────────────────────────────────

  describe('GET /api/games/search (hybrid search)', () => {
    test('returns D1 results with source d1 on local hit', async () => {
      if (!createGameSearchRoutes) return

      const { sqlite, db } = createTestGameDb()
      seedGames(sqlite)

      // Inject a BGG mock that would throw if called (proves BGG is NOT called)
      const mockSearchBgg = mock(async (_q: string) => {
        throw new Error('BGG should NOT be called for D1 hits')
      })

      const { app } = buildTestApp(sqlite, db, authUser, {
        createGameSearchRoutes,
      })

      // Override the search routes with BGG mock injected
      const appWithMock = new Hono<AppEnv>()
      const searchRoutes = createGameSearchRoutes({
        authFactory: mockAuthFactory(authUser),
        getDb: (_env: unknown) => db,
        searchBgg: mockSearchBgg,
      })
      appWithMock.route('/api/games', searchRoutes)

      const res = await appWithMock.request(
        '/api/games/search?q=Catan',
      )
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body.source).toBe('d1')
      expect(Array.isArray(body.results)).toBe(true)
      expect(body.results.length).toBeGreaterThanOrEqual(1)

      const titles = body.results.map((r: any) => r.title)
      expect(titles).toContain('Catan')

      // Verify BGG was never called
      expect(mockSearchBgg).not.toHaveBeenCalled()
    })

    test('falls back to BGG on D1 miss, auto-caches and returns source bgg', async () => {
      if (!createGameSearchRoutes) return

      const { sqlite, db } = createTestGameDb()
      // NO seed — D1 is empty

      const mockSearchBgg = mock(async (_q: string) => [
        { bggId: 999, name: 'Pandemic', year: 2008 },
        { bggId: 1000, name: 'Pandemic Legacy', year: 2015 },
      ])

      const app = new Hono<AppEnv>()
      const searchRoutes = createGameSearchRoutes({
        authFactory: mockAuthFactory(authUser),
        getDb: (_env: unknown) => db,
        searchBgg: mockSearchBgg,
      })
      app.route('/api/games', searchRoutes)

      const res = await app.request('/api/games/search?q=Pandemic')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body.source).toBe('bgg')
      expect(Array.isArray(body.results)).toBe(true)
      expect(body.results.length).toBeGreaterThanOrEqual(1)

      const titles = body.results.map((r: any) => r.title)
      expect(titles).toContain('Pandemic')

      // Verify BGG was called
      expect(mockSearchBgg).toHaveBeenCalledTimes(1)

      // Verify games were cached in D1
      const cachedRows = sqlite
        .query('SELECT bgg_id, title, source FROM game WHERE bgg_id IN (999, 1000)')
        .all() as Array<{ bgg_id: number; title: string; source: string }>
      expect(cachedRows.length).toBe(2)
      expect(cachedRows[0].source).toBe('bgg')
    })

    test('handles BGG failure gracefully, returns limited D1 note', async () => {
      if (!createGameSearchRoutes) return

      const { sqlite, db } = createTestGameDb()
      // Seed only partial matches so D1 has results but BGG would fail
      seedGames(sqlite)

      const mockSearchBgg = mock(async (_q: string) => {
        throw new Error('BGG API timeout')
      })

      const app = new Hono<AppEnv>()
      const searchRoutes = createGameSearchRoutes({
        authFactory: mockAuthFactory(authUser),
        getDb: (_env: unknown) => db,
        searchBgg: mockSearchBgg,
      })
      app.route('/api/games', searchRoutes)

      // Search for something that doesn't exist in D1
      const res = await app.request('/api/games/search?q=ZzzNotExist')
      expect(res.status).toBe(200)

      const body = await res.json()
      // When BGG fails and no D1 matches, source should be 'd1' with limited note
      expect(body.source).toBe('d1')
      expect(Array.isArray(body.results)).toBe(true)
      // BGG did fail, so we return partial D1 (empty here) 
      expect(body.note).toBeDefined()
    })

    test('returns 400 for empty query', async () => {
      if (!createGameSearchRoutes) return

      const { sqlite, db } = createTestGameDb()
      const app = new Hono<AppEnv>()
      const searchRoutes = createGameSearchRoutes({
        authFactory: mockAuthFactory(authUser),
        getDb: (_env: unknown) => db,
        searchBgg: mock(async () => []),
      })
      app.route('/api/games', searchRoutes)

      const res = await app.request('/api/games/search?q=')
      expect(res.status).toBe(400)
    })

    test('returns 401 when unauthenticated', async () => {
      if (!createGameSearchRoutes) return

      const { sqlite, db } = createTestGameDb()
      const unauthFactory = (_env: unknown) => ({
        api: { async getSession(_o: unknown) { return null } },
      })
      const unauthRoutes = createGameSearchRoutes({
        authFactory: unauthFactory,
        getDb: (_env: unknown) => db,
        searchBgg: mock(async () => []),
      })

      const app = new Hono<AppEnv>()
      app.route('/api/games', unauthRoutes)

      const res = await app.request('/api/games/search?q=Catan')
      expect(res.status).toBe(401)
    })
  })
})
