import { afterEach, describe, expect, it, mock } from 'bun:test'

// ── Mock env before any import of games.ts ─────────────────────────
mock.module('../../env', () => ({
  API_URL: 'http://localhost:3000',
}))

import { getGameById, getPopularGames, getRecentGames, searchGames } from '../games'

// ── Test data ─────────────────────────────────────────────────────

const mockGame = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Catan',
  description: 'A classic game',
  minPlayers: 3,
  maxPlayers: 4,
  duration: 90,
  coverImage: 'https://example.com/catan.jpg',
  imageUrl: null,
  bggId: 13,
  accessCount: 42,
  source: 'manual',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const mockSearchResult = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Catan',
  minPlayers: 3,
  maxPlayers: 4,
  duration: 90,
  coverImage: 'https://example.com/catan.jpg',
  source: 'manual',
  accessCount: 42,
}

// ── Tests ─────────────────────────────────────────────────────────

describe('games service', () => {
  afterEach(() => {
    // Reset fetch
  })

  it('searchGames calls GET /api/games/search with query params', async () => {
    const mockJson = { source: 'd1', results: [mockSearchResult] }
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockJson),
      }),
    )

    const result = await searchGames('Catan')

    expect(result.source).toBe('d1')
    expect(result.results).toHaveLength(1)
    expect(result.results[0].title).toBe('Catan')
  })

  it('searchGames includes limit param when provided', async () => {
    let capturedUrl = ''
    globalThis.fetch = mock((url: string) => {
      capturedUrl = url as string
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ source: 'd1', results: [] }),
      })
    })

    await searchGames('Catan', 5)
    expect(capturedUrl).toContain('limit=5')
  })

  it('getGameById calls GET /api/games/:id', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockGame),
      }),
    )

    const result = await getGameById('550e8400-e29b-41d4-a716-446655440000')
    expect(result.title).toBe('Catan')
    expect(result.description).toBe('A classic game')
  })

  it('getPopularGames calls GET /api/games/popular', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockGame]),
      }),
    )

    const result = await getPopularGames()
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Catan')
  })

  it('getRecentGames calls GET /api/games/recent', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockGame]),
      }),
    )

    const result = await getRecentGames(10)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Catan')
  })
})
