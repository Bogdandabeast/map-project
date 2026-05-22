import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { LoginPage } from './LoginPage'

vi.mock('../lib/auth-client', () => {
  const signIn = vi.fn()
  const useSession = vi.fn(() => ({ data: null, isPending: false }))
  ;(globalThis as unknown as Record<string, unknown>).__mockSignIn = signIn
  ;(globalThis as unknown as Record<string, unknown>).__mockLoginUseSession = useSession
  return {
    authClient: {
      signIn: {
        email: signIn,
      },
      useSession,
    },
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>,
  )
}

/**
 * Helper to simulate Ionic's ionInput event and flush React state.
 */
async function setIonInputValue(selector: string, value: string) {
  const el = document.querySelector(selector)
  if (!el)
    throw new Error(`Element ${selector} not found`)

  await act(async () => {
    el.dispatchEvent(new CustomEvent('ionInput', {
      bubbles: true,
      detail: { value },
    }))
  })
}

async function submitForm() {
  const form = document.querySelector('form')!
  // Dispatch a submit event on the form to trigger React's onSubmit
  await act(async () => {
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
    form.dispatchEvent(submitEvent)
  })
}

describe('loginPage', () => {
  it('renders the login form with email and password fields', () => {
    const { container } = renderLogin()

    expect(container.querySelector('ion-input[label="Email"]')).toBeInTheDocument()
    expect(container.querySelector('ion-input[label="Password"]')).toBeInTheDocument()
    expect(container.querySelector('form ion-button')).toHaveTextContent('Sign In')
  })

  it('shows validation errors and does not call API when email is invalid', async () => {
    renderLogin()
    const signIn = (globalThis as unknown as Record<string, unknown>).__mockSignIn as ReturnType<typeof vi.fn>

    await setIonInputValue('ion-input[label="Email"]', 'not-an-email')
    await setIonInputValue('ion-input[label="Password"]', '12345678')
    await submitForm()

    expect(signIn).not.toHaveBeenCalled()
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
  })

  it('shows validation errors when password is too short', async () => {
    renderLogin()
    const signIn = (globalThis as unknown as Record<string, unknown>).__mockSignIn as ReturnType<typeof vi.fn>

    await setIonInputValue('ion-input[label="Email"]', 'user@example.com')
    await setIonInputValue('ion-input[label="Password"]', '123')
    await submitForm()

    expect(signIn).not.toHaveBeenCalled()
    expect(screen.getByText(/8 characters/i)).toBeInTheDocument()
  })

  it('calls authClient.signIn.email() with valid data', async () => {
    renderLogin()
    const signIn = (globalThis as unknown as Record<string, unknown>).__mockSignIn as ReturnType<typeof vi.fn>
    signIn.mockResolvedValue({ data: { user: { email: 'test@example.com' } } })

    await setIonInputValue('ion-input[label="Email"]', 'user@example.com')
    await setIonInputValue('ion-input[label="Password"]', '12345678')
    await submitForm()

    expect(signIn).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: '12345678',
    })
  })

  it('shows error message when credentials are invalid', async () => {
    renderLogin()
    const signIn = (globalThis as unknown as Record<string, unknown>).__mockSignIn as ReturnType<typeof vi.fn>
    signIn.mockRejectedValue(new Error('Invalid credentials'))

    await setIonInputValue('ion-input[label="Email"]', 'user@example.com')
    await setIonInputValue('ion-input[label="Password"]', '12345678')
    await submitForm()

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument()
  })

  it('redirects to /map when already authenticated', () => {
    const useSession = (globalThis as unknown as Record<string, unknown>).__mockLoginUseSession as ReturnType<typeof vi.fn>
    useSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com' },
        session: { id: 's1' },
      },
      isPending: false,
    })

    const { container } = renderLogin()
    expect(container.querySelector('form')).not.toBeInTheDocument()
  })
})
