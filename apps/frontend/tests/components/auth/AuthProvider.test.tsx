import { fireEvent, render, screen } from '@testing-library/react'

import { afterEach, describe, expect, it, mock } from 'bun:test'
import * as React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from '../../../src/components/auth/AuthProvider'
import { OAuthButtons } from '../../../src/components/auth/OAuthButtons'
import { ProtectedRoute } from '../../../src/components/auth/ProtectedRoute'

/* eslint-disable react/component-hook-factories, react/no-unnecessary-use-prefix --
   Mock module factories use hook-like method names to match Better Auth API */

// Mutable mock state — the factory closure captures this reference
let mockSession: { data: any, isPending: boolean, error: any } = {
  data: null,
  isPending: false,
  error: null,
}

const mockSignInSocial = mock(() => {})

// Mock the auth-client BEFORE AuthProvider and OAuthButtons are imported
mock.module('../../../src/lib/auth-client', () => ({
  useSession: () => mockSession,
  signIn: { social: mockSignInSocial },
  signUp: {},
  signOut: {},
  updateUser: {},
  deleteUser: {},
  forgotPassword: {},
  resetPassword: {},
}))

// Helper component to consume context in tests
function AuthConsumer() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="is-pending">{String(auth.isPending)}</span>
      <span data-testid="is-authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="user-name">{auth.user?.name || 'none'}</span>
      <span data-testid="session-exists">{String(!!auth.session)}</span>
    </div>
  )
}

describe('AuthProvider', () => {
  afterEach(() => {
    mockSession = { data: null, isPending: false, error: null }
  })

  it('renders children when provided', () => {
    render(
      <AuthProvider>
        <div data-testid="child">Hello World</div>
      </AuthProvider>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('shows loading state when session is pending', () => {
    mockSession = { data: null, isPending: true, error: null }

    render(
      <AuthProvider>
        <div data-testid="child">Content</div>
      </AuthProvider>,
    )

    expect(screen.getByTestId('auth-loading')).toBeInTheDocument()
    expect(screen.queryByTestId('child')).not.toBeInTheDocument()
  })

  it('provides user data when authenticated', () => {
    const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' }
    mockSession = {
      data: { user: mockUser },
      isPending: false,
      error: null,
    }

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
    expect(screen.getByTestId('is-pending')).toHaveTextContent('false')
  })

  it('reports not authenticated when session data is null', () => {
    mockSession = { data: null, isPending: false, error: null }

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('user-name')).toHaveTextContent('none')
  })

  it('reports not authenticated when user is missing from session', () => {
    mockSession = {
      data: {} as any,
      isPending: false,
      error: null,
    }

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('user-name')).toHaveTextContent('none')
  })

  it('provides session object in context', () => {
    const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' }
    const mockSessionData = { token: 'abc123', userId: 'user-1' }
    mockSession = {
      data: { user: mockUser, session: mockSessionData },
      isPending: false,
      error: null,
    }

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    expect(screen.getByTestId('session-exists')).toHaveTextContent('true')
  })

  it('does not crash when session has error', () => {
    mockSession = {
      data: null,
      isPending: false,
      error: { message: 'Network error', status: 500, statusText: 'Error' },
    }

    render(
      <AuthProvider>
        <div data-testid="child">Still renders</div>
      </AuthProvider>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Still renders')).toBeInTheDocument()
  })

  it('useAuth throws outside AuthProvider', () => {
    const consoleError = console.error
    console.error = () => {}

    expect(() => {
      render(<AuthConsumer />)
    }).toThrow()

    console.error = consoleError
  })
})

describe('OAuthButtons', () => {
  afterEach(() => {
    mockSignInSocial.mockClear()
  })

  it('renders a Google sign-in button', () => {
    render(<OAuthButtons />)
    expect(screen.getByText('Google')).toBeInTheDocument()
  })

  it('renders a GitHub sign-in button', () => {
    render(<OAuthButtons />)
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  it('calls signIn.social with google provider when Google button is clicked', () => {
    render(<OAuthButtons />)
    const googleButton = screen.getByText('Google')

    fireEvent.click(googleButton)

    expect(mockSignInSocial).toHaveBeenCalledTimes(1)
    expect(mockSignInSocial).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: '/',
    })
  })

  it('calls signIn.social with github provider when GitHub button is clicked', () => {
    mockSignInSocial.mockClear()

    render(<OAuthButtons />)
    const githubButton = screen.getByText('GitHub')

    fireEvent.click(githubButton)

    expect(mockSignInSocial).toHaveBeenCalledTimes(1)
    expect(mockSignInSocial).toHaveBeenCalledWith({
      provider: 'github',
      callbackURL: '/',
    })
  })

  it('renders both provider buttons', () => {
    render(<OAuthButtons />)
    const googleBtn = screen.getByText('Google')
    const githubBtn = screen.getByText('GitHub')
    expect(googleBtn).toBeInTheDocument()
    expect(githubBtn).toBeInTheDocument()
    expect(googleBtn).not.toEqual(githubBtn)
  })
})

describe('ProtectedRoute', () => {
  afterEach(() => {
    mockSession = { data: null, isPending: false, error: null }
  })

  it('renders children when authenticated', () => {
    mockSession = {
      data: { user: { id: '1' } },
      isPending: false,
      error: null,
    }

    render(
      <MemoryRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div data-testid="protected-content">Secret Page</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.getByText('Secret Page')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    mockSession = { data: null, isPending: false, error: null }

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Route path="/login">
            <div data-testid="login-page">Login Page</div>
          </Route>
          <Route path="/dashboard">
            <ProtectedRoute>
              <div data-testid="protected-content">Dashboard</div>
            </ProtectedRoute>
          </Route>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('shows loading spinner when pending', () => {
    mockSession = { data: null, isPending: true, error: null }

    render(
      <MemoryRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div data-testid="protected-content">Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('auth-loading')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('renders protected content when session has valid user', () => {
    mockSession = {
      data: { user: { id: '2', name: 'Jane' } },
      isPending: false,
      error: null,
    }

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <AuthProvider>
          <Route path="/settings">
            <ProtectedRoute>
              <div data-testid="settings-page">Settings</div>
            </ProtectedRoute>
          </Route>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('settings-page')).toBeInTheDocument()
  })
})
