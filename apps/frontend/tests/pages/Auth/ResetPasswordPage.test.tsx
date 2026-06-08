import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, mock } from 'bun:test'
import * as React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

let mockResetPassword: (...args: any[]) => Promise<{ error?: { message: string } }> = async () => ({})

mock.module('../../../src/lib/auth-client', () => ({
  get signIn() {
    return { email: mock(() => {}), social: mock(() => {}) }
  },
  signUp: { email: mock(() => {}) },
  useSession: () => ({ data: null, isPending: false, error: null }),
  signOut: mock(() => {}),
  updateUser: {},
  deleteUser: {},
  forgotPassword: {},
  resetPassword: {
    email: (...args: any[]) => mockResetPassword(...args),
  },
}))

mock.module('../../../src/env', () => ({
  API_URL: 'http://localhost:8787',
  APP_URL: 'http://localhost:5173',
}))

import { ResetPasswordPage } from '../../../src/pages/Auth/ResetPasswordPage'

describe('ResetPasswordPage', () => {
  afterEach(() => {
    mockResetPassword = async () => ({})
  })

  function renderPage(token: string) {
    return render(
      <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
        <Route path="/reset-password">
          <ResetPasswordPage />
        </Route>
        <Route path="/login">
          <div data-testid="login-page">Login Page</div>
        </Route>
      </MemoryRouter>,
    )
  }

  it('renders new password input field', () => {
    renderPage('valid-token')
    expect(screen.getByTestId('reset-password')).toBeInTheDocument()
  })

  it('renders a submit button', () => {
    renderPage('valid-token')
    expect(screen.getByTestId('reset-submit')).toBeInTheDocument()
    expect(screen.getByTestId('reset-submit')).toHaveTextContent('Cambiar contraseña')
  })

  it('shows error when token is missing from URL', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <Route path="/reset-password">
          <ResetPasswordPage />
        </Route>
      </MemoryRouter>,
    )
    expect(screen.getByTestId('reset-error')).toBeInTheDocument()
    expect(screen.getByTestId('reset-error')).toHaveTextContent('Token inválido o faltante')
  })

  function fillPassword(password: string) {
    const el = screen.getByTestId('reset-password')
    try {
      (el as any).value = password
    }
    catch { /* ignore */ }
    fireEvent(el, new CustomEvent('ionChange', {
      detail: { value: password },
      bubbles: true,
      cancelable: true,
    }))
  }

  it('calls resetPassword with token and new password on submit', async () => {
    const spy = mock(async (_params: { token: string; newPassword: string }) => ({}))
    mockResetPassword = spy as any

    renderPage('abc123')
    fillPassword('newSecurePass1')

    const form = screen.getByTestId('reset-submit').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(1)
    })

    // resetPassword expects token and newPassword
    const callArgs = spy.mock.calls[0]?.[0] as any
    expect(callArgs.token).toBe('abc123')
    expect(callArgs.newPassword).toBe('newSecurePass1')
  })

  it('shows error on reset failure', async () => {
    mockResetPassword = mock(async () => ({
      error: { message: 'Token expired' },
    }))

    renderPage('expired')
    fillPassword('newSecurePass1')

    const form = screen.getByTestId('reset-submit').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('reset-error')).toBeInTheDocument()
    })
    expect(screen.getByTestId('reset-error')).toHaveTextContent('Token expired')
  })
})
