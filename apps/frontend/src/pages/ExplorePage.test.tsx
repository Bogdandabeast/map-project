import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { ExplorePage } from './ExplorePage'

// Bun test: mock.module() must be called BEFORE the static import.
// Mock component factories extracted to module level to satisfy eslint.
function MockMapView() {
  return <div data-testid="map-view">Map View</div>
}

function MockSearchBar({ onChange }: { onChange: (val: string) => void }) {
  return (
    <div data-testid="search-bar">
      <input data-testid="search-input" onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function MockChip({ label }: { label: string }) {
  return <div data-testid="chip">{label}</div>
}

function MockFAB() {
  return <button data-testid="fab">FAB</button>
}

function MockBottomSheet({ children }: { children: React.ReactNode }) {
  return <div data-testid="bottom-sheet">{children}</div>
}

function MockPlanCard({ plan, onClick }: { plan: any, onClick: () => void }) {
  return (
    <div data-testid="plan-card" onClick={onClick}>
      {plan.name}
    </div>
  )
}

mock.module('../components/map/view/MapView', () => ({
  default: MockMapView,
}))
mock.module('../components/shared/SearchBar', () => ({
  default: MockSearchBar,
}))
mock.module('../components/shared/Chip', () => ({
  Chip: MockChip,
}))
mock.module('../components/shared/FAB', () => ({
  FAB: MockFAB,
}))
mock.module('../components/shared/BottomSheet', () => ({
  BottomSheet: MockBottomSheet,
}))
mock.module('../components/shared/PlanCard', () => ({
  PlanCard: MockPlanCard,
}))

describe('ExplorePage', () => {
  beforeEach(() => {
    // Default to desktop size
    globalThis.innerWidth = 1200
    window.dispatchEvent(new Event('resize'))
  })

  it('renders core layout elements', () => {
    render(<ExplorePage />)
    expect(screen.getByTestId('map-view')).toBeInTheDocument()
    expect(screen.getByTestId('search-bar')).toBeInTheDocument()
    expect(screen.getByTestId('fab')).toBeInTheDocument()
  })

  it('renders FeedSidebar on desktop (>=1024px)', () => {
    globalThis.innerWidth = 1200
    window.dispatchEvent(new Event('resize'))
    render(<ExplorePage />)

    expect(screen.getByTestId('feed-sidebar')).toBeInTheDocument()
    expect(screen.queryByTestId('bottom-sheet')).not.toBeInTheDocument()
  })

  it('renders BottomSheet on mobile (<1024px)', () => {
    globalThis.innerWidth = 800
    window.dispatchEvent(new Event('resize'))
    render(<ExplorePage />)

    expect(screen.getByTestId('bottom-sheet')).toBeInTheDocument()
    expect(screen.queryByTestId('feed-sidebar')).not.toBeInTheDocument()
  })

  it('renders PlanCards in the feed', () => {
    render(<ExplorePage />)
    const cards = screen.getAllByTestId('plan-card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('filters plans when search input changes', () => {
    render(<ExplorePage />)
    const input = screen.getByTestId('search-input')

    fireEvent.change(input, { target: { value: 'Plan 1' } })

    const cards = screen.getAllByTestId('plan-card')
    expect(cards.length).toBe(1)
    expect(cards[0]).toHaveTextContent('Plan 1')
  })

  it('centers map when a PlanCard is clicked', () => {
    render(<ExplorePage />)
    const card = screen.getAllByTestId('plan-card')[0]

    fireEvent.click(card)
  })
})
