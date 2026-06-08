/**
 * Shared Hono context types for the entire app.
 *
 * Import `AppEnv` whenever you create a new Hono instance or need
 * to reference the context type in middleware handlers.
 */
import type { Session, User } from 'better-auth'
import type { BackendEnv } from '../env'

/**
 * Runtime bindings from Cloudflare Workers.
 *
 * The string-based secrets and URLs are declared in {@link BackendEnv}
 * (packages/env/src/index.ts) and validated by Zod at runtime.  Platform
 * bindings like D1 and R2 come from wrangler.jsonc.
 */
export interface AppBindings extends BackendEnv {
  DB: D1Database
  R2?: R2Bucket
}

export interface AppVariables {
  user: User | null
  session: Session | null
}

export interface AppEnv {
  Bindings: AppBindings
  Variables: AppVariables
}
