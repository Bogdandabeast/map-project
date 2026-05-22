import type { Schema } from 'hono'
import type { AppOpenAPI } from './types'

import { OpenAPIHono } from '@hono/zod-openapi'
import { notFound, onError, serveEmojiFavicon } from '@repo/stoker/middlewares'
import { defaultHook } from '@repo/stoker/openapi'

import { requestId } from 'hono/request-id'

export function createRouter() {
  return new OpenAPIHono({
    strict: false,
    defaultHook,
  })
}

export default function createApp() {
  const app = createRouter()
  app.use(requestId())
    .use(serveEmojiFavicon('📝'))
  app.notFound(notFound)
  app.onError(onError)
  return app
}

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  return createApp().route('/', router)
}
