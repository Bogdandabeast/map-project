import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { EventMarker, SearchResult } from '../components/discovery/types'
import { useMapStore } from '../components/map/model/stores/mapStore'

// ── Mock MapView ─────────────────────────────────────────────────────

let eventsPassedToMapView: EventMarker[] | undefined

function MockMapView({ events }: { events?: EventMarker[] }) {
  eventsPassedToMapView = events
  return <div data-testid="map-view">Map View</div>
}

mock.module('../components/map/view/MapView', () => ({
  default: MockMapView,
}))

mock.module('../components/auth/AuthProvider', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    isPending: false,
    session: null,
  }),
}))

// ── Mock useRadarSearch to read from store ────────────────────────────

mock.module('../hooks/useRadarSearch', () => ({
  useRadarSearch: () => {
    const state = useMapStore.getState()
    return {
      search: () => { /* no-op — trigger is tested via button click */ },
      isLoading: state.isLoading,
      error: state.error,
      results: state.searchResults,
    }
  },
}))

// ── Mock useEventFilters as passthrough ────────────────────────────────

mock.module('../hooks/useEventFilters', () => ({
  useEventFilters: (results: SearchResult[]) => results,
  getAvailableGames: () => [] as string[],
}))

// ── Default store state ───────────────────────────────────────────────

const DEFAULT_STORE = {
  map: null,
  center: [-3.7038, 40.4168] as [number, number],
  zoom: 6,
  searchRadius: 5,
  searchResults: [] as SearchResult[],
  filters: { games: [] as string[] },
  isLoading: false,
  error: null as string | null,
}

beforeEach(() => {
  useMapStore.setState({ ...DEFAULT_STORE })
  eventsPassedToMapView = undefined
})

afterEach(() => {
  useMapStore.setState({ ...DEFAULT_STORE })
})

// ── Helpers ───────────────────────────────────────────────────────────

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

/** Triggers a search by clicking the "Search here" button, setting hasSearched=true */
function triggerSearch() {
  fireEvent.click(screen.getByTestId('search-here-button'))
}

// ── Import after all mocks ────────────────────────────────────────────

import { ExplorePage } from './ExplorePage'

// ── Tests ─────────────────────────────────────────────────────────────

