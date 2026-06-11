import { describe, expect, it } from 'bun:test'
import type { EventMarker, FilterState, SearchResult } from '../../components/discovery/types'
import { getAvailableGames, useEventFilters } from '../useEventFilters'

// ── Helpers ──────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<EventMarker> = {}): EventMarker {
  return {
    id: overrides.id ?? 'evt-1',
    title: overrides.title ?? 'Game Night',
    lat: overrides.lat ?? 40.4168,
    lng: overrides.lng ?? -3.7038,
    date: overrides.date ?? 1700000000, // 2023-11-14 22:13:20 UTC
    hostType: overrides.hostType ?? 'user',
    games: overrides.games ?? ['Catan'],
    skillLevel: overrides.skillLevel,
    atmosphere: overrides.atmosphere,
  }
}

function makeResult(event: EventMarker, distanceKm: number): SearchResult {
  return { event, distanceKm }
}

// ── useEventFilters tests ─────────────────────────────────────────────

describe('useEventFilters', () => {
  const eventCatan = makeEvent({ id: '1', title: 'Catan Night', games: ['Catan'] })
  const eventWingspan = makeEvent({ id: '2', title: 'Wingspan Meetup', games: ['Wingspan'] })
  const eventBoth = makeEvent({ id: '3', title: 'Board Game Day', games: ['Catan', 'Wingspan'] })
  const eventDominion = makeEvent({ id: '4', title: 'Dominion Draft', games: ['Dominion'], date: 1700100000 })
  const eventLate = makeEvent({ id: '5', title: 'Late Night', games: ['Catan'], date: 1701000000 })
  const eventEarly = makeEvent({ id: '6', title: 'Early Birds', games: ['Wingspan'], date: 1699000000 })

  const results: SearchResult[] = [
    makeResult(eventCatan, 0.5),
    makeResult(eventWingspan, 1.2),
    makeResult(eventBoth, 1.8),
    makeResult(eventDominion, 2.1),
    makeResult(eventLate, 3.0),
    makeResult(eventEarly, 4.5),
  ]

  it('returns all results when filters are empty', () => {
    const filters: FilterState = { games: [] }
    const filtered = useEventFilters(results, filters)
    expect(filtered).toHaveLength(6)
  })

  it('filters by single game', () => {
    const filters: FilterState = { games: ['Catan'] }
    const filtered = useEventFilters(results, filters)
    expect(filtered).toHaveLength(3)
    expect(filtered.every(r => r.event.games.includes('Catan'))).toBe(true)
  })

  it('filters by multiple games (AND logic — must include ALL selected)', () => {
    const filters: FilterState = { games: ['Catan', 'Wingspan'] }
    const filtered = useEventFilters(results, filters)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].event.id).toBe('3')
    expect(filtered[0].event.games).toContain('Catan')
    expect(filtered[0].event.games).toContain('Wingspan')
  })

  it('returns empty when no event has the selected game', () => {
    const filters: FilterState = { games: ['Chess'] }
    const filtered = useEventFilters(results, filters)
    expect(filtered).toHaveLength(0)
  })

  it('filters by date range (inclusive)', () => {
    // Build events with distinct dates to test range boundaries
    const eA = makeEvent({ id: 'a', title: 'A', date: 1000000000, games: ['Catan'] })
    const eB = makeEvent({ id: 'b', title: 'B', date: 2000000000, games: ['Catan'] })
    const eC = makeEvent({ id: 'c', title: 'C', date: 3000000000, games: ['Catan'] })
    const eD = makeEvent({ id: 'd', title: 'D', date: 4000000000, games: ['Catan'] })

    const rangeResults: SearchResult[] = [
      makeResult(eA, 1),
      makeResult(eB, 2),
      makeResult(eC, 3),
      makeResult(eD, 4),
    ]

    const filters: FilterState = {
      games: [],
      dateRange: { start: 2000000000, end: 3000000000 },
    }
    const filtered = useEventFilters(rangeResults, filters)
    // eB at 2000000000 and eC at 3000000000 are within range (inclusive)
    expect(filtered).toHaveLength(2)
    expect(filtered.map(r => r.event.id).sort()).toEqual(['b', 'c'])
  })

  it('filters by date range — excludes events before start', () => {
    const filters: FilterState = {
      games: [],
      dateRange: { start: 1700500000, end: 1702000000 },
    }
    const filtered = useEventFilters(results, filters)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].event.id).toBe('5')
  })

  it('filters by date range — excludes events after end', () => {
    const filters: FilterState = {
      games: [],
      dateRange: { start: 1698000000, end: 1699500000 },
    }
    const filtered = useEventFilters(results, filters)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].event.id).toBe('6')
  })

  it('filters by skillLevel exact match', () => {
    const skillEvent = makeEvent({ id: '7', title: 'Pro League', games: ['Catan'], skillLevel: 'advanced' })
    const allResults = [...results, makeResult(skillEvent, 0.3)]
    const filters: FilterState = { games: [], skillLevel: 'advanced' }
    const filtered = useEventFilters(allResults, filters)

    expect(filtered).toHaveLength(1)
    expect(filtered[0].event.id).toBe('7')
  })

  it('excludes events without skillLevel when filter is set', () => {
    const filters: FilterState = { games: [], skillLevel: 'beginner' }
    const filtered = useEventFilters(results, filters)

    // None of the fixture events have skillLevel set
    expect(filtered).toHaveLength(0)
  })

  it('filters by atmosphere exact match', () => {
    const atmEvent = makeEvent({ id: '8', title: 'Casual Corner', games: ['Catan'], atmosphere: 'casual' })
    const allResults = [...results, makeResult(atmEvent, 0.7)]
    const filters: FilterState = { games: [], atmosphere: 'casual' }
    const filtered = useEventFilters(allResults, filters)

    expect(filtered).toHaveLength(1)
    expect(filtered[0].event.id).toBe('8')
  })

  it('filters by atmosphere — excludes events without atmosphere', () => {
    const filters: FilterState = { games: [], atmosphere: 'competitive' }
    const filtered = useEventFilters(results, filters)

    expect(filtered).toHaveLength(0)
  })

  it('combines all filter types with AND logic', () => {
    const filters: FilterState = {
      games: ['Catan'],
      dateRange: { start: 1699000000, end: 1700500000 },
      skillLevel: 'intermediate',
      atmosphere: 'casual',
    }

    const matchingEvent = makeEvent({
      id: '9',
      title: 'Perfect Match',
      games: ['Catan'],
      date: 1700000000,
      skillLevel: 'intermediate',
      atmosphere: 'casual',
    })
    const nonMatchingSkill = makeEvent({
      id: '10',
      title: 'Wrong Skill',
      games: ['Catan'],
      date: 1700000000,
      skillLevel: 'advanced',
      atmosphere: 'casual',
    })
    const nonMatchingGame = makeEvent({
      id: '11',
      title: 'Wrong Game',
      games: ['Wingspan'],
      date: 1700000000,
      skillLevel: 'intermediate',
      atmosphere: 'casual',
    })

    const allResults = [
      makeResult(matchingEvent, 1.0),
      makeResult(nonMatchingSkill, 2.0),
      makeResult(nonMatchingGame, 3.0),
    ]

    const filtered = useEventFilters(allResults, filters)

    expect(filtered).toHaveLength(1)
    expect(filtered[0].event.id).toBe('9')
  })

  it('maintains distance order after filtering', () => {
    const filters: FilterState = { games: ['Catan'] }
    const filtered = useEventFilters(results, filters)

    expect(filtered).toHaveLength(3)
    // Catan results should still be sorted by distance: 0.5, 1.8, 3.0
    expect(filtered[0].distanceKm).toBe(0.5)
    expect(filtered[1].distanceKm).toBe(1.8)
    expect(filtered[2].distanceKm).toBe(3.0)
    expect(filtered[0].event.id).toBe('1')
    expect(filtered[1].event.id).toBe('3')
    expect(filtered[2].event.id).toBe('5')
  })

  it('returns empty when all events are filtered out by date', () => {
    const filters: FilterState = {
      games: [],
      dateRange: { start: 1800000000, end: 1900000000 },
    }
    const filtered = useEventFilters(results, filters)
    expect(filtered).toHaveLength(0)
  })
})

