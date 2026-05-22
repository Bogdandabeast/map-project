import { OpenAPIHono } from '@hono/zod-openapi'
import { notFound, onError } from '@repo/stoker/middlewares'
import { defaultHook } from '@repo/stoker/openapi'

const app = new OpenAPIHono({
  defaultHook,
})

app.notFound(notFound)
app.onError(onError)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
