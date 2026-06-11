import { describe, expect, it } from 'bun:test'
import type { EventMarker, FilterState, SearchParams, SearchResult } from './types'

describe('discovery types', () => {
  it('EventMarker type accepts a user-hosted event', () => {
    const marker: EventMarker = {
      id: 'evt-1',
      title: 'Catan Night',
      lat: -34.6037,
      lng: -58.3816,
      date: 1700000000,
      hostType: 'user',
      games: ['Catan', 'Wingspan'],
    }

    expect(marker.id).toBe('evt-1')
    expect(marker.title).toBe('Catan Night')
    expect(marker.lat).toBe(-34.6037)
    expect(marker.lng).toBe(-58.3816)
    expect(marker.date).toBe(1700000000)
    expect(marker.hostType).toBe('user')
    expect(marker.games).toEqual(['Catan', 'Wingspan'])
  })

  it('EventMarker type accepts optional fields', () => {
    const marker: EventMarker = {
      id: 'evt-2',
      title: 'Board Game Afternoon',
      lat: 40.4168,
      lng: -3.7038,
      date: 1710000000,
      hostType: 'venue',
      games: ['Dominion'],
      skillLevel: 'intermediate',
      atmosphere: 'competitive',
    }

    expect(marker.hostType).toBe('venue')
    expect(marker.skillLevel).toBe('intermediate')
    expect(marker.atmosphere).toBe('competitive')
  })

  it('SearchParams type accepts center and radius', () => {
    const params: SearchParams = {
      center: [-58.3816, -34.6037],
      radiusKm: 5,
    }

    expect(params.center).toEqual([-58.3816, -34.6037])
    expect(params.radiusKm).toBe(5)
  })

  it('FilterState type defaults correctly', () => {
    const filters: FilterState = {
      games: [],
    }

    expect(filters.games).toEqual([])
    expect(filters.dateRange).toBeUndefined()
    expect(filters.skillLevel).toBeUndefined()
    expect(filters.atmosphere).toBeUndefined()
  })

  it('FilterState type accepts all optional fields', () => {
    const filters: FilterState = {
      games: ['Catan'],
      dateRange: { start: 1700000000, end: 1705000000 },
      skillLevel: 'beginner',
      atmosphere: 'casual',
    }

    expect(filters.games).toEqual(['Catan'])
    expect(filters.dateRange).toEqual({ start: 1700000000, end: 1705000000 })
    expect(filters.skillLevel).toBe('beginner')
    expect(filters.atmosphere).toBe('casual')
  })

  it('SearchResult type combines event and distance', () => {
    const event: EventMarker = {
      id: 'evt-3',
      title: 'Magic Draft',
      lat: -34.5,
      lng: -58.3,
      date: 1720000000,
      hostType: 'user',
      games: ['Magic: The Gathering'],
    }
    const result: SearchResult = {
      event,
      distanceKm: 2.5,
    }

    expect(result.event.id).toBe('evt-3')
    expect(result.event.title).toBe('Magic Draft')
    expect(result.distanceKm).toBe(2.5)
  })
})
