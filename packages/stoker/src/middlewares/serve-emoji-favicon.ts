import type { MiddlewareHandler } from 'hono'

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '"': return '&quot;'
      case '\'': return '&apos;'
      default: return c
    }
  })
}

function serveEmojiFavicon(emoji: string): MiddlewareHandler {
  const escapedEmoji = escapeXml(emoji)
  return async (c, next) => {
    if (c.req.path === '/favicon.ico') {
      c.res.headers.set('content-type', 'image/svg+xml')
      return c.body(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" x="-0.1em" font-size="90">${escapedEmoji}</text></svg>`)
    }
    return next()
  }
}

export default serveEmojiFavicon
