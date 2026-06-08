import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, mock } from 'bun:test'
import * as React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

/* eslint-disable react/component-hook-factories --
   Mock module factories use hook-like method names to match Better Auth API */

// Mutable mock state
let mockEmailSignUp: (...args: any[]) => Promise<{ error?: { message: string } }> = async () => ({})

mock.module('../../../src/lib/auth-client', () => ({
  get signIn() {
    return { email: mock(() => {}), social: mock(() => {}) }
  },
  signUp: {
    email: (...args: any[]) => mockEmailSignUp(...args),
  },
  useSession: () => ({ data: null, isPending: false, error: null }),
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

import { SignupPage } from '../../../src/pages/Auth/SignupPage'

describe('SignupPage', () => {
  afterEach(() => {
    mockEmailSignUp = async () => ({})
  })

  function renderSignup() {
    return render(
      <MemoryRouter initialEntries={['/signup']}>
        <Route path="/signup">
          <SignupPage />
        </Route>
        <Route path="/login">
          <div data-testid="login-page">Login Page</div>
        </Route>
      </MemoryRouter>,
    )
  }

  it('renders name, email, and password input fields', () => {
    renderSignup()
    expect(screen.getByTestId('signup-name')).toBeInTheDocument()
    expect(screen.getByTestId('signup-email')).toBeInTheDocument()
    expect(screen.getByTestId('signup-password')).toBeInTheDocument()
  })

  it('renders a sign-up button', () => {
    renderSignup()
    expect(screen.getByTestId('signup-submit')).toBeInTheDocument()
    expect(screen.getByTestId('signup-submit')).toHaveTextContent('Crear cuenta')
  })

  it('has a link to the login page', () => {
    renderSignup()
    expect(screen.getByTestId('signup-to-login')).toBeInTheDocument()
    expect(screen.getByTestId('signup-to-login')).toHaveTextContent('Ya tengo cuenta')
  })

  function fillSignupForm(name: string, email: string, password: string) {
    const fields: Array<[ReturnType<typeof screen.getByTestId>, string]> = [
      [screen.getByTestId('signup-name'), name],
      [screen.getByTestId('signup-email'), email],
      [screen.getByTestId('signup-password'), password],
    ]

    for (const [ionInputEl, val] of fields) {
      // Set value on Ionic web component (triggers internal state)
      try {
        (ionInputEl as any).value = val
      }
      catch { /* ignore */ }

      // Fire ionChange event — React's onIonChange handler reads e.detail.value
      fireEvent(ionInputEl, new CustomEvent('ionChange', {
        detail: { value: val },
        bubbles: true,
        cancelable: true,
      }))
    }
  }

  it('calls signUp.email with name, email, and password on submit', async () => {
    const signUpSpy = mock(async (_params: { name: string; email: string; password: string }) => ({}))
    mockEmailSignUp = signUpSpy

    renderSignup()
    fillSignupForm('Test User', 'test@example.com', 'password123')

    const form = screen.getByTestId('signup-submit').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(signUpSpy).toHaveBeenCalledTimes(1)
    })
    expect(signUpSpy).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('shows error message on sign-up failure', async () => {
    mockEmailSignUp = mock(async () => ({
      error: { message: 'Email already in use' },
    }))

    renderSignup()
    fillSignupForm('Test User', 'taken@example.com', 'password123')

    const form = screen.getByTestId('signup-submit').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('signup-error')).toBeInTheDocument()
    })
    expect(screen.getByTestId('signup-error')).toHaveTextContent('Email already in use')
  })

  it('shows loading state while signing up', async () => {
    let resolvePromise!: (value: any) => void
    mockEmailSignUp = () => new Promise((resolve) => { resolvePromise = resolve })

    renderSignup()
    fillSignupForm('Test User', 'test@example.com', 'password123')

    const form = screen.getByTestId('signup-submit').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('signup-submit')).toHaveTextContent('Creando cuenta')
    })

    resolvePromise!({})

    await waitFor(() => {
      expect(screen.getByTestId('signup-submit')).toHaveTextContent('Crear cuenta')
    })
  })
})
