import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { MemoryRouter } from 'react-router-dom'

import { GameCard } from '../GameCard'
import type { GameSearchResult } from '@repo/types'

// ── Test data ─────────────────────────────────────────────────────

const baseGame: GameSearchResult = {
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

describe('GameCard', () => {
  afterEach(cleanup)

  it('renders the game title', () => {
    render(
      <MemoryRouter>
        <GameCard game={baseGame} />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('game-card-title')).toHaveTextContent('Catan')
  })

  it('renders cover image with correct src when present', () => {
    render(
      <MemoryRouter>
        <GameCard game={baseGame} />
      </MemoryRouter>,
    )
    const img = screen.getByTestId('game-card-cover') as HTMLImageElement
    expect(img.src).toBe('https://example.com/catan.jpg')
    expect(img.alt).toBe('Catan')
  })

  it('renders a placeholder when coverImage is null', () => {
    const game = { ...baseGame, coverImage: null }
    render(
      <MemoryRouter>
        <GameCard game={game} />
      </MemoryRouter>,
    )
    // Placeholder should have a different data-testid or fallback behavior
    const placeholder = screen.getByTestId('game-card-cover-placeholder')
    expect(placeholder).toBeInTheDocument()
  })

  it('renders player range when min and max differ', () => {
    render(
      <MemoryRouter>
        <GameCard game={baseGame} />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('game-card-players')).toHaveTextContent('3-4 players')
  })

  it('renders single player count when min equals max', () => {
    const game = { ...baseGame, minPlayers: 2, maxPlayers: 2 }
    render(
      <MemoryRouter>
        <GameCard game={game} />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('game-card-players')).toHaveTextContent('2 players')
  })

  it('renders nothing for player count when both are null', () => {
    const game = { ...baseGame, minPlayers: null, maxPlayers: null }
    render(
      <MemoryRouter>
        <GameCard game={game} />
      </MemoryRouter>,
    )
    expect(screen.queryByTestId('game-card-players')).not.toBeInTheDocument()
  })

  it('renders duration in minutes', () => {
    render(
      <MemoryRouter>
        <GameCard game={baseGame} />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('game-card-duration')).toHaveTextContent('90 min')
  })

  it('does not render duration when null', () => {
    const game = { ...baseGame, duration: null }
    render(
      <MemoryRouter>
        <GameCard game={game} />
      </MemoryRouter>,
    )
    expect(screen.queryByTestId('game-card-duration')).not.toBeInTheDocument()
  })

  it('has a link to the game detail page', () => {
    render(
      <MemoryRouter>
        <GameCard game={baseGame} />
      </MemoryRouter>,
    )
    const link = screen.getByTestId('game-card-link')
    expect(link).toBeInTheDocument()
    expect(link.getAttribute('href')).toBe('/games/550e8400-e29b-41d4-a716-446655440000')
  })
})
