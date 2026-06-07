/**
 * Shared Hono context types for the entire app.
 *
 * Import `AppEnv` whenever you create a new Hono instance or need
 * to reference the context type in middleware handlers.
 */
import type { Session, User } from "better-auth"

export type AppBindings = {
  DB: D1Database
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
}

export type AppVariables = {
  user: User | null
  session: Session | null
}

export type AppEnv = {
  Bindings: AppBindings
  Variables: AppVariables
}
