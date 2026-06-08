import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, mock } from 'bun:test'
import * as React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

let mockSession: { data: any, isPending: boolean, error: any } = {
  data: null,
  isPending: false,
  error: null,
}
const mockSignOut = mock(async () => ({}))

mock.module('../../../src/lib/auth-client', () => ({
  get signIn() {
    return { email: mock(() => {}), social: mock(() => {}) }
  },
  signUp: { email: mock(() => {}) },
  useSession: () => mockSession,
  signOut: (...args: any[]) => mockSignOut(...args),
  updateUser: {},
  deleteUser: {},
  forgotPassword: {},
  resetPassword: {},
}))

mock.module('../../../src/env', () => ({
  API_URL: 'http://localhost:8787',
  APP_URL: 'http://localhost:5173',
}))

import { AuthProvider } from '../../../src/components/auth/AuthProvider'
import { MyProfilePage } from '../../../src/pages/Profile/MyProfilePage'

describe('MyProfilePage', () => {
  afterEach(() => {
    mockSession = { data: null, isPending: false, error: null }
    mockSignOut.mockClear()
  })

  function renderPage() {
    return render(
      <MemoryRouter initialEntries={['/profile']}>
        <AuthProvider>
          <Route path="/profile">
            <MyProfilePage />
          </Route>
          <Route path="/explore">
            <div data-testid="explore-page">Explore Page</div>
          </Route>
        </AuthProvider>
      </MemoryRouter>,
    )
  }

  it('redirects to /explore when not authenticated', () => {
    mockSession = { data: null, isPending: false, error: null }

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <AuthProvider>
          <Route path="/profile">
            <MyProfilePage />
          </Route>
          <Route path="/explore">
            <div data-testid="explore-page">Explore Page</div>
          </Route>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('explore-page')).toBeInTheDocument()
  })

  it('shows user name and email when authenticated', () => {
    mockSession = {
      data: {
        user: {
          id: 'user-1',
          name: 'María García',
          email: 'maria@example.com',
          role: 'user',
        },
      },
      isPending: false,
      error: null,
    }

    renderPage()

    expect(screen.getByTestId('profile-name')).toHaveTextContent('María García')
    expect(screen.getByTestId('profile-email')).toHaveTextContent('maria@example.com')
  })

  it('shows role badge', () => {
    mockSession = {
      data: {
        user: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        },
      },
      isPending: false,
      error: null,
    }

    renderPage()

    expect(screen.getByTestId('profile-role')).toBeInTheDocument()
    expect(screen.getByTestId('profile-role')).toHaveTextContent('admin')
  })

  it('renders a sign-out button', () => {
    mockSession = {
      data: {
        user: {
          id: 'user-1',
          name: 'Test',
          email: 'test@example.com',
          role: 'user',
        },
      },
      isPending: false,
      error: null,
    }

    renderPage()

    expect(screen.getByTestId('profile-signout')).toBeInTheDocument()
    expect(screen.getByTestId('profile-signout')).toHaveTextContent('Cerrar sesión')
  })

  it('calls signOut when sign-out button is clicked', () => {
    mockSession = {
      data: {
        user: {
          id: 'user-1',
          name: 'Test',
          email: 'test@example.com',
          role: 'user',
        },
      },
      isPending: false,
      error: null,
    }

    renderPage()

    const btn = screen.getByTestId('profile-signout')
    fireEvent.click(btn)

    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  it('shows loading state when session is pending', () => {
    mockSession = { data: null, isPending: true, error: null }

    renderPage()

    expect(screen.getByTestId('auth-loading')).toBeInTheDocument()
  })
})
