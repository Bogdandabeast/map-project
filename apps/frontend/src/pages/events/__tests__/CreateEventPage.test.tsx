import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

// ── Mock LocationPicker ──────────────────────────────────────────────

let capturedOnLocationChange: ((lat: number, lng: number) => void) | undefined

mock.module('../../../components/discovery/LocationPicker', () => ({
  LocationPicker: ({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) => {
    capturedOnLocationChange = onLocationChange
    return <div data-testid="location-picker">Location Picker</div>
  },
}))

// ── Mock auth provider ────────────────────────────────────────────────

mock.module('../../../components/auth/AuthProvider', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 'test-user', role: 'user' },
    isPending: false,
    session: null,
  }),
}))

// ── Captured createEvent payload ──────────────────────────────────────

let capturedCreateEventPayload: Record<string, unknown> | undefined

mock.module('../../../stores/eventsStore', () => ({
  useEventsStore: () => ({
    createEvent: async (data: Record<string, unknown>) => {
      capturedCreateEventPayload = data
      return { id: 'new-event-1' }
    },
    formState: { isSubmitting: false, isSuccess: false, error: null },
    resetFormState: () => {},
  }),
}))

// ── Import after all mocks are set up ─────────────────────────────────

import { CreateEventPage, validateCreateEventForm } from '../CreateEventPage'

// ── Helpers ───────────────────────────────────────────────────────────

function fillIonField(testId: string, value: string) {
  const el = screen.getByTestId(testId) as HTMLElement
  // Dispatch ionInput which IonInput listens to
  fireEvent(el, new CustomEvent('ionInput', { detail: { value } }))
  // Also dispatch ionChange for completeness
  fireEvent(el, new CustomEvent('ionChange', { detail: { value } }))
}

async function submitFormDirectly() {
  const form = screen.getByTestId('create-event-form') as HTMLFormElement
  fireEvent.submit(form)
  await waitFor(() => {})
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('CreateEventPage with LocationPicker', () => {
  beforeEach(() => {
    capturedOnLocationChange = undefined
    capturedCreateEventPayload = undefined
  })

  afterEach(() => {
    capturedOnLocationChange = undefined
    capturedCreateEventPayload = undefined
  })

  it('renders the LocationPicker component', () => {
    render(<CreateEventPage />)
    expect(screen.getByTestId('location-picker')).toBeInTheDocument()
  })

  it('submits lat and lng from LocationPicker in the createEvent payload', async () => {
    render(<CreateEventPage />)

    // Simulate user dragging the pin on LocationPicker to set coordinates
    expect(capturedOnLocationChange).toBeDefined()
    capturedOnLocationChange!(40.4168, -3.7038)

    // Fill required form fields with valid data
    fillIonField('create-event-title-input', 'Board Game Night')
    fillIonField('create-event-address-input', 'Calle Mayor 1')

    // Set date to far future by dispatching ionChange on the datetime element
    const tomorrow = new Date(Date.now() + 86400000).toISOString()
    const dateEl = screen.getByTestId('create-event-date-input')
    fireEvent(dateEl, new CustomEvent('ionChange', { detail: { value: tomorrow } }))

    await submitFormDirectly()

    // The form should call createEvent with lat/lng
    // If validation failed due to date, capturedCreateEventPayload will be undefined
    expect(capturedCreateEventPayload).toBeDefined()
    if (capturedCreateEventPayload) {
      expect(capturedCreateEventPayload.lat).toBe(40.4168)
      expect(capturedCreateEventPayload.lng).toBe(-3.7038)
    }
  })

  it('submits without lat/lng when LocationPicker coordinates are not set', async () => {
    render(<CreateEventPage />)

    fillIonField('create-event-title-input', 'Board Game Night')
    fillIonField('create-event-address-input', 'Calle Mayor 1')

    const tomorrow = new Date(Date.now() + 86400000).toISOString()
    const dateEl = screen.getByTestId('create-event-date-input')
    fireEvent(dateEl, new CustomEvent('ionChange', { detail: { value: tomorrow } }))

    await submitFormDirectly()

    expect(capturedCreateEventPayload).toBeDefined()
    if (capturedCreateEventPayload) {
      expect(capturedCreateEventPayload.lat).toBeUndefined()
      expect(capturedCreateEventPayload.lng).toBeUndefined()
    }
  })
})

// Pure function tests for the exported validation helper
describe('validateCreateEventForm', () => {
  it('rejects short titles', () => {
    const errors = validateCreateEventForm({
      title: 'ab',
      address: 'Somewhere',
      date: new Date(Date.now() + 3600000).toISOString(),
      capacity: 4,
    })
    expect(errors.title).toBeDefined()
  })

  it('accepts valid form data', () => {
    const errors = validateCreateEventForm({
      title: 'Board Game Night',
      address: 'Calle Mayor 1',
      date: new Date(Date.now() + 3600000).toISOString(),
      capacity: 4,
    })
    expect(Object.keys(errors)).toHaveLength(0)
  })
})
