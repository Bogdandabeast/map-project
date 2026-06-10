/**
 * Schema tests for game table (Task 1.1)
 *
 * Verifies the expanded game table definition with new columns
 * via drizzle-zod schemas and runtime validation.
 */
import { describe, expect, test } from 'bun:test'
import { game, insertGameSchema, selectGameSchema } from '../../db/schema/game'

describe('game table (expanded)', () => {
  test('game table is defined', () => {
    expect(game).toBeDefined()
  })

  test('insertGameSchema accepts valid game with all new fields', () => {
    const valid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Catan',
      description: 'A classic trading and building game',
      minPlayers: 3,
      maxPlayers: 4,
      duration: 90,
      coverImage: 'https://example.com/catan.jpg',
      bggId: 13,
      accessCount: 0,
      source: 'bgg' as const,
    }

    const result = insertGameSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('insertGameSchema marks SQL-defaulted columns as optional', () => {
    const minimal = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Catan',
      minPlayers: 3,
      maxPlayers: 4,
      duration: 90,
    }

    const result = insertGameSchema.safeParse(minimal)
    expect(result.success).toBe(true)
    if (result.success) {
      // SQL defaults (accessCount, source) are not populated by Zod —
      // they are DB-level defaults. drizzle-zod marks them as optional.
      expect(result.data.accessCount).toBeUndefined()
      expect(result.data.source).toBeUndefined()
      // createdAt and updatedAt also have SQL defaults
      expect(result.data.createdAt).toBeUndefined()
    }
  })

  test('insertGameSchema rejects negative minPlayers', () => {
    const invalid = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Catan',
      minPlayers: -1,
      maxPlayers: 4,
      duration: 90,
    }

    const result = insertGameSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  test('insertGameSchema rejects zero minPlayers', () => {
    const invalid = {
      id: '550e8400-e29b-41d4-a716-446655440004',
      title: 'Catan',
      minPlayers: 0,
      maxPlayers: 4,
      duration: 90,
    }

    const result = insertGameSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  test('selectGameSchema accepts full game record with Date timestamps', () => {
    const record = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Catan',
      description: 'A classic trading and building game',
      imageUrl: 'https://example.com/catan.jpg',
      coverImage: 'https://example.com/catan-cover.jpg',
      minPlayers: 3,
      maxPlayers: 4,
      duration: 90,
      bggId: 13,
      accessCount: 5,
      source: 'bgg',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = selectGameSchema.safeParse(record)
    expect(result.success).toBe(true)
  })

  test('bggId is nullable (can be null for manual games)', () => {
    const manual = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Custom Game',
      minPlayers: 2,
      maxPlayers: 6,
      duration: 60,
      bggId: null,
    }

    const result = insertGameSchema.safeParse(manual)
    expect(result.success).toBe(true)
  })

  test('insertGameSchema rejects empty title', () => {
    const invalid = {
      id: '550e8400-e29b-41d4-a716-446655440005',
      title: '',
      minPlayers: 2,
      maxPlayers: 4,
      duration: 60,
    }

    const result = insertGameSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})
