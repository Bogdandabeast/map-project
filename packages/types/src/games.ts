/**
 * Game catalog types
 *
 * TypeScript interfaces for the game catalog domain.
 */

export interface Game {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  coverImage: string | null
  minPlayers: number | null
  maxPlayers: number | null
  duration: number | null
  bggId: number | null
  accessCount: number
  source: 'manual' | 'bgg'
  createdAt: number
  updatedAt: number
}

export interface GameSearchResult {
  id: string
  title: string
  minPlayers: number | null
  maxPlayers: number | null
  duration: number | null
  coverImage: string | null
  source: 'manual' | 'bgg'
  accessCount: number
}

export interface GameSearchParams {
  q: string
  limit?: number
}
