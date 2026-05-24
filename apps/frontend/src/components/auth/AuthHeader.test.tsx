import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { AuthHeader } from './AuthHeader'

vi.mock('../../lib/auth-client', () => {
  const mockUseSession = vi.fn()
  const mockSignOut = vi.fn()
  ;(globalThis as unknown as Record<string, unknown>).__mockUseSession = mockUseSession
  ;(globalThis as unknown as Record<string, unknown>).__mockSignOut = mockSignOut
  return {
    authClient: {
      useSession: mockUseSession,
      signOut: mockSignOut,
    },
  }
})

function getMockUseSession() {
  return (globalThis as unknown as Record<string, unknown>).__mockUseSession as ReturnType<typeof vi.fn>
}

beforeEach(() => {
  vi.clearAllMocks()
})

function renderHeader() {
  return render(
    <MemoryRouter>
      <AuthHeader />
    </MemoryRouter>,
  )
}

describe('authHeader (unauthenticated)', () => {
  beforeEach(() => {
    getMockUseSession().mockReturnValue({ data: null, isPending: false })
  })

  it('renders Sign In link when no session', () => {
    renderHeader()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('renders Sign Up link when no session', () => {
    renderHeader()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('does not render Sign Out when no session', () => {
    renderHeader()
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument()
  })
})

describe('authHeader (authenticated)', () => {
  beforeEach(() => {
    getMockUseSession().mockReturnValue({
      data: {
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        session: { id: 's1' },
      },
      isPending: false,
    })
  })

  it('renders user name when authenticated', () => {
    renderHeader()
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('renders Map link when authenticated', () => {
    renderHeader()
    expect(screen.getByText('Map')).toBeInTheDocument()
  })

  it('renders Sign Out button when authenticated', () => {
    renderHeader()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })
})
