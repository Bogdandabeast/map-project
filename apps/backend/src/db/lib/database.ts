import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { drizzle } from 'drizzle-orm/d1'

/**
 * Create a Drizzle ORM instance from a Cloudflare D1 binding.
 *
 * Use this for application-level queries outside of Better Auth
 * (which handles its own tables natively via the D1 binding).
 *
 * @example
 *   const db = createDb(env.DB);
 *   const users = await db.select().from(user).all();
 */
export function createDb(binding: D1Database): DrizzleD1Database {
  return drizzle(binding)
}
