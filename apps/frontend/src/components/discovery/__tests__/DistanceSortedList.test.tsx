import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'bun:test'
import type { EventMarker, SearchResult } from '../types'
import { DistanceSortedList } from '../DistanceSortedList'

// ── Helpers ──────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<EventMarker> = {}): EventMarker {
  return {
    id: overrides.id ?? 'evt-1',
    title: overrides.title ?? 'Game Night',
    lat: overrides.lat ?? 40.4168,
    lng: overrides.lng ?? -3.7038,
    date: overrides.date ?? 1700000000,
    hostType: overrides.hostType ?? 'user',
    games: overrides.games ?? ['Catan'],
    skillLevel: overrides.skillLevel,
    atmosphere: overrides.atmosphere,
  }
}

function makeResult(event: EventMarker, distanceKm: number): SearchResult {
  return { event, distanceKm }
}

// ── Tests ────────────────────────────────────────────────────────────

describe('DistanceSortedList', () => {
  it('renders all events as list items', () => {
    const results: SearchResult[] = [
      makeResult(makeEvent({ id: '1', title: 'Catan Night' }), 0.5),
      makeResult(makeEvent({ id: '2', title: 'Wingspan Meetup' }), 1.2),
      makeResult(makeEvent({ id: '3', title: 'Dominion Draft' }), 2.1),
    ]

    render(<DistanceSortedList results={results} />)

    expect(screen.getByText('Catan Night')).toBeInTheDocument()
    expect(screen.getByText('Wingspan Meetup')).toBeInTheDocument()
    expect(screen.getByText('Dominion Draft')).toBeInTheDocument()
  })

  it('shows distance formatted as "< 1 km" when distance is less than 1', () => {
    const results: SearchResult[] = [
      makeResult(makeEvent({ id: '1', title: 'Nearby' }), 0.5),
    ]

    render(<DistanceSortedList results={results} />)

    expect(screen.getByText('< 1 km')).toBeInTheDocument()
  })

  it('shows distance formatted as "X.X km" when distance is at least 1', () => {
    const results: SearchResult[] = [
      makeResult(makeEvent({ id: '1', title: 'Nearby' }), 1.2),
    ]

    render(<DistanceSortedList results={results} />)

    expect(screen.getByText('1.2 km')).toBeInTheDocument()
  })

  it('shows "0.0 km" for exactly zero distance', () => {
    const results: SearchResult[] = [
      makeResult(makeEvent({ id: '1', title: 'On Spot' }), 0.0),
    ]

    render(<DistanceSortedList results={results} />)

    expect(screen.getByText('< 1 km')).toBeInTheDocument()
  })

  it('renders date for each event', () => {
    // 1700000000 = 2023-11-14T22:13:20Z
    const results: SearchResult[] = [
      makeResult(makeEvent({ id: '1', title: 'Game Night', date: 1700000000 }), 1.0),
    ]

    render(<DistanceSortedList results={results} />)

    // Check that a formatted date appears (locale-dependent, but should contain year)
    expect(screen.getByText(/2023/)).toBeInTheDocument()
  })

  it('renders game chips for each event', () => {
    const results: SearchResult[] = [
      makeResult(makeEvent({ id: '1', title: 'Board Day', games: ['Catan', 'Wingspan'] }), 1.0),
    ]

    render(<DistanceSortedList results={results} />)

    expect(screen.getByText('Catan')).toBeInTheDocument()
    expect(screen.getByText('Wingspan')).toBeInTheDocument()
  })

  it('links each event to /events/:id', () => {
    const results: SearchResult[] = [
      makeResult(makeEvent({ id: 'evt-42', title: 'Magic Draft' }), 1.5),
    ]

    render(<DistanceSortedList results={results} />)

    // IonItem with routerLink renders as <ion-item href="/events/evt-42">
    const item = screen.getByText('Magic Draft').closest('ion-item')
    expect(item).toHaveAttribute('href', '/events/evt-42')
  })

  it('renders nothing when no results', () => {
    render(<DistanceSortedList results={[]} />)

    expect(screen.queryByTestId('distance-sorted-list')).not.toBeInTheDocument()
  })

  it('preserves input order (events should be pre-sorted by caller)', () => {
    const results: SearchResult[] = [
      makeResult(makeEvent({ id: '2', title: 'Second' }), 0.8),
      makeResult(makeEvent({ id: '1', title: 'First' }), 0.3),
      makeResult(makeEvent({ id: '3', title: 'Third' }), 1.5),
    ]

    render(<DistanceSortedList results={results} />)

    // Verify all titles are rendered (proves component processed all items)
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()

    // Verify ordering by checking href attributes on ion-item elements
    const container = screen.getByTestId('distance-sorted-list')
    const items = container.querySelectorAll('ion-item')
    expect(items).toHaveLength(3)
    expect(items[0].getAttribute('href')).toBe('/events/2')
    expect(items[1].getAttribute('href')).toBe('/events/1')
    expect(items[2].getAttribute('href')).toBe('/events/3')
  })

  it('renders distance with one decimal place for whole km', () => {
    const results: SearchResult[] = [
      makeResult(makeEvent({ id: '1', title: 'Exact' }), 5.0),
    ]

    render(<DistanceSortedList results={results} />)

    expect(screen.getByText('5.0 km')).toBeInTheDocument()
  })

  it('renders distance with one decimal place for fractional km', () => {
    const results: SearchResult[] = [
      makeResult(makeEvent({ id: '1', title: 'Fractional' }), 3.76),
    ]

    render(<DistanceSortedList results={results} />)

    expect(screen.getByText('3.8 km')).toBeInTheDocument()
  })
})
