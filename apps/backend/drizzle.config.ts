import { readdirSync, statSync } from 'node:fs'
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
  // Pick the most-recently modified file so content-hash changes don't
  // cause ambiguity. The sort below is stable because readdirSync order
  // is OS-dependent and we want deterministic behaviour.
  const sorted = files
    .map(f => ({ name: f, mtime: statSync(join(d1Dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)
  if (sorted.length > 1) {
    console.warn(
      `Found ${sorted.length} .sqlite files in ${d1Dir}, using the most recent: ${sorted[0].name}`,
    )
  }
  return join(d1Dir, sorted[0].name)
}

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: findLocalD1Db(),
  },
})
