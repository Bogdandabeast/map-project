/**
 * Game Search route — GC-01 (Hybrid D1 + BGG)
 *
 * GET /api/games/search?q=&limit=
 *
 * Hybrid logic:
 * 1. Query D1 via gameRepository.searchByName(q, limit).
 * 2. If results found → return with source: 'd1'.
 * 3. If empty → call searchBoardGame(q) from BGG client.
 * 4. Auto-cache each BGG result via gameRepository.upsert(...).
 * 5. Re-query D1 by searchByName(q) to return cached results with source: 'bgg'.
 * 6. If BGG fails → return D1 partial matches with source: 'd1' and a note.
 *
 * Auth: requires authentication (user, premium, moderator, admin).
 * Max 20 results.
 */
import type { AuthFactory } from '../types/auth'
import type { AnyDrizzleDb } from '../types/database'
import type { AppEnv } from '../types/hono'
import { gameSearchSchema } from '@repo/validations/game'
import { Hono } from 'hono'
import { searchBoardGame as defaultSearchBgg } from '../lib/bgg-client'
import type { BggSearchResult } from '../lib/bgg-client'
import { createAuth } from '../db/lib/auth'
import { createDb } from '../db/lib/database'
import { createGameRepository } from '../repositories/game-repository'
import { requireRoleMiddleware } from '../middlewares/requireRole'

// ── Options ──────────────────────────────────────────────────────────

export interface GameSearchRoutesOptions {
  authFactory?: AuthFactory
  getDb?: (env: AppEnv['Bindings']) => AnyDrizzleDb
  /** BGG search function — injectable for testing. */
  searchBgg?: (query: string) => Promise<BggSearchResult[]>
}

// ── Helpers ──────────────────────────────────────────────────────────

function toSearchResult(g: Record<string, unknown>) {
  return {
    id: g.id as string,
    title: g.title as string,
    minPlayers: g.minPlayers as number | null,
    maxPlayers: g.maxPlayers as number | null,
    duration: g.duration as number | null,
    coverImage: g.coverImage as string | null,
    source: g.source as string,
    accessCount: (g.accessCount as number) ?? 0,
  }
}

// ── Factory ──────────────────────────────────────────────────────────

export function createGameSearchRoutes(options: GameSearchRoutesOptions = {}) {
  const authFactory = options.authFactory ?? createAuth
  const getDb = options.getDb ?? (env => createDb(env.DB))
  const searchBgg = options.searchBgg ?? defaultSearchBgg

  const routes = new Hono<AppEnv>()

  // Shared auth middleware
  const auth = requireRoleMiddleware(authFactory, [
    'user',
    'premium',
    'moderator',
    'admin',
  ])

  // ── GET /search — Hybrid game search ───────────────────────────

  routes.get('/search', auth, async (c) => {
    // Parse and validate query params
    const rawQuery = {
      q: c.req.query('q') ?? '',
      limit: c.req.query('limit')
        ? Number(c.req.query('limit'))
        : undefined,
    }

    const parsed = gameSearchSchema.safeParse(rawQuery)
    if (!parsed.success) {
      return c.json(
        { error: 'Invalid search query', details: parsed.error.flatten() },
        400,
      )
    }

    const { q, limit } = parsed.data
    const effectiveLimit = limit ?? 20
    const db = getDb(c.env)
    const repo = createGameRepository(db as any)

    // Step 1: Try D1 first
    const d1Results = await repo.searchByName(q, effectiveLimit)

    if (d1Results.length > 0) {
      return c.json({
        source: 'd1',
        results: d1Results.map(toSearchResult),
      })
    }

    // Step 2: D1 miss — try BGG
    try {
      const bggResults = await searchBgg(q)

      if (bggResults.length > 0) {
        // Step 3: Auto-cache each BGG result
        const upsertPromises = bggResults.map(r =>
          repo.upsert({
            bggId: r.bggId,
            title: r.name,
            description: null,
            imageUrl: null,
            coverImage: null,
            minPlayers: null,
            maxPlayers: null,
            duration: null,
            source: 'bgg',
          }),
        )
        await Promise.all(upsertPromises)

        // Step 4: Re-query D1 — now cached games match
        const cachedResults = await repo.searchByName(q, effectiveLimit)

        return c.json({
          source: 'bgg',
          results: cachedResults.map(toSearchResult),
        })
      }

      // BGG returned empty — no results anywhere
      return c.json({
        source: 'bgg',
        results: [],
      })
    } catch (_bggError) {
      // Step 5: BGG failure — return any partial D1 matches
      // (we already know d1Results was empty above, but return the grace note)
      return c.json({
        source: 'd1',
        results: d1Results.map(toSearchResult),
        note: 'Search is temporarily limited. BGG API unavailable.',
      })
    }
  })

  return routes
}

/**
 * Pre-configured game search routes using real auth factory, D1 binding,
 * and real BGG client.
 */
export const gameSearchRoutes = createGameSearchRoutes()
