/* eslint-disable react/component-hook-factories --
   Mock module factories use hook-like method names to match Better Auth API */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, mock } from 'bun:test'
import * as React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { AuthProvider } from '../../../src/components/auth/AuthProvider'
import { SettingsPage } from '../../../src/pages/Profile/SettingsPage'

let mockSession: { data: any, isPending: boolean, error: any } = {
  data: null,
  isPending: false,
  error: null,
}
const mockDeleteUser = mock(async () => ({}))

mock.module('../../../src/lib/auth-client', () => ({
  get signIn() {
    return { email: mock(() => {}), social: mock(() => {}) }
  },
  signUp: { email: mock(() => {}) },
  useSession: () => mockSession,
  signOut: mock(() => {}),
  updateUser: {},
  deleteUser: (...args: any[]) => mockDeleteUser(...args),
  forgotPassword: {},
  resetPassword: {},
}))

mock.module('../../../src/env', () => ({
  API_URL: 'http://localhost:8787',
  APP_URL: 'http://localhost:5173',
}))

describe('SettingsPage', () => {
  afterEach(() => {
    mockSession = { data: null, isPending: false, error: null }
    mockDeleteUser.mockClear()
  })

  function renderPage() {
    return render(
      <MemoryRouter initialEntries={['/settings']}>
        <AuthProvider>
          <Route path="/settings">
            <SettingsPage />
          </Route>
          <Route path="/explore">
            <div data-testid="explore-page">Explore Page</div>
          </Route>
        </AuthProvider>
      </MemoryRouter>,
    )
  }

  // Suppress console errors during IonAlert tests (CSSStyleSheet compatibility).
  // Restored in afterAll to avoid contaminating other suites.
  const origError = console.error
  beforeAll(() => {
    console.error = () => {}
  })
  afterAll(() => {
    console.error = origError
  })

  it('redirects to /explore when not authenticated', () => {
    mockSession = { data: null, isPending: false, error: null }

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <AuthProvider>
          <Route path="/settings">
            <SettingsPage />
          </Route>
          <Route path="/explore">
            <div data-testid="explore-page">Explore Page</div>
          </Route>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('explore-page')).toBeInTheDocument()
  })

  it('has a delete account button', () => {
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

    expect(screen.getByTestId('settings-delete-account')).toBeInTheDocument()
    expect(screen.getByTestId('settings-delete-account')).toHaveTextContent('Eliminar cuenta')
  })

  it('shows confirmation alert when delete is clicked', () => {
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

    const deleteBtn = screen.getByTestId('settings-delete-account')
    fireEvent.click(deleteBtn)

    // IonAlert should appear with confirmation message
    expect(screen.getByTestId('settings-delete-alert')).toBeInTheDocument()
  })

  it('calls deleteUser when alert is confirmed', async () => {
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

    // Click delete to show alert
    fireEvent.click(screen.getByTestId('settings-delete-account'))

    // Find and click the confirm button inside IonAlert
    const confirmBtn = screen.getByTestId('settings-delete-confirm')
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledTimes(1)
    })
  })

  it('hides alert when cancel is clicked', () => {
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

    fireEvent.click(screen.getByTestId('settings-delete-account'))

    const cancelBtn = screen.getByTestId('settings-delete-cancel')
    fireEvent.click(cancelBtn)

    expect(screen.queryByTestId('settings-delete-alert')).not.toBeInTheDocument()
  })
})
