import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { MemoryRouter, Route } from 'react-router-dom'

// ── Mock auth ──────────────────────────────────────────────────────
mock.module('../../../src/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
    isPending: false,
    session: {},
  }),
}))

// ── Mock games service ─────────────────────────────────────────────
let mockGameData: any = null

mock.module('../../../src/services/games', () => ({
  searchGames: () => Promise.resolve({ source: 'd1', results: [] }),
  getGameById: (_id: string) => mockGameData
    ? Promise.resolve(mockGameData)
    : Promise.reject(new Error('HTTP 404: Not found')),
  getPopularGames: () => Promise.resolve([]),
  getRecentGames: () => Promise.resolve([]),
}))

import { GameDetailPage } from '../../../src/pages/GameDetailPage'

// ── Test data ─────────────────────────────────────────────────────

const mockGame = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Catan',
  description: 'A classic trading game.',
  minPlayers: 3,
  maxPlayers: 4,
  duration: 90,
  coverImage: null,
  imageUrl: null,
  bggId: 13,
  accessCount: 42,
  source: 'manual',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

function renderPage(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/games/${id}`]}>
      <Route path="/games/:id">
        <GameDetailPage />
      </Route>
    </MemoryRouter>,
  )
}

// ── Tests ─────────────────────────────────────────────────────────

describe('GameDetailPage', () => {
  afterEach(() => {
    cleanup()
    mockGameData = null
  })

  it('renders loading spinner initially', () => {
    // game data not yet resolved
    mockGameData = new Promise(() => {}) // never resolves
    renderPage('550e8400-e29b-41d4-a716-446655440000')

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders game detail when game loads', async () => {
    mockGameData = mockGame
    renderPage('550e8400-e29b-41d4-a716-446655440000')

    await waitFor(() => {
      expect(screen.getByTestId('game-detail-title')).toHaveTextContent('Catan')
    })
  })

  it('shows error when game not found (404)', async () => {
    mockGameData = null // will cause rejection
    renderPage('non-existent-id')

    await waitFor(() => {
      expect(screen.getByTestId('game-detail-error')).toBeInTheDocument()
    })
  })
})
