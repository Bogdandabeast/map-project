/**
 * Shared Hono context types for the entire app.
 *
 * Import `AppEnv` whenever you create a new Hono instance or need
 * to reference the context type in middleware handlers.
 */
import type { Session, User } from 'better-auth'

export interface AppBindings {
  DB: D1Database
  R2?: R2Bucket
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
}

export interface AppVariables {
  user: User | null
  session: Session | null
}

export interface AppEnv {
  Bindings: AppBindings
  Variables: AppVariables
}
