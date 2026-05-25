import { pool } from './db'
import { runMigrations } from './migrate-db'

async function createTables() {
  try {
    await runMigrations()
    console.warn('Tables created successfully')
  }
  catch (err) {
    console.error('Error creating tables:', err)
    throw err
  }
  finally {
    await pool.end()
  }
}

createTables()
