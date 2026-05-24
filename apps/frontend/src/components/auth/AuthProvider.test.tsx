import { render, screen } from '@testing-library/react'

import { AuthProvider } from './AuthProvider'

vi.mock('../../lib/auth-client', () => {
  const getSession = vi.fn()
  ;(globalThis as unknown as Record<string, unknown>).__mockGetSession = getSession
  return {
    authClient: {
      getSession,
    },
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('authProvider', () => {
  it('shows loading spinner while session check is pending', () => {
    const getSession = (globalThis as unknown as Record<string, unknown>).__mockGetSession as ReturnType<typeof vi.fn>
    getSession.mockReturnValue(new Promise(() => {}))

    const { container } = render(
      <AuthProvider>
        <div data-testid="child">Protected Content</div>
      </AuthProvider>,
    )

    const loading = container.querySelector('ion-loading')
    expect(loading).not.toBeNull()
    expect(loading?.getAttribute('is-open')).toBe('true')
  })

  it('renders children when session check resolves', async () => {
    const getSession = (globalThis as unknown as Record<string, unknown>).__mockGetSession as ReturnType<typeof vi.fn>
    getSession.mockResolvedValue({ data: null })

    render(
      <AuthProvider>
        <div data-testid="child">Protected Content</div>
      </AuthProvider>,
    )

    const child = await screen.findByTestId('child')
    expect(child).toBeInTheDocument()
    expect(child).toHaveTextContent('Protected Content')
  })

  it('renders children when authenticated', async () => {
    const getSession = (globalThis as unknown as Record<string, unknown>).__mockGetSession as ReturnType<typeof vi.fn>
    getSession.mockResolvedValue({
      data: {
        user: { id: '1', email: 'test@example.com' },
        session: { id: 's1' },
      },
    })

    render(
      <AuthProvider>
        <div data-testid="child">Protected Content</div>
      </AuthProvider>,
    )

    const child = await screen.findByTestId('child')
    expect(child).toBeInTheDocument()
  })
})
