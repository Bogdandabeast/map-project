import type { BackendEnv } from './env'
import type { AppEnv } from './types/hono'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createAuth } from './db/lib/auth'
import { parseEnv } from './env'
import { usersRoutes } from './routes/users'

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

export default app
