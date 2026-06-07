import type { AuthFactory } from '../../src/db/lib/auth'
import type { UserRoutesOptions } from '../../src/routes/users'
import type { AppEnv } from '../../src/types/hono'
import type { AuthCtx } from '../auth-setup'
/**
 * Integration tests for user routes.
 *
 * Uses Better Auth testUtils + in-memory SQLite to verify every endpoint.
 */
import { beforeAll, describe, expect, it } from 'bun:test'
import { Hono } from 'hono'
import { game } from '../../src/db/schema/game'
import {
  createUserRoutes,

} from '../../src/routes/users'
import { createTestAuth } from '../auth-setup'

let ctx: AuthCtx
const authFactory: AuthFactory = () =>
  ctx.auth as unknown as ReturnType<typeof import('../../src/db/lib/auth').createAuth>

/** Seed a game record so user_games FK constraints pass. */
async function seedGame(id: string, title: string) {
  await ctx.db.insert(game).values({ id, title }).onConflictDoNothing()
}

/** Build a test app with user routes wired in using test DB. */
function createTestApp() {
  const app = new Hono<AppEnv>()
  const getDb = () => ctx.db
  const routes = createUserRoutes({ authFactory, getDb } as UserRoutesOptions)
  app.route('/api/users', routes)
  return app
}

