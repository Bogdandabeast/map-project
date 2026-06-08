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

export interface TestDbHandle {
  db: BunSQLiteDatabase<typeof schema>
  sqlite: Database
}

/**
 * Creates a fresh in-memory SQLite database with all event-related tables.
 * Each test suite gets its own database to ensure isolation.
 * Returns both the Drizzle ORM instance and the raw SQLite connection.
 */
export function createTestDb(): TestDbHandle {
  const sqlite = new Database(':memory:')
  const db = drizzle(sqlite, { schema })

  // Enable foreign key enforcement for referential integrity tests
  sqlite.exec('PRAGMA foreign_keys = ON;')

  // Create all tables — must match the Drizzle schema definitions
  sqlite.exec(`
    -- Role table (needed for user FK)
    CREATE TABLE IF NOT EXISTS role (
      name TEXT PRIMARY KEY
    );

    -- User table (needed for FK references from events and event_attendees)
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      role TEXT NOT NULL DEFAULT 'user' REFERENCES role(name) ON DELETE RESTRICT ON UPDATE CASCADE,
      banned INTEGER NOT NULL DEFAULT 0,
      ban_reason TEXT,
      ban_expires INTEGER
    );

    -- Seed roles needed for tests
    INSERT OR IGNORE INTO role (name) VALUES ('user'), ('premium'), ('moderator'), ('admin');

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
      creator_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
    );

    CREATE TABLE IF NOT EXISTS event_attendees (
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      rsvp_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      PRIMARY KEY (event_id, user_id)
    );
  `)

  return { db, sqlite }
}

/**
 * Insert a test user into the database using the raw SQLite connection.
 * Returns the user row.
 */
export function seedTestUser(
  handle: TestDbHandle,
  overrides: {
    id?: string
    name?: string
    email?: string
    role?: string
    image?: string | null
  } = {},
) {
  const id = overrides.id ?? 'test-user-001'
  const name = overrides.name ?? 'Test User'
  const email = overrides.email ?? `${id}@test.com`
  const role = overrides.role ?? 'user'
  const image = overrides.image ?? null

  handle.sqlite.run(
    'INSERT OR REPLACE INTO user (id, name, email, role, image) VALUES (?, ?, ?, ?, ?)',
    [id, name, email, role, image],
  )

  return { id, name, email, role, image }
}
