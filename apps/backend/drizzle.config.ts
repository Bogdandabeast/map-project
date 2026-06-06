import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'drizzle-kit'

/**
 * Finds the local D1 SQLite database managed by wrangler/miniflare.
 * The file is stored under .wrangler/state/v3/d1/ with a content-hash
 * filename that changes on each migration. This avoids hardcoding it.
 */
function findLocalD1Db(): string {
  const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject'
  const files = readdirSync(d1Dir).filter(
    f => f.endsWith('.sqlite') && f !== 'metadata.sqlite',
  )
  if (files.length === 0) {
    throw new Error(
      `No local D1 database found in ${d1Dir}. Run wrangler first.`,
    )
  }
  return join(d1Dir, files[0])
}

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: findLocalD1Db(),
  },
})
