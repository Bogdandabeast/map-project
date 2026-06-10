import { API_URL } from '../env'
import type { Game, GameSearchResult } from '@repo/types'

// ── Fetch wrapper (copied from events.ts) ─────────────────────────

async function request<T>(
  path: string,
  options: RequestInit & { expectNoContent?: boolean } = {},
): Promise<T> {
  const { headers: optHeaders, expectNoContent, ...rest } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(optHeaders instanceof Headers
      ? Object.fromEntries(optHeaders.entries())
      : (optHeaders as Record<string, string> | undefined)),
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...rest,
      credentials: 'include',
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    if (response.status === 204) {
      return undefined as unknown as T
    }

    return response.json() as Promise<T>
  }
  catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith('HTTP ')) {
      throw err
    }
    throw new Error(
      `Request failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    )
  }
}

// ── API response types ─────────────────────────────────────────────

export interface SearchResponse {
  source: 'd1' | 'bgg'
  results: GameSearchResult[]
  note?: string
}

// ── API functions ──────────────────────────────────────────────────

/** GET /api/games/search?q=&limit= */
export async function searchGames(q: string, limit?: number): Promise<SearchResponse> {
  const params = new URLSearchParams({ q })
  if (limit) params.set('limit', String(limit))
  return request<SearchResponse>(`/api/games/search?${params.toString()}`)
}

/** GET /api/games/:id */
export async function getGameById(id: string): Promise<Game> {
  return request<Game>(`/api/games/${encodeURIComponent(id)}`)
}

/** GET /api/games/popular */
export async function getPopularGames(limit?: number): Promise<Game[]> {
  const params = new URLSearchParams()
  if (limit) params.set('limit', String(limit))
  const query = params.toString() ? `?${params.toString()}` : ''
  return request<Game[]>(`/api/games/popular${query}`)
}

/** GET /api/games/recent */
export async function getRecentGames(limit?: number): Promise<Game[]> {
  const params = new URLSearchParams()
  if (limit) params.set('limit', String(limit))
  const query = params.toString() ? `?${params.toString()}` : ''
  return request<Game[]>(`/api/games/recent${query}`)
}
