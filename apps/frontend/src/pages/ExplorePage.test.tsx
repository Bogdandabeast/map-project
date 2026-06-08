import { render, screen } from '@testing-library/react'
import { describe, expect, it, mock } from 'bun:test'

import { ExplorePage } from './ExplorePage'

function MockMapView() {
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

mock.module('../components/auth/OAuthButtons', () => ({
  OAuthButtons: () => <div data-testid="oauth-buttons">OAuth</div>,
}))

describe('ExplorePage', () => {
  it('renders the map', () => {
    render(<ExplorePage />)
    expect(screen.getByTestId('map-view')).toBeInTheDocument()
  })

  it('shows OAuth buttons when not authenticated', () => {
    render(<ExplorePage />)
    expect(screen.getByTestId('oauth-buttons')).toBeInTheDocument()
  })
})
