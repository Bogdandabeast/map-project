import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'bun:test'

import { EventCard } from '../EventCard'
import type { EventData } from '../../../services/events'

// ── Test data ─────────────────────────────────────────────────────

const baseEvent: EventData = {
  id: 'evt-1',
  title: 'Game Night',
  address: 'Calle Mayor 12, Madrid',
  lat: 40.4168,
  lng: -3.7038,
  date: Date.now() + 86400000, // tomorrow
  capacity: 8,
  plannedGames: ['Catan', 'Wingspan'],
  skillLevel: 'beginner',
  atmosphere: 'Casual and friendly',
  imageKey: null,
  creatorId: 'user-1',
  createdAt: Date.now() - 86400000,
  updatedAt: Date.now() - 86400000,
  status: 'upcoming',
}

// ── Tests ─────────────────────────────────────────────────────────

describe('EventCard', () => {
  it('renders event title', () => {
    render(<EventCard event={baseEvent} />)
    expect(screen.getByTestId('event-card-title')).toHaveTextContent('Game Night')
  })

  it('renders the first planned game', () => {
    render(<EventCard event={baseEvent} />)
    expect(screen.getByTestId('event-card-game')).toHaveTextContent('Catan')
  })

  it('shows "No game specified" when plannedGames is empty', () => {
    const event = { ...baseEvent, plannedGames: [] }
    render(<EventCard event={event} />)
    expect(screen.getByTestId('event-card-game')).toHaveTextContent('No game specified')
  })

  it('shows "No game specified" when plannedGames is undefined', () => {
    const event = { ...baseEvent, plannedGames: undefined as unknown as string[] }
    render(<EventCard event={event} />)
    expect(screen.getByTestId('event-card-game')).toHaveTextContent('No game specified')
  })

  it('renders status badge with correct label', () => {
    render(<EventCard event={baseEvent} />)
    expect(screen.getByTestId('event-card-status')).toHaveTextContent('Upcoming')
  })

  it('renders cancelled status badge', () => {
    const event = { ...baseEvent, status: 'cancelled' as const }
    render(<EventCard event={event} />)
    expect(screen.getByTestId('event-card-status')).toHaveTextContent('Cancelled')
  })

  it('renders full status badge', () => {
    const event = { ...baseEvent, status: 'full' as const }
    render(<EventCard event={event} />)
    expect(screen.getByTestId('event-card-status')).toHaveTextContent('Full')
  })

  it('renders past status badge', () => {
    const event = { ...baseEvent, status: 'past' as const }
    render(<EventCard event={event} />)
    expect(screen.getByTestId('event-card-status')).toHaveTextContent('Past')
  })

  it('renders attendee count with capacity', () => {
    render(<EventCard event={baseEvent} attendeeCount={5} />)
    expect(screen.getByTestId('event-card-attendees')).toHaveTextContent('5 / 8')
  })

  it('renders address', () => {
    render(<EventCard event={baseEvent} />)
    expect(screen.getByTestId('event-card-address')).toHaveTextContent('Calle Mayor 12, Madrid')
  })

  it('fires onClick when clicked', () => {
    let clicked: EventData | null = null
    render(<EventCard event={baseEvent} onClick={e => (clicked = e)} />)
    screen.getByTestId('event-card').click()
    expect(clicked?.id).toBe('evt-1')
  })
})
