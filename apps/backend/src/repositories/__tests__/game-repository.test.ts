import type { GameRepository } from '../game-repository'
/**
 * Game Repository tests (Task 1.5)
 *
 * Tests CRUD operations for the game table against an in-memory SQLite DB.
 * Uses the same pattern as events integration tests.
 */
import { Database } from 'bun:sqlite'
import { beforeEach, describe, expect, test } from 'bun:test'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from '../../db/schema/game'
import { createGameRepository } from '../game-repository'

function createTestGameDb() {
  const sqlite = new Database(':memory:')
  const db = drizzle(sqlite, { schema })

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS game (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      min_players INTEGER,
      max_players INTEGER,
      duration INTEGER,
      cover_image TEXT,
      bgg_id INTEGER UNIQUE,
      access_count INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'manual',
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
    );
  `)

  return { db, sqlite }
}

let repo: GameRepository

beforeEach(() => {
  const { db } = createTestGameDb()
  repo = createGameRepository(db)
})

describe('searchByName', () => {
  test('returns matching games by ILIKE partial title', async () => {
    // Seed: insert directly via raw SQL since repo only exposes operations
    const { db, sqlite } = createTestGameDb()
    repo = createGameRepository(db)

    sqlite.exec(`
      INSERT INTO game (id, title, access_count, source) VALUES
        ('g-1', 'Catan', 5, 'bgg'),
        ('g-2', 'Catania', 2, 'manual'),
        ('g-3', 'Wingspan', 10, 'bgg');
    `)

    const results = await repo.searchByName('cat')
    expect(results.length).toBeGreaterThanOrEqual(1)
    const titles = results.map(r => r.title)
    expect(titles).toContain('Catan')
    expect(titles).toContain('Catania')
  })

  test('returns empty array when no match found', async () => {
    const { db, sqlite } = createTestGameDb()
    repo = createGameRepository(db)

    sqlite.exec(`
      INSERT INTO game (id, title, access_count, source) VALUES
        ('g-1', 'Catan', 5, 'bgg');
    `)

    const results = await repo.searchByName('zzz')
    expect(results).toEqual([])
  })

  test('respects limit parameter', async () => {
    const { db, sqlite } = createTestGameDb()
    repo = createGameRepository(db)

    sqlite.exec(`
      INSERT INTO game (id, title, access_count, source) VALUES
        ('g-1', 'Game A', 1, 'manual'),
        ('g-2', 'Game B', 2, 'manual'),
        ('g-3', 'Game C', 3, 'manual');
    `)

    const results = await repo.searchByName('Game', 2)
    expect(results.length).toBeLessThanOrEqual(2)
  })
})

describe('findById', () => {
  test('returns a game by UUID', async () => {
    const { db, sqlite } = createTestGameDb()
    repo = createGameRepository(db)

    sqlite.exec(`
      INSERT INTO game (id, title, access_count, source) VALUES
        ('550e8400-e29b-41d4-a716-446655440000', 'Catan', 5, 'bgg');
    `)

    const game = await repo.findById('550e8400-e29b-41d4-a716-446655440000')
    expect(game).not.toBeNull()
    expect(game!.title).toBe('Catan')
    expect(game!.accessCount).toBe(5)
  })

  test('returns null for non-existent id', async () => {
    const result = await repo.findById('non-existent-id')
    expect(result).toBeNull()
  })
})

describe('getPopular', () => {
  test('returns games ordered by accessCount DESC', async () => {
    const { db, sqlite } = createTestGameDb()
    repo = createGameRepository(db)

    sqlite.exec(`
      INSERT INTO game (id, title, access_count, source) VALUES
        ('g-1', 'Least Popular', 1, 'manual'),
        ('g-2', 'Middle', 5, 'manual'),
        ('g-3', 'Most Popular', 10, 'bgg');
    `)

    const results = await repo.getPopular(3)
    expect(results.length).toBe(3)
    expect(results[0].title).toBe('Most Popular')
    expect(results[1].title).toBe('Middle')
    expect(results[2].title).toBe('Least Popular')
  })

  test('respects limit parameter', async () => {
    const { db, sqlite } = createTestGameDb()
    repo = createGameRepository(db)

    sqlite.exec(`
      INSERT INTO game (id, title, access_count, source) VALUES
        ('g-1', 'Game 1', 1, 'manual'),
        ('g-2', 'Game 2', 2, 'manual'),
        ('g-3', 'Game 3', 3, 'manual');
    `)

    const results = await repo.getPopular(2)
    expect(results.length).toBe(2)
  })
})

describe('getRecent', () => {
  test('returns games ordered by createdAt DESC', async () => {
    const { db, sqlite } = createTestGameDb()
    repo = createGameRepository(db)

    const now = Date.now()
    sqlite.exec(`
      INSERT INTO game (id, title, access_count, source, created_at) VALUES
        ('g-1', 'Oldest', 1, 'manual', ${now - 30000}),
        ('g-2', 'Middle', 5, 'manual', ${now - 10000}),
        ('g-3', 'Newest', 10, 'bgg', ${now});
    `)

    const results = await repo.getRecent(3)
    expect(results.length).toBe(3)
    expect(results[0].title).toBe('Newest')
    expect(results[1].title).toBe('Middle')
    expect(results[2].title).toBe('Oldest')
  })

  test('respects limit parameter', async () => {
    const { db, sqlite } = createTestGameDb()
    repo = createGameRepository(db)

    const now = Date.now()
    sqlite.exec(`
      INSERT INTO game (id, title, access_count, source, created_at) VALUES
        ('g-1', 'Game 1', 1, 'manual', ${now}),
        ('g-2', 'Game 2', 2, 'manual', ${now});
    `)

    const results = await repo.getRecent(1)
    expect(results.length).toBe(1)
  })
})

describe('upsert', () => {
  test('inserts a new game when bggId does not exist', async () => {
    const { db, sqlite } = createTestGameDb()
    repo = createGameRepository(db)

    const result = await repo.upsert({
      bggId: 13,
      title: 'Catan',
      description: 'Trading game',
      imageUrl: 'https://example.com/catan.jpg',
      coverImage: 'https://example.com/cover.jpg',
      minPlayers: 3,
      maxPlayers: 4,
      duration: 90,
      source: 'bgg',
    })

    expect(result.title).toBe('Catan')
    expect(result.bggId).toBe(13)
    expect(result.source).toBe('bgg')

    // Verify it exists in DB
    const rows = sqlite
      .query('SELECT * FROM game WHERE bgg_id = 13')
      .all() as Array<Record<string, unknown>>
    expect(rows.length).toBe(1)
  })

  test('updates existing game when bggId already exists', async () => {
    const { db, sqlite } = createTestGameDb()
    repo = createGameRepository(db)

    // First insert
    await repo.upsert({
      bggId: 13,
      title: 'Catan',
      description: 'Old description',
      imageUrl: null,
      coverImage: null,
      minPlayers: 3,
      maxPlayers: 4,
      duration: 90,
      source: 'bgg',
    })

    // Upsert again with updated data
    const result = await repo.upsert({
      bggId: 13,
      title: 'Catan (Updated)',
      description: 'New description',
      imageUrl: 'https://example.com/new.jpg',
      coverImage: 'https://example.com/new-cover.jpg',
      minPlayers: 2,
      maxPlayers: 6,
      duration: 120,
      source: 'bgg',
    })

    expect(result.title).toBe('Catan (Updated)')
    expect(result.description).toBe('New description')

    // Verify only one row exists
    const rows = sqlite
      .query('SELECT * FROM game WHERE bgg_id = 13')
      .all() as Array<Record<string, unknown>>
    expect(rows.length).toBe(1)
  })
})

describe('incrementAccess', () => {
  test('increments accessCount by 1', async () => {
    const { db, sqlite } = createTestGameDb()
    repo = createGameRepository(db)

    sqlite.exec(`
      INSERT INTO game (id, title, access_count, source) VALUES
        ('g-1', 'Catan', 5, 'bgg');
    `)

    await repo.incrementAccess('g-1')

    const rows = sqlite
      .query('SELECT access_count FROM game WHERE id = ?')
      .all('g-1') as Array<{ access_count: number }>
    expect(rows[0].access_count).toBe(6)
  })

  test('does nothing for non-existent game id', async () => {
    // Should not throw
    await repo.incrementAccess('non-existent')
    // Test passes if no error is thrown
  })
})
