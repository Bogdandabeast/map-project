import type { AuthFactory } from './auth'
import type { AnyDrizzleDb } from './database'
import type { AppEnv } from './hono'

export type { AuthFactory } from './auth'
export type { AnyDrizzleDb } from './database'
export type { AppBindings, AppEnv, AppVariables } from './hono'
/**
 * Environment for presigned URL generation.
 *
 * When `R2` binding is present AND the S3 credentials are configured
 * (accessKeyId, secretAccessKey, bucketName, accountId), the helper
 * generates a proper SigV4-signed URL via the S3 SDK. Otherwise it
 * falls back to a dev-friendly placeholder.
 */
export interface R2UploadEnv {
  R2?: R2Bucket
  s3AccessKeyId?: string
  s3SecretAccessKey?: string
  s3BucketName?: string
  s3AccountId?: string
}

export interface UserRoutesOptions {
  authFactory?: AuthFactory
  /** Returns a Drizzle DB instance from the environment. */
  getDb?: (env: AppEnv['Bindings']) => AnyDrizzleDb
}

/** PATCH /api/users/me/avatar — request body */
export interface AvatarKeyBody {
  key: string
}

/** POST /api/users/me/games — request body */
export interface LinkGameBody {
  gameId: string
  skillLevel?: string
}
