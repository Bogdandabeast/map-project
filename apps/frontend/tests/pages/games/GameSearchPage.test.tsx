import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { MemoryRouter, Route } from 'react-router-dom'
import type { SearchResponse } from '../../../src/services/games'

// ── Mock auth ──────────────────────────────────────────────────────
mock.module('../../../src/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
    isPending: false,
    session: {},
  }),
}))

// ── Mock games service — mutable for different test scenarios ──────
let mockSearchImpl = async (_q: string, _limit?: number): Promise<SearchResponse> =>
  ({ source: 'd1', results: [] })

mock.module('../../../src/services/games', () => ({
  searchGames: (q: string, limit?: number) => mockSearchImpl(q, limit),
  getGameById: () => Promise.resolve({}),
  getPopularGames: () => Promise.resolve([]),
  getRecentGames: () => Promise.resolve([]),
}))

import { GameSearchPage } from '../../../src/pages/GameSearchPage'

// ── Test data ─────────────────────────────────────────────────────

const gameResult = {
  id: '11111111-1111-4111-a111-111111111111',
  title: 'Catan',
  minPlayers: 3,
  maxPlayers: 4,
  duration: 90,
  coverImage: null,
  source: 'manual' as const,
  accessCount: 42,
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/games/search']}>
      <Route path="/games/search">
        <GameSearchPage />
      </Route>
    </MemoryRouter>,
  )
}

function typeInSearchbar(value: string) {
  const input = screen.getByTestId('game-search-input') as any
  // happy-dom doesn't propagate .value — set it explicitly before firing event
  Object.defineProperty(input, 'value', { value, writable: true, configurable: true })
  fireEvent(input, new CustomEvent('ionChange', {
    detail: { value },
    bubbles: true,
    cancelable: true,
  }))
}

// ── Tests ─────────────────────────────────────────────────────────

describe('GameSearchPage', () => {
  afterEach(() => {
    cleanup()
    mockSearchImpl = async () => ({ source: 'd1', results: [] })
  })

  it('renders the search bar', () => {
    renderPage()
    expect(screen.getByTestId('game-search-input')).toBeInTheDocument()
  })

  it('shows loading spinner while searching', async () => {
    let resolvePromise!: (value: unknown) => void
    mockSearchImpl = () =>
      new Promise((resolve) => { resolvePromise = resolve })

    renderPage()
    typeInSearchbar('Catan')

    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    // Clean up
    resolvePromise!({ source: 'd1', results: [] })
  })

  it('shows search results when games are found', async () => {
    mockSearchImpl = async () => ({
      source: 'd1',
      results: [gameResult],
    })

    renderPage()
    typeInSearchbar('Catan')

    await waitFor(() => {
      expect(screen.getByText('Catan')).toBeInTheDocument()
    })
  })

  it('shows empty state when no results found', async () => {
    mockSearchImpl = async () => ({ source: 'd1', results: [] })

    renderPage()
    typeInSearchbar('xyzNotExist')

    await waitFor(() => {
      expect(screen.getByTestId('empty-state-message')).toBeInTheDocument()
    })
  })

  it('shows error state when BGG API is unavailable', async () => {
    mockSearchImpl = async () => ({
      source: 'd1',
      results: [],
      note: 'Search is temporarily limited. BGG API unavailable.',
    })

    renderPage()
    typeInSearchbar('Catan')

    await waitFor(() => {
      expect(screen.getByTestId('error-state-message')).toBeInTheDocument()
    })
  })
})
