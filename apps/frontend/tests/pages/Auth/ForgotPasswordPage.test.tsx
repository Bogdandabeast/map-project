/* eslint-disable react/component-hook-factories --
   Mock module factories use hook-like method names to match Better Auth API */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, mock } from 'bun:test'
import * as React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { ForgotPasswordPage } from '../../../src/pages/Auth/ForgotPasswordPage'

let mockForgotPassword: (...args: any[]) => Promise<{ error?: { message: string } }> = async () => ({})

mock.module('../../../src/lib/auth-client', () => ({
  get signIn() {
    return { email: mock(() => {}), social: mock(() => {}) }
  },
  signUp: { email: mock(() => {}) },
  useSession: () => ({ data: null, isPending: false, error: null }),
  signOut: mock(() => {}),
  updateUser: {},
  deleteUser: {},
  forgotPassword: {
    email: (...args: any[]) => mockForgotPassword(...args),
  },
  resetPassword: {},
}))

mock.module('../../../src/env', () => ({
  API_URL: 'http://localhost:8787',
  APP_URL: 'http://localhost:5173',
}))

describe('ForgotPasswordPage', () => {
  afterEach(() => {
    mockForgotPassword = async () => ({})
  })

  function renderPage() {
    return render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <Route path="/forgot-password">
          <ForgotPasswordPage />
        </Route>
        <Route path="/login">
          <div data-testid="login-page">Login Page</div>
        </Route>
      </MemoryRouter>,
    )
  }

  it('renders email input field', () => {
    renderPage()
    expect(screen.getByTestId('forgot-email')).toBeInTheDocument()
  })

  it('renders a submit button', () => {
    renderPage()
    expect(screen.getByTestId('forgot-submit')).toBeInTheDocument()
    expect(screen.getByTestId('forgot-submit')).toHaveTextContent('Enviar instrucciones')
  })

  it('has a link back to login', () => {
    renderPage()
    expect(screen.getByTestId('forgot-to-login')).toBeInTheDocument()
    expect(screen.getByTestId('forgot-to-login')).toHaveTextContent('Volver al inicio de sesión')
  })

  function fillEmail(email: string) {
    const el = screen.getByTestId('forgot-email')
    try {
      (el as any).value = email
    }
    catch {
      // IonInput may not expose .value directly in the test DOM;
      // the ionChange event below is the actual trigger. Ignore silently.
    }
    fireEvent(el, new CustomEvent('ionChange', {
      detail: { value: email },
      bubbles: true,
      cancelable: true,
    }))
  }

  it('calls forgotPassword with email on submit', async () => {
    const spy = mock(async (_params: { email: string }) => ({}))
    mockForgotPassword = spy as any

    renderPage()
    fillEmail('user@example.com')

    const form = screen.getByTestId('forgot-submit').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(1)
    })
    expect(spy).toHaveBeenCalledWith({
      email: 'user@example.com',
    })
  })

  it('shows success message after successful submission', async () => {
    mockForgotPassword = mock(async () => ({}))

    renderPage()
    fillEmail('user@example.com')

    const form = screen.getByTestId('forgot-submit').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('forgot-success')).toBeInTheDocument()
    })
  })

  it('shows error message on failure', async () => {
    mockForgotPassword = mock(async () => ({
      error: { message: 'Email not found' },
    }))

    renderPage()
    fillEmail('unknown@example.com')

    const form = screen.getByTestId('forgot-submit').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('forgot-error')).toBeInTheDocument()
    })
    expect(screen.getByTestId('forgot-error')).toHaveTextContent('Email not found')
  })

  it('shows loading state while submitting', async () => {
    let resolvePromise!: (value: any) => void
    mockForgotPassword = () => new Promise((resolve) => {
      resolvePromise = resolve
    })

    renderPage()
    fillEmail('user@example.com')

    const form = screen.getByTestId('forgot-submit').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('forgot-submit')).toHaveTextContent('Enviando')
    })

    resolvePromise!({})

    await waitFor(() => {
      expect(screen.getByTestId('forgot-submit')).toHaveTextContent('Enviar instrucciones')
    })
  })
})
