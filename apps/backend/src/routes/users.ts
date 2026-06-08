import type {
  AvatarKeyBody,
  LinkGameBody,
  UserRoutesOptions,
} from '../types'
import type { AppEnv } from '../types/hono'
import { and, count, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { createAuth } from '../db/lib/auth'
import { createDb } from '../db/lib/database'
import { user } from '../db/schema/auth'
import { userGames } from '../db/schema/user-games'
import { optionalAuthMiddleware } from '../middlewares/optionalAuth'
import { requireRoleMiddleware } from '../middlewares/requireRole'
import { createPresignedUrl, R2_PUBLIC_BASE_URL } from '../storage/r2'

export function createUserRoutes(options: UserRoutesOptions = {}) {
  const authFactory = options.authFactory ?? createAuth
  const getDb = options.getDb ?? (env => createDb(env.DB))

  const routes = new Hono<AppEnv>()

  // ── Avatar upload URL ──────────────────────────────────────

  routes.get(
    '/me/avatar/upload-url',
    requireRoleMiddleware(authFactory, [
      'user',
      'premium',
      'admin',
    ]),
    async (c) => {
      const currentUser = c.var.user!
      const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']
      const rawExt = (c.req.query('ext') || 'jpg').toLowerCase().replace(/^\./, '')
      if (!ALLOWED_EXTS.includes(rawExt)) {
        return c.json({ error: `Invalid extension '${rawExt}'. Allowed: ${ALLOWED_EXTS.join(', ')}` }, 400)
      }
      const key = `avatars/${currentUser.id}/${Date.now()}.${rawExt}`

      // In tests c.env may be undefined; guard with a fallback
      const rawEnv = c.env as Record<string, unknown> | undefined

      const url = await createPresignedUrl(
        {
          R2: rawEnv?.R2 as R2Bucket | undefined,
          s3AccessKeyId: rawEnv?.R2_S3_ACCESS_KEY_ID as string | undefined,
          s3SecretAccessKey: rawEnv?.R2_S3_SECRET_ACCESS_KEY as string | undefined,
          s3BucketName: rawEnv?.R2_S3_BUCKET_NAME as string | undefined,
          s3AccountId: rawEnv?.R2_ACCOUNT_ID as string | undefined,
        },
        key,
        3600,
      )
      return c.json({ uploadUrl: url, key })
    },
  )

  // ── Update avatar ──────────────────────────────────────────

  routes.patch(
    '/me/avatar',
    requireRoleMiddleware(authFactory, [
      'user',
      'premium',
      'admin',
    ]),
    async (c) => {
      const currentUser = c.var.user!
      const body = (await c.req.json()) as AvatarKeyBody

      if (!body.key) {
        return c.json({ error: 'key is required' }, 400)
      }

      const db = getDb(c.env)
      const imageUrl = `${R2_PUBLIC_BASE_URL}/${body.key}`

      await db
        .update(user)
        .set({ image: imageUrl })
        .where(eq(user.id, currentUser.id))

      return c.json({ image: imageUrl })
    },
  )

  // ── Add game to collection ─────────────────────────────────

  routes.post(
    '/me/games',
    requireRoleMiddleware(authFactory, [
      'user',
      'premium',
      'admin',
    ]),
    async (c) => {
      const currentUser = c.var.user!
      const body = (await c.req.json()) as LinkGameBody

      if (!body.gameId) {
        return c.json({ error: 'gameId is required' }, 400)
      }

      const db = getDb(c.env)

      // Check for duplicate
      const existing = await db
        .select()
        .from(userGames)
        .where(
          and(
            eq(userGames.userId, currentUser.id),
            eq(userGames.gameId, body.gameId),
          ),
        )
        .limit(1)

      if (existing.length > 0) {
        return c.json({ error: 'Game already linked' }, 409)
      }

      await db.insert(userGames).values({
        userId: currentUser.id,
        gameId: body.gameId,
        skillLevel: body.skillLevel ?? null,
      })

      return c.json(
        {
          userId: currentUser.id,
          gameId: body.gameId,
          skillLevel: body.skillLevel ?? null,
        },
        201,
      )
    },
  )

  // ── Remove game from collection ────────────────────────────

  routes.delete(
    '/me/games/:gameId',
    requireRoleMiddleware(authFactory, [
      'user',
      'premium',
      'admin',
    ]),
    async (c) => {
      const currentUser = c.var.user!
      const gameId = c.req.param('gameId')
      const db = getDb(c.env)

      const result = await db
        .delete(userGames)
        .where(
          and(
            eq(userGames.userId, currentUser.id),
            eq(userGames.gameId, gameId),
          ),
        )

      // D1 returns meta.rows_written; libsql returns changes via .run()
      const rowsAffected
        = (result as { meta?: { rows_written?: number } })?.meta?.rows_written
          ?? (result as { rowsAffected?: number })?.rowsAffected
          ?? 0

      if (rowsAffected === 0) {
        return c.json({ error: 'Game not found' }, 404)
      }

      return c.body(null, 204)
    },
  )

  // ── Public profile ─────────────────────────────────────────

  routes.get('/:id', optionalAuthMiddleware(authFactory), async (c) => {
    const targetId = c.req.param('id')
    const db = getDb(c.env)

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        role: user.role,
      })
      .from(user)
      .where(eq(user.id, targetId))
      .limit(1)

    if (users.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }

    const gameCountResult = await db
      .select({ count: count() })
      .from(userGames)
      .where(eq(userGames.userId, targetId))

    const gameCount = gameCountResult[0]?.count ?? 0

    return c.json({
      id: users[0].id,
      name: users[0].name,
      image: users[0].image,
      role: users[0].role,
      gameCount,
    })
  })

  return routes
}

/**
 * Pre-configured user routes using the real `createAuth` factory
 * and the D1 database binding.
 */
export const usersRoutes = createUserRoutes()
