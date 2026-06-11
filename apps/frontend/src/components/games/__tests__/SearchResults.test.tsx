import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'
import { MemoryRouter } from 'react-router-dom'

import { SearchResults } from '../SearchResults'
import type { GameSearchResult } from '@repo/types'

// ── Test data ─────────────────────────────────────────────────────

const game1: GameSearchResult = {
  id: '11111111-1111-4111-a111-111111111111',
  title: 'Catan',
  minPlayers: 3,
  maxPlayers: 4,
  duration: 90,
  coverImage: 'https://example.com/catan.jpg',
  source: 'manual',
  accessCount: 42,
}

const game2: GameSearchResult = {
  id: '22222222-2222-4222-a222-222222222222',
  title: 'Wingspan',
  minPlayers: 1,
  maxPlayers: 5,
  duration: 70,
  coverImage: null,
  source: 'bgg',
  accessCount: 15,
}

// ── Tests ─────────────────────────────────────────────────────────

describe('SearchResults', () => {
  afterEach(cleanup)

  it('renders all game titles from results', () => {
    render(
      <MemoryRouter>
        <SearchResults results={[game1, game2]} source="d1" />
      </MemoryRouter>,
    )
    expect(screen.getByText('Catan')).toBeInTheDocument()
    expect(screen.getByText('Wingspan')).toBeInTheDocument()
  })

  it('renders rank numbers for each result', () => {
    render(
      <MemoryRouter>
        <SearchResults results={[game1, game2]} source="bgg" />
      </MemoryRouter>,
    )
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
  })

  it('shows D1 badge for game with manual source', () => {
    render(
      <MemoryRouter>
        <SearchResults results={[game1]} source="d1" />
      </MemoryRouter>,
    )
    const badge = screen.getByTestId('search-result-badge')
    expect(badge).toHaveTextContent('D1')
  })

  it('shows BGG badge for game with bgg source', () => {
    render(
      <MemoryRouter>
        <SearchResults results={[game2]} source="bgg" />
      </MemoryRouter>,
    )
    const badge = screen.getByTestId('search-result-badge')
    expect(badge).toHaveTextContent('BGG')
  })

  it('renders nothing for empty results array', () => {
    render(
      <MemoryRouter>
        <SearchResults results={[]} source="d1" />
      </MemoryRouter>,
    )
    expect(screen.queryByText('Catan')).not.toBeInTheDocument()
    expect(screen.queryByText('#1')).not.toBeInTheDocument()
  })

  it('shows correct badges for mixed manual and bgg sources', () => {
    render(
      <MemoryRouter>
        <SearchResults results={[game1, game2]} source="d1" />
      </MemoryRouter>,
    )
    const badges = screen.getAllByTestId('search-result-badge')
    expect(badges).toHaveLength(2)
    expect(badges[0]).toHaveTextContent('D1')
    expect(badges[1]).toHaveTextContent('BGG')
  })
})
