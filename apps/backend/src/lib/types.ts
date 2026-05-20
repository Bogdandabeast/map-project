import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi'
import type { Schema } from 'hono'

export interface AppBindings {
  Bindings: Record<string, unknown>
  Variables: Record<string, unknown>
}

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>
