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

app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
  const env = parseEnv(c.env as unknown as Record<string, unknown>)
  const auth = createAuth({ ...env, DB: c.env.DB })
  return auth.handler(c.req.raw)
})

app.route('/api/users', usersRoutes)

export default app
