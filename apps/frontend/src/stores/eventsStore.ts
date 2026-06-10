import type { Attendee, Event, MyEventsFilter } from '../types/event.types'
import { create } from 'zustand'
import { eventRepository } from '../repositories/EventRepository'

// ── State shape ────────────────────────────────────────────────────

export interface EventsStore {
  // Data
  events: Event[]
  currentEvent: Event | null
  attendees: Attendee[]
  myEvents: Event[]

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
  createEvent: (data: any) => Promise<Event | null>
  updateEvent: (id: string, data: Record<string, unknown>) => Promise<Event | null>
  deleteEvent: (id: string) => Promise<boolean>
  cancelEvent: (id: string) => Promise<Event | null>

  // Actions — RSVP
  rsvp: (eventId: string) => Promise<void>
  leave: (eventId: string) => Promise<void>
  fetchAttendees: (eventId: string) => Promise<void>

  // Actions — My Events
  fetchMyEvents: (filter?: MyEventsFilter) => Promise<void>

  // Actions — Upload
  // Note: Upload URL is a direct infrastructure call, can stay as is or move to a service.
  // For now we will keep it as a direct call or use a separate service to avoid polluting the Repository.
  getUploadUrl: (eventId: string, contentType?: string) => Promise<{ uploadUrl: string, key: string } | null>

  // State resets
  resetFormState: () => void
  resetRsvpState: () => void
  clearError: () => void
  setCurrentEvent: (event: Event | null) => void
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
    set({ loading: true, error: null })
    try {
      const event = await eventRepository.getEventById(id)
      set({ currentEvent: event, loading: false })
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
      const event = await eventRepository.createEvent(data)
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
      const updated = await eventRepository.updateEvent(id, data)
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
      await eventRepository.deleteEvent(id)
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
      const cancelled = await eventRepository.cancelEvent(id)
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
      await eventRepository.rsvpToEvent(eventId)
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
      await eventRepository.leaveEvent(eventId)
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
      const attendees = await eventRepository.getAttendees(eventId)
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
      const events = await eventRepository.getMyEvents(filter)
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
      // For upload URLs, we call the service directly as it's an infrastructure detail
      // and doesn't involve a domain entity mapping.
      const { getUploadUrl } = await import('../services/events')
      return await getUploadUrl(eventId, contentType)
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
  setCurrentEvent: event => set({ currentEvent: event }),
}))
