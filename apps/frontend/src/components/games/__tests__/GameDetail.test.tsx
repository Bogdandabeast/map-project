import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'
import { MemoryRouter } from 'react-router-dom'

import { GameDetail } from '../GameDetail'
import type { Game } from '@repo/types'

// ── Test data ─────────────────────────────────────────────────────

const fullGame: Game = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Catan',
  description: 'A classic trading and building game set on the island of Catan.',
  minPlayers: 3,
  maxPlayers: 4,
  duration: 90,
  coverImage: 'https://example.com/catan.jpg',
  imageUrl: 'https://example.com/catan-full.jpg',
  bggId: 13,
  accessCount: 42,
  source: 'manual',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const minimalGame: Game = {
  id: '660e8400-e29b-41d4-a716-446655440001',
  title: 'Unknown Game',
  description: null,
  minPlayers: null,
  maxPlayers: null,
  duration: null,
  coverImage: null,
  imageUrl: null,
  bggId: null,
  accessCount: 0,
  source: 'manual',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

// ── Tests ─────────────────────────────────────────────────────────

describe('GameDetail', () => {
  afterEach(cleanup)

  it('renders the game title', () => {
    render(
      <MemoryRouter>
        <GameDetail game={fullGame} />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('game-detail-title')).toHaveTextContent('Catan')
  })

  it('renders cover image when present', () => {
    render(
      <MemoryRouter>
        <GameDetail game={fullGame} />
      </MemoryRouter>,
    )
    const img = screen.getByTestId('game-detail-cover')
    expect(img.getAttribute('src')).toBe('https://example.com/catan.jpg')
    expect(img.getAttribute('alt')).toBe('Catan')
  })

  it('renders placeholder when coverImage is null', () => {
    render(
      <MemoryRouter>
        <GameDetail game={minimalGame} />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('game-detail-cover-placeholder')).toBeInTheDocument()
  })

  it('renders player range', () => {
    render(
      <MemoryRouter>
        <GameDetail game={fullGame} />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('game-detail-players')).toHaveTextContent('3-4 players')
  })

  it('hides player info when both values are null', () => {
    render(
      <MemoryRouter>
        <GameDetail game={minimalGame} />
      </MemoryRouter>,
    )
    expect(screen.queryByTestId('game-detail-players')).not.toBeInTheDocument()
  })

  it('renders duration', () => {
    render(
      <MemoryRouter>
        <GameDetail game={fullGame} />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('game-detail-duration')).toHaveTextContent('90 min')
  })

  it('hides duration when null', () => {
    render(
      <MemoryRouter>
        <GameDetail game={minimalGame} />
      </MemoryRouter>,
    )
    expect(screen.queryByTestId('game-detail-duration')).not.toBeInTheDocument()
  })

  it('renders game description', () => {
    render(
      <MemoryRouter>
        <GameDetail game={fullGame} />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('game-detail-description')).toHaveTextContent(
      'A classic trading and building game set on the island of Catan.',
    )
  })

  it('shows "No description available" when description is null', () => {
    render(
      <MemoryRouter>
        <GameDetail game={minimalGame} />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('game-detail-description')).toHaveTextContent(
      'No description available',
    )
  })

  it('renders a back navigation button', () => {
    render(
      <MemoryRouter>
        <GameDetail game={fullGame} />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('game-detail-back')).toBeInTheDocument()
  })
})
