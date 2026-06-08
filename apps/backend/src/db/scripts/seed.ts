import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { findLocalD1Db } from '../lib/local-db'
import { role } from '../schema'

/**
 * Seeds the `role` table with default application roles.
 *
 * Local dev:
 *   bun run src/db/scripts/seed.ts
 *
 * Production D1:
 *   wrangler d1 execute map-project-db --remote \
 *     --command="INSERT OR IGNORE INTO role (name) VALUES ('user'),('premium'),('admin')"
 */
export async function seedUserRoles() {
  const db = drizzle(createClient({ url: `file:${findLocalD1Db()}` }))

  await db
    .insert(role)
    .values([
      { name: 'user' },
      { name: 'premium' },
      { name: 'admin' },
    ])
    .onConflictDoNothing()

  console.log('✅ Roles seeded')
}

// Run directly: bun run src/db/scripts/seed.ts
if (import.meta.main) {
  await seedUserRoles()
  // eslint-disable-next-line node/prefer-global/process
  process.exit(0)
}
