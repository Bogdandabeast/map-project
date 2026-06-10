/**
 * BGG Client tests (Task 1.4)
 *
 * Verifies the BGG API client wrapper with search and detail functions.
 * Uses mock.module to intercept the bgg package.
 */
import { describe, expect, mock, test } from 'bun:test'

// We'll mock the bgg module to return controlled data
const mockBggRequest = mock(async (_path: string, _params: Record<string, unknown>) => {
  return ({} as Record<string, unknown>)
})

mock.module('bgg', () => ({
  default: () => mockBggRequest,
}))

// Import AFTER mock — the module under test imports bgg
const { getBoardGameDetail, searchBoardGame } = await import('../bgg-client')

describe('searchBoardGame', () => {
  test('returns mapped results for a valid query', async () => {
    mockBggRequest.mockResolvedValueOnce({
      items: {
        item: [
          { id: '13', name: { _text: 'Catan' }, yearpublished: { _text: '1995' } },
          { id: '224517', name: { _text: 'Azul' }, yearpublished: { _text: '2017' } },
        ],
      },
    })

    const results = await searchBoardGame('Catan')
    expect(results).toHaveLength(2)
    expect(results[0].bggId).toBe(13)
    expect(results[0].name).toBe('Catan')
    expect(results[0].year).toBe(1995)
    expect(results[1].bggId).toBe(224517)
    expect(results[1].name).toBe('Azul')
    expect(results[1].year).toBe(2017)
  })

  test('returns empty array when no items found', async () => {
    mockBggRequest.mockResolvedValueOnce({
      items: {},
    })

    const results = await searchBoardGame('nonexistent')
    expect(results).toEqual([])
  })

  test('handles single item result (not wrapped in array)', async () => {
    mockBggRequest.mockResolvedValueOnce({
      items: {
        item: { id: '13', name: { _text: 'Catan' }, yearpublished: {} },
      },
    })

    const results = await searchBoardGame('Catan')
    expect(results).toHaveLength(1)
    expect(results[0].bggId).toBe(13)
    expect(results[0].name).toBe('Catan')
  })

  test('handles missing year gracefully', async () => {
    mockBggRequest.mockResolvedValueOnce({
      items: {
        item: [{ id: '42', name: { _text: 'Some Game' } }],
      },
    })

    const results = await searchBoardGame('some game')
    expect(results[0].year).toBeUndefined()
  })
})

describe('getBoardGameDetail', () => {
  test('returns full metadata for a valid bggId', async () => {
    mockBggRequest.mockResolvedValueOnce({
      items: {
        item: {
          id: '13',
          name: [
            { _text: 'Catan', type: 'primary' },
            { _text: 'Los Colonos de Catán', type: 'alternate' },
          ],
          minplayers: { _text: '3' },
          maxplayers: { _text: '4' },
          playingtime: { _text: '90' },
          image: { _text: 'https://example.com/catan.jpg' },
          thumbnail: { _text: 'https://example.com/catan-thumb.jpg' },
          description: { _text: 'A classic trading and building game.' },
          yearpublished: { _text: '1995' },
        },
      },
    })

    const result = await getBoardGameDetail(13)
    expect(result).toBeDefined()
    expect(result.bggId).toBe(13)
    expect(result.name).toBe('Catan')
    expect(result.minPlayers).toBe(3)
    expect(result.maxPlayers).toBe(4)
    expect(result.playingTime).toBe(90)
    expect(result.image).toBe('https://example.com/catan.jpg')
    expect(result.thumbnail).toBe('https://example.com/catan-thumb.jpg')
    expect(result.description).toBe('A classic trading and building game.')
    expect(result.yearPublished).toBe(1995)
  })

  test('handles missing optional fields gracefully', async () => {
    mockBggRequest.mockResolvedValueOnce({
      items: {
        item: {
          id: '99',
          name: { _text: 'Minimal Game', type: 'primary' },
        },
      },
    })

    const result = await getBoardGameDetail(99)
    expect(result.name).toBe('Minimal Game')
    expect(result.minPlayers).toBeNull()
    expect(result.description).toBeNull()
    expect(result.image).toBeNull()
  })
})