describe('ExplorePage', () => {
  // ── Map visibility ──

  it('renders the map at all times', () => {
    render(<ExplorePage />)
    expect(screen.getByTestId('map-view')).toBeInTheDocument()
  })

  // ── Initial state ──

  it('shows InitialPrompt when no search has been performed', () => {
    render(<ExplorePage />)

    expect(screen.getByTestId('initial-prompt')).toBeInTheDocument()
    expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument()
    expect(screen.queryByTestId('empty-results')).not.toBeInTheDocument()
    expect(screen.queryByTestId('error-state')).not.toBeInTheDocument()
  })

  // ── Loading state ──

  it('shows SkeletonCard when search is loading', () => {
    useMapStore.setState({ isLoading: true })
    render(<ExplorePage />)

    // Trigger search to set hasSearched=true
    triggerSearch()

    expect(screen.getByTestId('skeleton-card-container')).toBeInTheDocument()
    expect(screen.queryByTestId('initial-prompt')).not.toBeInTheDocument()
  })

  // ── Results state ──

  it('shows FilterChips and DistanceSortedList when results exist', () => {
    const event = makeEvent({ id: '1', title: 'Catan Night' })
    const results: SearchResult[] = [makeResult(event, 1.5)]
    useMapStore.setState({ searchResults: results })

    render(<ExplorePage />)
    triggerSearch()

    expect(screen.getByTestId('filter-chips')).toBeInTheDocument()
    expect(screen.getByTestId('distance-sorted-list')).toBeInTheDocument()
    expect(screen.queryByTestId('initial-prompt')).not.toBeInTheDocument()
  })

  it('renders event titles in the results list', () => {
    const results: SearchResult[] = [
      makeResult(makeEvent({ id: '1', title: 'Catan Night' }), 0.5),
      makeResult(makeEvent({ id: '2', title: 'Wingspan Meetup' }), 1.2),
    ]
    useMapStore.setState({ searchResults: results })

    render(<ExplorePage />)
    triggerSearch()

    expect(screen.getByText('Catan Night')).toBeInTheDocument()
    expect(screen.getByText('Wingspan Meetup')).toBeInTheDocument()
  })

  // ── Empty state ──

  it('shows EmptyResults when search completes with no results', () => {
    useMapStore.setState({ searchResults: [] })

    render(<ExplorePage />)
    triggerSearch()

    expect(screen.getByTestId('empty-results')).toBeInTheDocument()
    expect(screen.queryByTestId('initial-prompt')).not.toBeInTheDocument()
    expect(screen.queryByTestId('filter-chips')).not.toBeInTheDocument()
  })

  // ── Error state ──

  it('shows ErrorState when an error occurs', () => {
    useMapStore.setState({
      error: 'Network Error: Failed to fetch events',
      searchResults: [],
    })

    render(<ExplorePage />)
    triggerSearch()

    expect(screen.getByTestId('error-state')).toBeInTheDocument()
    expect(screen.getByTestId('error-state-message')).toHaveTextContent(
      'Network Error: Failed to fetch events',
    )
  })

  // ── Map markers ──

  it('passes event markers to MapView when results are available', () => {
    const results: SearchResult[] = [
      makeResult(makeEvent({ id: '1', title: 'Catan Night', lat: 40.4, lng: -3.7 }), 0.5),
      makeResult(makeEvent({ id: '2', title: 'Wingspan Meetup', lat: 40.5, lng: -3.8 }), 1.2),
    ]
    useMapStore.setState({ searchResults: results })

    render(<ExplorePage />)
    triggerSearch()

    // MapView should receive event markers extracted from search results
    expect(eventsPassedToMapView).toBeDefined()
    expect(eventsPassedToMapView).toHaveLength(2)
    expect(eventsPassedToMapView![0].id).toBe('1')
    expect(eventsPassedToMapView![0].lat).toBe(40.4)
    expect(eventsPassedToMapView![0].lng).toBe(-3.7)
    expect(eventsPassedToMapView![1].id).toBe('2')
  })

  // ── Map remains visible in all states ──

  it('map is visible in loading state', () => {
    useMapStore.setState({ isLoading: true })
    render(<ExplorePage />)
    triggerSearch()
    expect(screen.getByTestId('map-view')).toBeInTheDocument()
  })

  it('map is visible in error state', () => {
    useMapStore.setState({ error: 'Network Error' })
    render(<ExplorePage />)
    triggerSearch()
    expect(screen.getByTestId('map-view')).toBeInTheDocument()
  })

  it('map is visible when showing results', () => {
    useMapStore.setState({
      searchResults: [makeResult(makeEvent({ id: '1', title: 'Test' }), 1.0)],
    })
    render(<ExplorePage />)
    triggerSearch()
    expect(screen.getByTestId('map-view')).toBeInTheDocument()
  })

  // ── Search trigger ──

  it('renders a search trigger button', () => {
    render(<ExplorePage />)
    expect(screen.getByTestId('search-here-button')).toBeInTheDocument()
  })

  // ── Edge cases ──

  it('disables search button while loading', () => {
    useMapStore.setState({ isLoading: true })
    render(<ExplorePage />)
    triggerSearch()

    const button = screen.getByTestId('search-here-button')
    // IonButton passes disabled to the inner native button
    expect(button.hasAttribute('disabled')).toBe(true)
  })

  it('renders discovery panel container', () => {
    render(<ExplorePage />)
    expect(screen.getByTestId('discovery-panel')).toBeInTheDocument()
  })

  it('shows ErrorState without requiring search trigger when error exists at mount', () => {
    useMapStore.setState({
      error: 'Pre-existing error',
      searchResults: [],
    })

    render(<ExplorePage />)

    // Error takes priority — should show even without triggering search
    expect(screen.getByTestId('error-state')).toBeInTheDocument()
  })

  it('search button is enabled when not loading', () => {
    useMapStore.setState({ isLoading: false })
    render(<ExplorePage />)

    const button = screen.getByTestId('search-here-button')
    // When isLoading=false, disabled prop is undefined → no disabled attribute
    expect(button.hasAttribute('disabled')).toBe(false)
  })
})
