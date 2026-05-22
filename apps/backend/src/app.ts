import { OpenAPIHono } from '@hono/zod-openapi'
import { notFound, onError } from '@repo/stoker/middlewares'
import { defaultHook } from '@repo/stoker/openapi'
import { auth } from './lib/auth'
import { authMiddleware } from './middlewares/auth.js'
import { validateAuth } from './middlewares/validate.js'

const app = new OpenAPIHono({
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

// This route should be protected by the middleware the user will implement
app.get('/api/protected', authMiddleware, (c) => {
  return c.text('protected route data')
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
