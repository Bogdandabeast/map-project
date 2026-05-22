import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

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
    const loading = container.querySelector('ion-loading')
    expect(loading).toHaveAttribute('is-open', 'true')
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
})
