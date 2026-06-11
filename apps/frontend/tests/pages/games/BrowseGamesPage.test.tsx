import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { MemoryRouter } from 'react-router-dom'
import type { Game } from '@repo/types'

// ── Mock auth ──────────────────────────────────────────────────────
mock.module('../../../src/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
    isPending: false,
    session: {},
  }),
}))

// ── Mock games service — mutable ──────────────────────────────────
let mockPopularGames: Game[] = []
let mockRecentGames: Game[] = []

mock.module('../../../src/services/games', () => ({
  searchGames: () => Promise.resolve({ source: 'd1', results: [] }),
  getGameById: () => Promise.resolve({}),
  getPopularGames: () => Promise.resolve(mockPopularGames),
  getRecentGames: () => Promise.resolve(mockRecentGames),
}))

import { BrowseGamesPage } from '../../../src/pages/BrowseGamesPage'

// ── Test data ─────────────────────────────────────────────────────

const game1: Game = {
  id: '11111111-1111-4111-a111-111111111111',
  title: 'Catan',
  description: null,
  imageUrl: null,
  minPlayers: 3,
  maxPlayers: 4,
  duration: 90,
  coverImage: null,
  bggId: null,
  source: 'manual',
  accessCount: 42,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const game2: Game = {
  id: '22222222-2222-4222-a222-222222222222',
  title: 'Wingspan',
  description: null,
  imageUrl: null,
  minPlayers: 1,
  maxPlayers: 5,
  duration: 70,
  coverImage: null,
  bggId: null,
  source: 'bgg',
  accessCount: 15,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

// happy-dom does not propagate .value on custom elements — set it explicitly before dispatching
function switchTab(value: string) {
  const segment = screen.getByTestId('browse-segment') as any
  Object.defineProperty(segment, 'value', { value, writable: true, configurable: true })
  fireEvent(segment, new CustomEvent('ionChange', {
    detail: { value },
    bubbles: true,
    cancelable: true,
  }))
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/games/browse']}>
      <BrowseGamesPage />
    </MemoryRouter>,
  )
}

// ── Tests ─────────────────────────────────────────────────────────

describe('BrowseGamesPage', () => {
  afterEach(() => {
    cleanup()
    mockPopularGames = []
    mockRecentGames = []
  })

  it('renders Popular and Recent tabs', () => {
    renderPage()
    expect(screen.getByTestId('browse-tab-popular')).toBeInTheDocument()
    expect(screen.getByTestId('browse-tab-recent')).toBeInTheDocument()
  })

  it('loads and shows popular games by default', async () => {
    mockPopularGames = [game1, game2]
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Catan')).toBeInTheDocument()
      expect(screen.getByText('Wingspan')).toBeInTheDocument()
    })
  })

  it('switches to recent tab and loads recent games', async () => {
    mockRecentGames = [game2]
    mockPopularGames = [game1]

    renderPage()

    // Wait for initial popular load to complete
    await waitFor(() => {
      expect(screen.getByText('Catan')).toBeInTheDocument()
    })

    switchTab('recent')

    await waitFor(() => {
      expect(screen.getByText('Wingspan')).toBeInTheDocument()
    })
  })

  it('shows empty state when no popular games exist', async () => {
    mockPopularGames = []
    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('empty-state-message')).toBeInTheDocument()
    })
  })

  it('shows empty state when no recent games exist', async () => {
    mockPopularGames = []
    mockRecentGames = []
    renderPage()

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('empty-state-message')).toBeInTheDocument()
    })

    switchTab('recent')

    await waitFor(() => {
      expect(screen.getByTestId('empty-state-message')).toBeInTheDocument()
    })
  })
})
