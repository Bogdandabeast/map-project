import type { BackendEnv } from './env'
import type { AppEnv } from './types/hono'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createAuth } from './db/lib/auth'
import { parseEnv } from './env'
import { usersRoutes } from './routes/users'
import { eventRoutes } from './routes/events/events.routes'
import { uploadRoutes } from './routes/events/upload.routes'
import { attendeeRoutes } from './routes/events/attendees.routes'
import { meRoutes } from './routes/events/me.routes'
import { gameSearchRoutes } from './routes/game-search'
import { gameDetailRoutes } from './routes/game-detail'
import { gameBrowseRoutes } from './routes/game-browse'

const app = new Hono<AppEnv>()

app.use('*', cors({
  origin: ['http://localhost:5173', 'capacitor://localhost'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Lazy singleton: better-auth instance is expensive to create per request.
// The D1 binding is stable across requests within the same worker isolate.
let authInstance: ReturnType<typeof createAuth> | null = null
let authEnv: BackendEnv | null = null
let authDB: D1Database | null = null

app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
  const env = parseEnv(c.env as unknown as Record<string, unknown>)
  if (!authInstance || authDB !== c.env.DB || !authEnv) {
    authEnv = env
    authDB = c.env.DB
    authInstance = createAuth({ ...env, DB: c.env.DB })
  }
  return authInstance.handler(c.req.raw)
})

app.route('/api/users', usersRoutes)

// Events domain — mounted under /api/events and /api/me/events
app.route('/api/events', eventRoutes)
app.route('/api/events', uploadRoutes)
app.route('/api/events', attendeeRoutes)
app.route('/api/me/events', meRoutes)

// Game catalog — mounted under /api/games
// IMPORTANT: specific routes (/search, /popular, /recent) MUST be before
// parameterized route (/:id) to avoid :id matching "popular"/"recent"/"search"
app.route('/api/games', gameSearchRoutes)
app.route('/api/games', gameBrowseRoutes)
app.route('/api/games', gameDetailRoutes)

export default app
