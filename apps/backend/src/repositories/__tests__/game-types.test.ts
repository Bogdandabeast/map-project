/**
 * Type verification tests for game types (Task 1.3)
 *
 * Verifies the game types module exists and can be imported.
 * TypeScript compilation will fail if the types don't exist.
 */
import type { Game, GameSearchParams, GameSearchResult } from '../../../../../packages/types/src/games'
import { describe, expect, test } from 'bun:test'

describe('game types module', () => {
  test('Game type can be structurally matched', () => {
    const game: Game = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Catan',
      description: 'Trading game',
      imageUrl: 'https://example.com/img.jpg',
      coverImage: 'https://example.com/cover.jpg',
      minPlayers: 3,
      maxPlayers: 4,
      duration: 90,
      bggId: 13,
      accessCount: 5,
      source: 'bgg' as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    expect(game.title).toBe('Catan')
    expect(game.minPlayers).toBe(3)
  })

  test('GameSearchResult type can be structurally matched', () => {
    const result: GameSearchResult = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Wingspan',
      minPlayers: 1,
      maxPlayers: 5,
      duration: 60,
      coverImage: 'https://example.com/wingspan.jpg',
      source: 'bgg' as const,
      accessCount: 42,
    }
    expect(result.title).toBe('Wingspan')
    expect(result.accessCount).toBe(42)
  })

  test('GameSearchParams supports optional limit', () => {
    const withLimit: GameSearchParams = { q: 'Catan', limit: 10 }
    expect(withLimit.q).toBe('Catan')
    expect(withLimit.limit).toBe(10)

    const withoutLimit: GameSearchParams = { q: 'Catan' }
    expect(withoutLimit.q).toBe('Catan')
  })
})
