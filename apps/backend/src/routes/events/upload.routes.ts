/**
 * Event image upload URL — R2 pre-signed URL (creator only).
 *
 * POST /api/events/:id/upload-url
 *   Body: { contentType: string }
 *   Response: { uploadUrl: string, key: string }
 */
import type { AuthFactory } from '../../types/auth'
import type { AnyDrizzleDb } from '../../types/database'
import type { AppEnv } from '../../types/hono'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { createAuth } from '../../db/lib/auth'
import { createDb } from '../../db/lib/database'
import { events } from '../../db/schema/events-core'
import { requireRoleMiddleware } from '../../middlewares/requireRole'
import { createPresignedUrl } from '../../storage/r2'

export interface UploadRoutesOptions {
  authFactory?: AuthFactory
  getDb?: (env: AppEnv['Bindings']) => AnyDrizzleDb
}

export function createUploadRoutes(options: UploadRoutesOptions = {}) {
  const authFactory = options.authFactory ?? createAuth
  const getDb = options.getDb ?? (env => createDb(env.DB))

  const routes = new Hono<AppEnv>()

  const auth = requireRoleMiddleware(authFactory, [
    'user',
    'premium',
    'moderator',
    'admin',
  ])

  // ── POST /:id/upload-url ───────────────────────────────────────

  routes.post('/:id/upload-url', auth, async (c) => {
    const currentUser = c.var.user!
    const eventId = c.req.param('id')

    const db = getDb(c.env)

    const found = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1)

    if (!found[0]) {
      return c.json({ error: 'Event not found' }, 404)
    }

    const event = found[0]

    // Authorization: creator only
    if (event.creatorId !== currentUser.id) {
      return c.json(
        { error: 'Only the event creator can upload an image' },
        403,
      )
    }

    // Read content type from body (optional, defaults to image/jpeg)
    let contentType = 'image/jpeg'
    try {
      const body = await c.req.json()
      if (body.contentType && typeof body.contentType === 'string') {
        contentType = body.contentType
      }
    }
    catch {
      // No body or invalid JSON — use default content type
    }

    // Validate content type against allowed list + derive extension
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/avif': 'avif',
    }
    const allowedTypes = Object.keys(extMap)
    if (!allowedTypes.includes(contentType)) {
      contentType = 'image/jpeg'
    }
    const ext = extMap[contentType]

    const key = `events/${eventId}/${Date.now()}.${ext}`

    // Build R2 upload env from bindings
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
  })

  return routes
}

export const uploadRoutes = createUploadRoutes()
