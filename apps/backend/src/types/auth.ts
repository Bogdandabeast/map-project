import type { createAuth } from '../db/lib/auth'

/** Signature of the auth factory — tests inject a libsql-backed version. */
export type AuthFactory = (env: Parameters<typeof createAuth>[0]) => ReturnType<typeof createAuth>
