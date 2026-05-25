import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pool } from './db'

export async function runMigrations() {
  const dir = path.join(process.cwd(), 'apps/backend/drizzle')
  const files = await fs.readdir(dir)
  const sqlFiles = files.filter(f => f.endsWith('.sql')).sort()

  for (const file of sqlFiles) {
    const sql = await fs.readFile(path.join(dir, file), 'utf8')
    const statements = sql.split('--> statement-breakpoint')

    for (const statement of statements) {
      const trimmed = statement.trim()
      if (trimmed) {
        console.warn(`Executing: ${trimmed.substring(0, 50)}...`)
        await pool.query(trimmed)
      }
    }
  }

  console.warn('Migrations applied successfully')
}

// Only auto-run when this file is the entry point
if (process.argv[1]?.includes('migrate-db')) {
  runMigrations()
    .then(() => pool.end().then(() => process.exit(0)))
    .catch(async (err) => {
      console.error('Migration failed:', err)
      await pool.end()
      process.exit(1)
    })
}
