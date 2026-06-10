/**
 * Game Detail route — GC-02
 *
 * GET /api/games/:id — fetch game by UUID, increment access count,
 * return full game data or 404. Handles missing optional fields
 * with null placeholders.
 */
import type { AuthFactory } from '../types/auth'
import type { AnyDrizzleDb } from '../types/database'
import type { AppEnv } from '../types/hono'
import { gameDetailParamsSchema } from '@repo/validations/game'
import { Hono } from 'hono'
import { createAuth } from '../db/lib/auth'
import { createDb } from '../db/lib/database'
import { createGameRepository } from '../repositories/game-repository'
import { requireRoleMiddleware } from '../middlewares/requireRole'

// ── Helpers ──────────────────────────────────────────────────────────

function toGameResponse(g: Record<string, unknown>) {
  return {
    id: g.id,
    title: g.title,
    description: g.description ?? null,
    imageUrl: g.imageUrl ?? null,
    coverImage: g.coverImage ?? null,
    minPlayers: g.minPlayers,
    maxPlayers: g.maxPlayers,
    duration: g.duration,
    bggId: g.bggId,
    accessCount: g.accessCount,
    source: g.source,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  }
}

// ── Options ──────────────────────────────────────────────────────────

export interface GameDetailRoutesOptions {
  authFactory?: AuthFactory
  getDb?: (env: AppEnv['Bindings']) => AnyDrizzleDb
}

// ── Factory ──────────────────────────────────────────────────────────

export function createGameDetailRoutes(options: GameDetailRoutesOptions = {}) {
  const authFactory = options.authFactory ?? createAuth
  const getDb = options.getDb ?? (env => createDb(env.DB))

  const routes = new Hono<AppEnv>()

  // Shared auth middleware
  const auth = requireRoleMiddleware(authFactory, [
    'user',
    'premium',
    'moderator',
    'admin',
  ])

  // ── GET /:id — Fetch game detail ──────────────────────────────

  routes.get('/:id', auth, async (c) => {
    const rawId = c.req.param('id')

    // Validate param
    const parsed = gameDetailParamsSchema.safeParse({ id: rawId })
    if (!parsed.success) {
      return c.json(
        { error: 'Invalid game ID', details: parsed.error.flatten() },
        400,
      )
    }

    const db = getDb(c.env)
    const repo = createGameRepository(db as any)

    const game = await repo.findById(parsed.data.id)
    if (!game) {
      return c.json({ error: 'Game not found' }, 404)
    }

    // Increment access count (fire-and-forget)
    await repo.incrementAccess(parsed.data.id)

    // Return full game with placeholder handling for missing optional fields
    return c.json(toGameResponse(game))
  })

  return routes
}

/**
 * Pre-configured game detail routes using real auth factory and D1 binding.
 */
export const gameDetailRoutes = createGameDetailRoutes()
