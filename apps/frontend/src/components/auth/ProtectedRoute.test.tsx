import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { ProtectedRoute } from './ProtectedRoute'

vi.mock('../../lib/auth-client', () => {
  const useSession = vi.fn()
  ;(globalThis as unknown as Record<string, unknown>).__mockUseSession = useSession
  return {
    authClient: {
      useSession,
    },
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

function renderProtected(initialRoute = '/map') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ProtectedRoute>
        <div data-testid="protected-content">Secret Map</div>
      </ProtectedRoute>
    </MemoryRouter>,
  )
}

describe('protectedRoute', () => {
  it('shows loading spinner while session is pending', () => {
    const useSession = (globalThis as unknown as Record<string, unknown>).__mockUseSession as ReturnType<typeof vi.fn>
    useSession.mockReturnValue({ data: undefined, isPending: true })

    const { container } = renderProtected()
    // IonLoading renders inside a <template> (Ionic overlay optimization)
    const template = container.querySelector('template')
    const loading = template?.content?.querySelector('ion-loading')
    expect(loading?.getAttribute('is-open')).toBe('true')
  })

  it('redirects to /login when no session', () => {
    const useSession = (globalThis as unknown as Record<string, unknown>).__mockUseSession as ReturnType<typeof vi.fn>
    useSession.mockReturnValue({ data: null, isPending: false })

    renderProtected()
    // In React Router v5, <Redirect> renders a <Redirect> that changes the route
    // We should NOT see the protected content
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    const useSession = (globalThis as unknown as Record<string, unknown>).__mockUseSession as ReturnType<typeof vi.fn>
    useSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com' },
        session: { id: 's1' },
      },
      isPending: false,
    })

    renderProtected()
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.getByTestId('protected-content')).toHaveTextContent('Secret Map')
  })

  it('renders error state when useSession returns an error', () => {
    const useSession = (globalThis as unknown as Record<string, unknown>).__mockUseSession as ReturnType<typeof vi.fn>
    useSession.mockReturnValue({
      data: undefined,
      isPending: false,
      error: { message: 'Session check failed' },
    })

    renderProtected()
    expect(screen.getByText('Authentication Error')).toBeInTheDocument()
    expect(screen.getByText('An unexpected error occurred while checking your session.')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })
})
