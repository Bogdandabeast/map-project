import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pool } from './db'

async function runMigrations() {
  const migrationPath = path.join(process.cwd(), 'apps/backend/drizzle/0000_jittery_roland_deschain.sql')
  const sql = await fs.readFile(migrationPath, 'utf8')

  // Split by statement-breakpoint
  const statements = sql.split('--> statement-breakpoint')

  for (const statement of statements) {
    const trimmed = statement.trim()
    if (trimmed) {
      console.warn(`Executing: ${trimmed.substring(0, 50)}...`)
      await pool.query(trimmed)
    }
  }
  console.warn('Migrations applied successfully')
  process.exit(0)
}

runMigrations().catch(async (err) => {
  console.error('Migration failed:', err)
  await pool.end()
  process.exit(1)
})