// ── getAvailableGames tests ───────────────────────────────────────────

describe('getAvailableGames', () => {
  it('returns unique game names sorted alphabetically', () => {
    const events: SearchResult[] = [
      makeResult(makeEvent({ games: ['Catan', 'Wingspan'] }), 1),
      makeResult(makeEvent({ games: ['Dominion', 'Catan'] }), 2),
      makeResult(makeEvent({ games: ['Wingspan', 'Chess'] }), 3),
    ]

    const games = getAvailableGames(events)
    expect(games).toEqual(['Catan', 'Chess', 'Dominion', 'Wingspan'])
  })

  it('returns empty array for empty results', () => {
    expect(getAvailableGames([])).toEqual([])
  })

  it('deduplicates games across multiple events', () => {
    const events: SearchResult[] = [
      makeResult(makeEvent({ games: ['Catan'] }), 1),
      makeResult(makeEvent({ games: ['Catan'] }), 2),
      makeResult(makeEvent({ games: ['Catan', 'Wingspan'] }), 3),
    ]

    const games = getAvailableGames(events)
    expect(games).toEqual(['Catan', 'Wingspan'])
  })

  it('returns empty array when events have no games', () => {
    const events: SearchResult[] = [
      makeResult(makeEvent({ games: [] }), 1),
      makeResult(makeEvent({ games: [] }), 2),
    ]

    expect(getAvailableGames(events)).toEqual([])
  })
})
