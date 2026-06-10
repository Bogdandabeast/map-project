/**
 * Game Browse routes — GC-03
 *
 * GET /api/games/popular — by accessCount DESC, max 50
 * GET /api/games/recent  — by createdAt DESC, max 20
 */
import type { AuthFactory } from '../types/auth'
import type { AnyDrizzleDb } from '../types/database'
import type { AppEnv } from '../types/hono'
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

export interface GameBrowseRoutesOptions {
  authFactory?: AuthFactory
  getDb?: (env: AppEnv['Bindings']) => AnyDrizzleDb
}

// ── Factory ──────────────────────────────────────────────────────────

export function createGameBrowseRoutes(options: GameBrowseRoutesOptions = {}) {
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

  // ── GET /popular — Most accessed games ─────────────────────────

  routes.get('/popular', auth, async (c) => {
    const db = getDb(c.env)
    const repo = createGameRepository(db as any)

    const popular = await repo.getPopular(50)

    return c.json(popular.map(toGameResponse))
  })

  // ── GET /recent — Recently added games ─────────────────────────

  routes.get('/recent', auth, async (c) => {
    const db = getDb(c.env)
    const repo = createGameRepository(db as any)

    const recent = await repo.getRecent(20)

    return c.json(recent.map(toGameResponse))
  })

  return routes
}

/**
 * Pre-configured game browse routes using real auth factory and D1 binding.
 */
export const gameBrowseRoutes = createGameBrowseRoutes()
