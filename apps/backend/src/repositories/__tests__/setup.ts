import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'
/**
 * Test database setup using Bun's built-in SQLite + drizzle-orm/bun-sqlite.
 *
 * Creates an in-memory database and runs schema creation for each test suite.
 * This mirrors the D1 production setup while keeping tests fast and portable.
 */
import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from '../../db/schema/events-core'

export type TestDb = BunSQLiteDatabase<typeof schema>

/**
 * Creates a fresh in-memory SQLite database with all event-related tables.
 * Each test suite gets its own database to ensure isolation.
 */
export function createTestDb(): TestDb {
  const sqlite = new Database(':memory:')
  const db = drizzle(sqlite, { schema })

  // Create all tables — must match the Drizzle schema definitions
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      address TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      date INTEGER NOT NULL,
      capacity INTEGER NOT NULL,
      planned_games TEXT,
      skill_level TEXT,
      atmosphere TEXT,
      image_key TEXT,
      status TEXT NOT NULL DEFAULT 'upcoming',
      creator_id TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
    );

    CREATE TABLE IF NOT EXISTS event_attendees (
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      rsvp_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      PRIMARY KEY (event_id, user_id)
    );
  `)

  return db
}
