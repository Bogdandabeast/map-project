import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, mock } from 'bun:test'
import * as React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

/* eslint-disable react/component-hook-factories --
   Mock module factories use hook-like method names to match Better Auth API */

// Mutable mock state
let mockEmailSignIn: (...args: any[]) => Promise<{ error?: { message: string } }> = async () => ({})

mock.module('../../../src/lib/auth-client', () => ({
  get signIn() {
    return {
      email: (...args: any[]) => mockEmailSignIn(...args),
      social: mock(() => {}),
    }
  },
  useSession: () => ({ data: null, isPending: false, error: null }),
  signUp: {},
  signOut: mock(() => {}),
  updateUser: {},
  deleteUser: {},
  forgotPassword: mock(() => {}),
  resetPassword: {},
}))

mock.module('../../../src/env', () => ({
  API_URL: 'http://localhost:8787',
  APP_URL: 'http://localhost:5173',
}))

import { LoginPage } from '../../../src/pages/Auth/LoginPage'

describe('LoginPage', () => {
  afterEach(() => {
    mockEmailSignIn = async () => ({})
  })

  function renderLogin() {
    return render(
      <MemoryRouter initialEntries={['/login']}>
        <Route path="/login">
          <LoginPage />
        </Route>
        <Route path="/signup">
          <div data-testid="signup-page">Signup Page</div>
        </Route>
        <Route path="/forgot-password">
          <div data-testid="forgot-password-page">Forgot Password Page</div>
        </Route>
      </MemoryRouter>,
    )
  }

  it('renders email and password input fields', () => {
    renderLogin()
    const emailInput = screen.getByTestId('login-email')
    const passwordInput = screen.getByTestId('login-password')
    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
  })

  it('renders a sign-in button', () => {
    renderLogin()
    expect(screen.getByTestId('login-submit')).toBeInTheDocument()
    expect(screen.getByTestId('login-submit')).toHaveTextContent('Iniciar sesión')
  })

  it('renders OAuth buttons', () => {
    renderLogin()
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  it('has a link to create account page', () => {
    renderLogin()
    expect(screen.getByTestId('login-to-signup')).toBeInTheDocument()
    expect(screen.getByTestId('login-to-signup')).toHaveTextContent('Crear cuenta')
  })

  it('has a link to forgot password page', () => {
    renderLogin()
    expect(screen.getByTestId('login-to-forgot')).toBeInTheDocument()
    expect(screen.getByTestId('login-to-forgot')).toHaveTextContent('Olvidé mi contraseña')
  })

  function fillLoginForm(email: string, password: string) {
    const emailInput = screen.getByTestId('login-email')
    const passwordInput = screen.getByTestId('login-password')

    for (const [el, val] of [[emailInput, email], [passwordInput, password]] as const) {
      try {
        (el as any).value = val
      }
      catch { /* ignore */ }
      fireEvent(el, new CustomEvent('ionChange', {
        detail: { value: val },
        bubbles: true,
        cancelable: true,
      }))
    }
  }

  it('calls signIn.email with email and password on submit', async () => {
    const signInSpy = mock(async (_params: { email: string; password: string; callbackURL: string }) => ({}))
    mockEmailSignIn = signInSpy

    renderLogin()
    fillLoginForm('test@example.com', 'password123')

    const form = screen.getByTestId('login-submit').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(signInSpy).toHaveBeenCalledTimes(1)
    })
    expect(signInSpy).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      callbackURL: expect.stringContaining('/explore'),
    })
  })

  it('shows error message on sign-in failure', async () => {
    mockEmailSignIn = mock(async () => ({
      error: { message: 'Invalid email or password' },
    }))

    renderLogin()
    fillLoginForm('test@example.com', 'wrong')

    const form = screen.getByTestId('login-submit').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toBeInTheDocument()
    })
    expect(screen.getByTestId('login-error')).toHaveTextContent('Invalid email or password')
  })

  it('shows loading state while signing in', async () => {
    let resolvePromise!: (value: any) => void
    mockEmailSignIn = () => new Promise((resolve) => { resolvePromise = resolve })

    renderLogin()
    fillLoginForm('test@example.com', 'password123')

    const form = screen.getByTestId('login-submit').closest('form')!
    fireEvent.submit(form)

    // Button should show loading text while waiting
    await waitFor(() => {
      expect(screen.getByTestId('login-submit')).toHaveTextContent('Ingresando')
    })

    resolvePromise!({})

    await waitFor(() => {
      expect(screen.getByTestId('login-submit')).toHaveTextContent('Iniciar sesión')
    })
  })
})
