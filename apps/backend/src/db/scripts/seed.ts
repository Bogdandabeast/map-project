import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { role } from '../schema'

function findLocalD1Db(): string {
  const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject'
  const files = readdirSync(d1Dir).filter(
    f => f.endsWith('.sqlite') && f !== 'metadata.sqlite',
  )
  if (files.length === 0) {
    throw new Error(`No local D1 database found in ${d1Dir}. Run wrangler first.`)
  }
  if (files.length > 1) {
    files.sort()
    console.warn(
      `Found ${files.length} .sqlite files in ${d1Dir}, using the first alphabetically: ${files[0]}`,
    )
  }
  return join(d1Dir, files[0])
}

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
