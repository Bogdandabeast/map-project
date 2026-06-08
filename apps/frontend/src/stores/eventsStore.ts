import { create } from 'zustand'
import type { EventData, Attendee, MyEventsFilter } from '../services/events'
import * as eventsApi from '../services/events'

// ── State shape ────────────────────────────────────────────────────

export interface EventsStore {
  // Data
  events: EventData[]
  currentEvent: EventData | null
  attendees: Attendee[]
  myEvents: EventData[]

  // UI state
  loading: boolean
  error: string | null
  rsvpState: 'idle' | 'loading' | 'success' | 'error'
  formState: {
    isSubmitting: boolean
    isSuccess: boolean
    error: string | null
  }

  // Actions — CRUD
  fetchEvent: (id: string) => Promise<void>
  createEvent: (data: Parameters<typeof eventsApi.createEvent>[0]) => Promise<EventData | null>
  updateEvent: (id: string, data: Record<string, unknown>) => Promise<EventData | null>
  deleteEvent: (id: string) => Promise<boolean>
  cancelEvent: (id: string) => Promise<EventData | null>

  // Actions — RSVP
  rsvp: (eventId: string) => Promise<void>
  leave: (eventId: string) => Promise<void>
  fetchAttendees: (eventId: string) => Promise<void>

  // Actions — My Events
  fetchMyEvents: (filter?: MyEventsFilter) => Promise<void>

  // Actions — Upload
  getUploadUrl: (eventId: string, contentType?: string) => Promise<{ uploadUrl: string, key: string } | null>

  // State resets
  resetFormState: () => void
  resetRsvpState: () => void
  clearError: () => void
  setCurrentEvent: (event: EventData | null) => void
}

// ── Store ──────────────────────────────────────────────────────────

export const useEventsStore = create<EventsStore>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────
  events: [],
  currentEvent: null,
  attendees: [],
  myEvents: [],
  loading: false,
  error: null,
  rsvpState: 'idle',
  formState: {
    isSubmitting: false,
    isSuccess: false,
    error: null,
  },

  // ── Fetch single event ─────────────────────────────────────────
  fetchEvent: async (id: string) => {
    // Events don't have a dedicated GET /:id endpoint.
    // We can reuse getMyEvents or fetch a specific event via the attendees list.
    // For now, we fetch the event via the myEvents endpoint as a workaround
    // or use getMyEvents('all') and find by id.
    // Actually, let's re-fetch from myEvents and find the matching event.
    set({ loading: true, error: null })
    try {
      const all = await eventsApi.getMyEvents('all')
      const found = all.find(e => e.id === id)
      if (found) {
        set({ currentEvent: found, loading: false })
      }
      else {
        // If not in myEvents, try fetching from the event detail
        // via getAttendees which validates the event exists
        try {
          await eventsApi.getAttendees(id)
          // Event exists; we don't have full data but can create a placeholder
          // This is a limitation; ideally there'd be a GET /api/events/:id endpoint
        }
        catch {
          set({ error: 'Event not found', loading: false })
        }
      }
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch event'
      set({ error: message, loading: false })
    }
  },

  // ── Create event ───────────────────────────────────────────────
  createEvent: async (data) => {
    set({ formState: { isSubmitting: true, isSuccess: false, error: null } })
    try {
      const event = await eventsApi.createEvent(data)
      set(state => ({
        events: [...state.events, event],
        myEvents: [...state.myEvents, event],
        formState: { isSubmitting: false, isSuccess: true, error: null },
      }))
      return event
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create event'
      set({ formState: { isSubmitting: false, isSuccess: false, error: message } })
      return null
    }
  },

  // ── Update event ───────────────────────────────────────────────
  updateEvent: async (id, data) => {
    set({ formState: { isSubmitting: true, isSuccess: false, error: null } })
    try {
      const updated = await eventsApi.updateEvent(id, data)
      set(state => ({
        currentEvent: updated,
        events: state.events.map(e => (e.id === id ? updated : e)),
        myEvents: state.myEvents.map(e => (e.id === id ? updated : e)),
        formState: { isSubmitting: false, isSuccess: true, error: null },
      }))
      return updated
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update event'
      set({ formState: { isSubmitting: false, isSuccess: false, error: message } })
      return null
    }
  },

  // ── Delete event ───────────────────────────────────────────────
  deleteEvent: async (id) => {
    set({ loading: true, error: null })
    try {
      await eventsApi.deleteEvent(id)
      set(state => ({
        events: state.events.filter(e => e.id !== id),
        myEvents: state.myEvents.filter(e => e.id !== id),
        currentEvent: state.currentEvent?.id === id ? null : state.currentEvent,
        loading: false,
      }))
      return true
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete event'
      set({ error: message, loading: false })
      return false
    }
  },

  // ── Cancel event ───────────────────────────────────────────────
  cancelEvent: async (id) => {
    set({ loading: true, error: null })
    try {
      const cancelled = await eventsApi.cancelEvent(id)
      set(state => ({
        currentEvent: cancelled,
        events: state.events.map(e => (e.id === id ? cancelled : e)),
        myEvents: state.myEvents.map(e => (e.id === id ? cancelled : e)),
        loading: false,
      }))
      return cancelled
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel event'
      set({ error: message, loading: false })
      return null
    }
  },

  // ── RSVP ───────────────────────────────────────────────────────
  rsvp: async (eventId) => {
    set({ rsvpState: 'loading' })
    try {
      await eventsApi.rsvp(eventId)
      // Refresh the event to get updated status
      const { fetchEvent } = get()
      await fetchEvent(eventId)
      set({ rsvpState: 'success' })
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to RSVP'
      set({ rsvpState: 'error', error: message })
    }
  },

  // ── Leave event ────────────────────────────────────────────────
  leave: async (eventId) => {
    set({ rsvpState: 'loading' })
    try {
      await eventsApi.leave(eventId)
      const { fetchEvent, fetchAttendees } = get()
      await fetchEvent(eventId)
      await fetchAttendees(eventId)
      set({ rsvpState: 'success' })
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to leave event'
      set({ rsvpState: 'error', error: message })
    }
  },

  // ── Fetch attendees ────────────────────────────────────────────
  fetchAttendees: async (eventId) => {
    set({ loading: true, error: null })
    try {
      const attendees = await eventsApi.getAttendees(eventId)
      set({ attendees, loading: false })
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch attendees'
      set({ error: message, loading: false })
    }
  },

  // ── My Events ──────────────────────────────────────────────────
  fetchMyEvents: async (filter = 'all') => {
    set({ loading: true, error: null })
    try {
      const events = await eventsApi.getMyEvents(filter)
      set({ myEvents: events, loading: false })
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch events'
      set({ error: message, loading: false })
    }
  },

  // ── Get upload URL ─────────────────────────────────────────────
  getUploadUrl: async (eventId, contentType) => {
    try {
      return await eventsApi.getUploadUrl(eventId, contentType)
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get upload URL'
      set({ error: message })
      return null
    }
  },

  // ── State resets ───────────────────────────────────────────────
  resetFormState: () => set({
    formState: { isSubmitting: false, isSuccess: false, error: null },
  }),
  resetRsvpState: () => set({ rsvpState: 'idle' }),
  clearError: () => set({ error: null }),
  setCurrentEvent: (event) => set({ currentEvent: event }),
}))
