import type { AppEnv } from './types/hono'
import { Hono } from 'hono'
import { createAuth } from './db/lib/auth'
import { usersRoutes } from './routes/users'

const app = new Hono<AppEnv>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  const auth = createAuth(c.env)
  return auth.handler(c.req.raw)
})

app.route('/api/users', usersRoutes)

export default app
