import type { AuthFactory } from './auth'
import type { AnyDrizzleDb } from './database'
import type { AppEnv } from './hono'

export type { AppBindings, AppEnv, AppVariables } from './hono'
export type { AuthFactory } from './auth'
export type { AnyDrizzleDb } from './database'
export type R2UploadEnv = { R2?: R2Bucket }

export type UserRoutesOptions = {
  authFactory?: AuthFactory
  /** Returns a Drizzle DB instance from the environment. */
  getDb?: (env: AppEnv['Bindings']) => AnyDrizzleDb
}

/** PATCH /api/users/me/avatar — request body */
export interface AvatarKeyBody {
  key?: string
}

/** POST /api/users/me/games — request body */
export interface LinkGameBody {
  gameId?: string
  skillLevel?: string
}
