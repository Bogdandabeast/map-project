import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { SignupPage } from './SignupPage'

vi.mock('../lib/auth-client', () => {
  const signUp = vi.fn()
  ;(globalThis as unknown as Record<string, unknown>).__mockSignUp = signUp
  return {
    authClient: {
      signUp: {
        email: signUp,
      },
      useSession: vi.fn(() => ({ data: null, isPending: false })),
    },
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

function renderSignup() {
  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <SignupPage />
    </MemoryRouter>,
  )
}

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
  await act(async () => {
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
    form.dispatchEvent(submitEvent)
  })
}

describe('signupPage', () => {
  it('renders the signup form with name, email, and password fields', () => {
    const { container } = renderSignup()

    expect(container.querySelector('ion-input[label="Name"]')).toBeInTheDocument()
    expect(container.querySelector('ion-input[label="Email"]')).toBeInTheDocument()
    expect(container.querySelector('ion-input[label="Password"]')).toBeInTheDocument()
    expect(container.querySelector('form ion-button')).toHaveTextContent('Sign Up')
  })

  it('shows validation errors when name is too short', async () => {
    renderSignup()
    const signUp = (globalThis as unknown as Record<string, unknown>).__mockSignUp as ReturnType<typeof vi.fn>

    await setIonInputValue('ion-input[label="Name"]', 'J')
    await setIonInputValue('ion-input[label="Email"]', 'user@example.com')
    await setIonInputValue('ion-input[label="Password"]', '12345678')
    await submitForm()

    expect(signUp).not.toHaveBeenCalled()
    expect(screen.getByText(/2 characters/i)).toBeInTheDocument()
  })

  it('shows validation errors when email is invalid', async () => {
    renderSignup()
    const signUp = (globalThis as unknown as Record<string, unknown>).__mockSignUp as ReturnType<typeof vi.fn>

    await setIonInputValue('ion-input[label="Name"]', 'John')
    await setIonInputValue('ion-input[label="Email"]', 'bad-email')
    await setIonInputValue('ion-input[label="Password"]', '12345678')
    await submitForm()

    expect(signUp).not.toHaveBeenCalled()
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
  })

  it('shows validation errors when password is too short', async () => {
    renderSignup()
    const signUp = (globalThis as unknown as Record<string, unknown>).__mockSignUp as ReturnType<typeof vi.fn>

    await setIonInputValue('ion-input[label="Name"]', 'John')
    await setIonInputValue('ion-input[label="Email"]', 'user@example.com')
    await setIonInputValue('ion-input[label="Password"]', '123')
    await submitForm()

    expect(signUp).not.toHaveBeenCalled()
    expect(screen.getByText(/8 characters/i)).toBeInTheDocument()
  })

  it('calls authClient.signUp.email() with valid data', async () => {
    renderSignup()
    const signUp = (globalThis as unknown as Record<string, unknown>).__mockSignUp as ReturnType<typeof vi.fn>
    signUp.mockResolvedValue({ data: { user: { email: 'test@example.com' } } })

    await setIonInputValue('ion-input[label="Name"]', 'John')
    await setIonInputValue('ion-input[label="Email"]', 'user@example.com')
    await setIonInputValue('ion-input[label="Password"]', '12345678')
    await submitForm()

    expect(signUp).toHaveBeenCalledWith({
      name: 'John',
      email: 'user@example.com',
      password: '12345678',
    })
  })

  it('shows error message when signup fails', async () => {
    renderSignup()
    const signUp = (globalThis as unknown as Record<string, unknown>).__mockSignUp as ReturnType<typeof vi.fn>
    signUp.mockRejectedValue(new Error('Email already registered'))

    await setIonInputValue('ion-input[label="Name"]', 'John')
    await setIonInputValue('ion-input[label="Email"]', 'user@example.com')
    await setIonInputValue('ion-input[label="Password"]', '12345678')
    await submitForm()

    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument()
  })
})
