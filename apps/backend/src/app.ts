import process from 'node:process'
import { OpenAPIHono } from '@hono/zod-openapi'
import { notFound, onError } from '@repo/stoker/middlewares'
import { defaultHook } from '@repo/stoker/openapi'
import { pool } from './db'
import { auth } from './lib/auth'
import { authMiddleware } from './middlewares/auth.js'
import { validateAuth } from './middlewares/validate.js'
import mapsRoutes from './routes/maps'

export const app = new OpenAPIHono({
  defaultHook,
})

app.notFound(notFound)
app.onError(onError)

// Mount better-auth handler with validation for sign-in/sign-up
app.on(['POST'], '/api/auth/sign-in/email', validateAuth, (c) => {
  return auth.handler(c.req.raw)
})
app.on(['POST'], '/api/auth/sign-up/email', validateAuth, (c) => {
  return auth.handler(c.req.raw)
})

// Handle remaining auth routes (GET, other POST endpoints)
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

app.route('/api/maps', mapsRoutes)

// This route should be protected by the middleware the user will implement
app.get('/api/protected', authMiddleware, (c) => {
  return c.text('protected route data')
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

console.warn('ENV:', {
  BUN_TEST: process.env.BUN_TEST,
  NODE_ENV: process.env.NODE_ENV,
})
export const server = Bun.serve({
  port: process.env.BUN_TEST || process.env.NODE_ENV === 'test' ? 0 : 3000,
  fetch: app.fetch,
})

export async function gracefulShutdown(signal: string) {
  console.warn(`Received ${signal}. Shutting down gracefully...`)

  try {
    await server.stop()
    console.warn('HTTP server stopped')

    await pool.end()
    console.warn('DB pool closed')

    process.exit(0)
  }
  catch (err) {
    console.error('Error during graceful shutdown:', err)
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
