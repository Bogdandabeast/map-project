import type { DrizzleD1Database } from 'drizzle-orm/d1'

/** Union of D1 (production) and libsql (test) drizzle instances. */
export type AnyDrizzleDb =
  | DrizzleD1Database
  | ReturnType<import('drizzle-orm/libsql').drizzle>