/** Create an authenticated user helper */
async function authedUser(role: string) {
  const u = ctx.test.createUser({ role } as Record<string, unknown>)
  const saved = await ctx.test.saveUser(u as any)
  const { token } = await ctx.test.login({ userId: saved.id })
  return {
    user: saved,
    token,
    req(method: string, path: string, body?: unknown) {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      }
      if (body)
        headers['Content-Type'] = 'application/json'
      return new Request(`http://localhost${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })
    },
    get(path: string) {
      return new Request(`http://localhost${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    },
  }
}

function unauthReq(method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = {}
  if (body)
    headers['Content-Type'] = 'application/json'
  return new Request(`http://localhost${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
}

// ── Boot ───────────────────────────────────────────────────────

beforeAll(async () => {
  ctx = await createTestAuth()
})

// ══════════════════════════════════════════════════════════════
// Avatar upload URL
// ══════════════════════════════════════════════════════════════

describe('GET /api/users/me/avatar/upload-url', () => {
  it('returns 401 without authentication', async () => {
    const app = createTestApp()
    const res = await app.fetch(
      unauthReq('GET', '/api/users/me/avatar/upload-url'),
    )
    expect(res.status).toBe(401)
  })

  it('returns uploadUrl and key with authentication', async () => {
    const app = createTestApp()
    const { get } = await authedUser('registered')
    const res = await app.fetch(get('/api/users/me/avatar/upload-url'))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { uploadUrl?: string, key?: string }
    expect(body.uploadUrl).toBeDefined()
    expect(typeof body.uploadUrl).toBe('string')
    expect(body.key).toBeDefined()
    expect(typeof body.key).toBe('string')
    expect(body.key!).toInclude('avatars/')
  })
})

// ══════════════════════════════════════════════════════════════
// PATCH /api/users/me/avatar
// ══════════════════════════════════════════════════════════════

describe('PATCH /api/users/me/avatar', () => {
  it('returns 401 without authentication', async () => {
    const app = createTestApp()
    const res = await app.fetch(
      unauthReq('PATCH', '/api/users/me/avatar', { key: 'avatars/test.jpg' }),
    )
    expect(res.status).toBe(401)
  })

  it('updates user image and returns the new URL', async () => {
    const app = createTestApp()
    const { req } = await authedUser('registered')
    const res = await app.fetch(
      req('PATCH', '/api/users/me/avatar', {
        key: 'avatars/u1/photo.jpg',
      }),
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { image?: string }
    expect(body.image).toBeDefined()
    expect(body.image).toInclude('avatars/u1/photo.jpg')
  })
})

// ══════════════════════════════════════════════════════════════
// POST /api/users/me/games
// ══════════════════════════════════════════════════════════════

describe('POST /api/users/me/games', () => {
  it('returns 401 without authentication', async () => {
    const app = createTestApp()
    const res = await app.fetch(
      unauthReq('POST', '/api/users/me/games', {
        gameId: 'game-1',
        skillLevel: 'intermediate',
      }),
    )
    expect(res.status).toBe(401)
  })

  it('returns 201 for a new game link', async () => {
    const app = createTestApp()
    await seedGame('game-1', 'Test Game')
    const { req } = await authedUser('registered')
    const res = await app.fetch(
      req('POST', '/api/users/me/games', {
        gameId: 'game-1',
        skillLevel: 'intermediate',
      }),
    )
    expect(res.status).toBe(201)
    const body = (await res.json()) as { gameId?: string, skillLevel?: string }
    expect(body.gameId).toBe('game-1')
    expect(body.skillLevel).toBe('intermediate')
  })

  it('returns 409 for duplicate game link', async () => {
    const app = createTestApp()
    await seedGame('game-1', 'Test Game')
    const { req } = await authedUser('registered')
    // First insert
    await app.fetch(
      req('POST', '/api/users/me/games', {
        gameId: 'game-1',
        skillLevel: 'beginner',
      }),
    )
    // Duplicate
    const res = await app.fetch(
      req('POST', '/api/users/me/games', {
        gameId: 'game-1',
        skillLevel: 'advanced',
      }),
    )
    expect(res.status).toBe(409)
    const body = (await res.json()) as { error?: string }
    expect(body.error).toBe('Game already linked')
  })
})

// ══════════════════════════════════════════════════════════════
// DELETE /api/users/me/games/:gameId
// ══════════════════════════════════════════════════════════════

describe('DELETE /api/users/me/games/:gameId', () => {
  it('returns 401 without authentication', async () => {
    const app = createTestApp()
    const res = await app.fetch(
      unauthReq('DELETE', '/api/users/me/games/some-game'),
    )
    expect(res.status).toBe(401)
  })

  it('returns 204 after deleting a linked game', async () => {
    const app = createTestApp()
    await seedGame('game-to-delete', 'Game To Delete')
    const helper = await authedUser('registered')
    // Add a game first
    await app.fetch(
      helper.req('POST', '/api/users/me/games', {
        gameId: 'game-to-delete',
        skillLevel: 'beginner',
      }),
    )
    const res = await app.fetch(
      helper.req('DELETE', '/api/users/me/games/game-to-delete'),
    )
    expect(res.status).toBe(204)
  })

  it('returns 404 for a non-existent game', async () => {
    const app = createTestApp()
    const { req } = await authedUser('registered')
    const res = await app.fetch(
      req('DELETE', '/api/users/me/games/non-existent-game'),
    )
    expect(res.status).toBe(404)
  })
})

// ══════════════════════════════════════════════════════════════
// GET /api/users/:id (public profile)
// ══════════════════════════════════════════════════════════════

describe('GET /api/users/:id (public profile)', () => {
  it('returns public profile fields for an existing user', async () => {
    const app = createTestApp()
    const helper = await authedUser('premium')

    const res = await app.fetch(
      unauthReq('GET', `/api/users/${helper.user.id}`),
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as Record<string, unknown>
    expect(body.id).toBe(helper.user.id)
    expect(body.name).toBeDefined()
    expect(body.role).toBe('premium')
    // Public profile must NOT expose email
    expect(body.email).toBeUndefined()
    // Should include game count
    expect(typeof body.gameCount).toBe('number')
  })

  it('returns 404 for a non-existent user', async () => {
    const app = createTestApp()
    const res = await app.fetch(
      unauthReq('GET', '/api/users/non-existent-id'),
    )
    expect(res.status).toBe(404)
  })
})
