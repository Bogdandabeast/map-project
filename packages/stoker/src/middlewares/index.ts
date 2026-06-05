import type { Context } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'

export function notFound(c: Context) {
  return c.json(
    { message: `Not Found - ${c.req.path}` },
    404,
  )
}

export function onError(err: Error, c: Context) {
  const status = (err as any)?.status || 500
  return c.json(
    { message: err.message || 'Internal Server Error' },
    status as StatusCode,
  )
}

export function serveEmojiFavicon(emoji: string) {
  return async (c: Context, next: () => Promise<void>) => {
    if (c.req.path === '/favicon.ico') {
      return c.body(emoji, 200, { 'Content-Type': 'image/x-icon' })
    }
    return next()
  }
}
