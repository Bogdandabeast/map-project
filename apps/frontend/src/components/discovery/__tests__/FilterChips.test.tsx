import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { useMapStore } from '../../map/model/stores/mapStore'
import { FilterChips } from '../FilterChips'

// ── Setup ────────────────────────────────────────────────────────────

const DEFAULT_FILTERS = { games: [] as string[] }

beforeEach(() => {
  useMapStore.setState({
    filters: { ...DEFAULT_FILTERS },
  })
})

afterEach(() => {
  useMapStore.setState({
    filters: { ...DEFAULT_FILTERS },
  })
})

// ── Helpers ──────────────────────────────────────────────────────────

function renderFilterChips(availableGames: string[] = []) {
  return render(<FilterChips availableGames={availableGames} />)
}

// ── Tests ────────────────────────────────────────────────────────────

describe('FilterChips', () => {
  // ── Date preset chips ──

  it('renders Today, Tomorrow, and This weekend date preset chips', () => {
    renderFilterChips()

    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Tomorrow')).toBeInTheDocument()
    expect(screen.getByText('This weekend')).toBeInTheDocument()
  })

  it('sets dateRange to today when Today chip is clicked', () => {
    renderFilterChips()

    fireEvent.click(screen.getByText('Today'))

    const filters = useMapStore.getState().filters
    expect(filters.dateRange).toBeDefined()
    const now = Date.now() / 1000
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    expect(filters.dateRange!.start).toBe(Math.floor(todayStart.getTime() / 1000))
    // End should be today 23:59:59
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 0)
    expect(filters.dateRange!.end).toBe(Math.floor(todayEnd.getTime() / 1000))
  })

  it('clears dateRange when Today chip is clicked again (toggle off)', () => {
    // First set a date range matching today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 0)

    useMapStore.setState({
      filters: {
        games: [],
        dateRange: {
          start: Math.floor(todayStart.getTime() / 1000),
          end: Math.floor(todayEnd.getTime() / 1000),
        },
      },
    })

    renderFilterChips()

    fireEvent.click(screen.getByText('Today'))

    const filters = useMapStore.getState().filters
    expect(filters.dateRange).toBeUndefined()
  })

  it('computes Tomorrow date range correctly', () => {
    renderFilterChips()

    fireEvent.click(screen.getByText('Tomorrow'))

    const filters = useMapStore.getState().filters
    expect(filters.dateRange).toBeDefined()

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    expect(filters.dateRange!.start).toBe(Math.floor(tomorrow.getTime() / 1000))

    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 0)
    expect(filters.dateRange!.end).toBe(Math.floor(tomorrowEnd.getTime() / 1000))
  })

  it('computes This weekend date range correctly (Sat 00:00 to Sun 23:59)', () => {
    renderFilterChips()

    fireEvent.click(screen.getByText('This weekend'))

    const filters = useMapStore.getState().filters
    expect(filters.dateRange).toBeDefined()

    const now = new Date()
    const dayOfWeek = now.getDay() // 0=Sun, 6=Sat
    const daysUntilSaturday = dayOfWeek === 6 ? 0 : 6 - dayOfWeek

    const saturday = new Date(now)
    saturday.setDate(now.getDate() + daysUntilSaturday)
    saturday.setHours(0, 0, 0, 0)

    const sunday = new Date(saturday)
    sunday.setDate(saturday.getDate() + 1)
    sunday.setHours(23, 59, 59, 0)

    expect(filters.dateRange!.start).toBe(Math.floor(saturday.getTime() / 1000))
    expect(filters.dateRange!.end).toBe(Math.floor(sunday.getTime() / 1000))
  })

  // ── Skill level chips ──

  it('renders skill level chips (beginner, intermediate, advanced)', () => {
    renderFilterChips()

    expect(screen.getByText('Beginner')).toBeInTheDocument()
    expect(screen.getByText('Intermediate')).toBeInTheDocument()
    expect(screen.getByText('Advanced')).toBeInTheDocument()
  })

  it('sets skillLevel filter when skill chip is clicked', () => {
    renderFilterChips()

    fireEvent.click(screen.getByText('Intermediate'))

    const filters = useMapStore.getState().filters
    expect(filters.skillLevel).toBe('intermediate')
  })

  it('clears skillLevel when same chip is clicked again', () => {
    useMapStore.setState({
      filters: { games: [], skillLevel: 'beginner' },
    })

    renderFilterChips()

    fireEvent.click(screen.getByText('Beginner'))

    const filters = useMapStore.getState().filters
    expect(filters.skillLevel).toBeUndefined()
  })

  it('switches skillLevel when a different skill chip is clicked', () => {
    useMapStore.setState({
      filters: { games: [], skillLevel: 'beginner' },
    })

    renderFilterChips()

    fireEvent.click(screen.getByText('Advanced'))

    const filters = useMapStore.getState().filters
    expect(filters.skillLevel).toBe('advanced')
  })

  // ── Atmosphere chips ──

  it('renders atmosphere chips (casual, competitive)', () => {
    renderFilterChips()

    expect(screen.getByText('Casual')).toBeInTheDocument()
    expect(screen.getByText('Competitive')).toBeInTheDocument()
  })

  it('sets atmosphere filter when atmosphere chip is clicked', () => {
    renderFilterChips()

    fireEvent.click(screen.getByText('Casual'))

    const filters = useMapStore.getState().filters
    expect(filters.atmosphere).toBe('casual')
  })

  it('clears atmosphere when same chip is clicked again', () => {
    useMapStore.setState({
      filters: { games: [], atmosphere: 'competitive' },
    })

    renderFilterChips()

    fireEvent.click(screen.getByText('Competitive'))

    const filters = useMapStore.getState().filters
    expect(filters.atmosphere).toBeUndefined()
  })

  // ── Game chips ──

  it('renders game chips from availableGames prop', () => {
    renderFilterChips(['Catan', 'Wingspan', 'Dominion'])

    expect(screen.getByText('Catan')).toBeInTheDocument()
    expect(screen.getByText('Wingspan')).toBeInTheDocument()
    expect(screen.getByText('Dominion')).toBeInTheDocument()
  })

  it('renders no game chips when availableGames is empty', () => {
    renderFilterChips([])

    // Only date presets and skill/atmosphere chips should be present
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.queryByText('Catan')).not.toBeInTheDocument()
  })

  it('adds game to filters when game chip is clicked', () => {
    renderFilterChips(['Catan', 'Wingspan'])

    fireEvent.click(screen.getByText('Catan'))

    const filters = useMapStore.getState().filters
    expect(filters.games).toContain('Catan')
    expect(filters.games).toHaveLength(1)
  })

  it('adds multiple games to filter (AND logic — chips are additive)', () => {
    renderFilterChips(['Catan', 'Wingspan', 'Dominion'])

    fireEvent.click(screen.getByText('Catan'))
    fireEvent.click(screen.getByText('Wingspan'))

    const filters = useMapStore.getState().filters
    expect(filters.games).toContain('Catan')
    expect(filters.games).toContain('Wingspan')
    expect(filters.games).toHaveLength(2)
  })

  it('removes game from filters when clicked again', () => {
    useMapStore.setState({
      filters: { games: ['Catan', 'Wingspan'] },
    })

    renderFilterChips(['Catan', 'Wingspan'])

    fireEvent.click(screen.getByText('Catan'))

    const filters = useMapStore.getState().filters
    expect(filters.games).not.toContain('Catan')
    expect(filters.games).toContain('Wingspan')
    expect(filters.games).toHaveLength(1)
  })

  // ── Clear filters ──

  it('renders "Clear filters" button', () => {
    renderFilterChips()

    expect(screen.getByText('Clear filters')).toBeInTheDocument()
  })

  it('resets all filters when "Clear filters" is clicked', () => {
    useMapStore.setState({
      filters: {
        games: ['Catan'],
        dateRange: { start: 1700000000, end: 1700100000 },
        skillLevel: 'beginner',
        atmosphere: 'casual',
      },
    })

    renderFilterChips(['Catan'])

    fireEvent.click(screen.getByText('Clear filters'))

    const filters = useMapStore.getState().filters
    expect(filters.games).toEqual([])
    expect(filters.dateRange).toBeUndefined()
    expect(filters.skillLevel).toBeUndefined()
    expect(filters.atmosphere).toBeUndefined()
  })
})
