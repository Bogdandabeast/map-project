import { OpenAPIHono } from '@hono/zod-openapi'
import { notFound, onError } from '@repo/stoker/middlewares'
import { defaultHook } from '@repo/stoker/openapi'
import { auth } from './lib/auth'

const app = new OpenAPIHono({
  defaultHook,
})

app.notFound(notFound)
app.onError(onError)

// Mount better-auth handler with debug logging
app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
  console.warn('--- AUTH DEBUG ---')
  console.warn('URL:', c.req.url)
  console.warn('Method:', c.req.method)
  console.warn('Host:', c.req.header('Host'))
  return auth.handler(c.req.raw)
})

app.get('/api/protected', (c) => {
  return c.text('protected route data')
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
