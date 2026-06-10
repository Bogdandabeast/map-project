import type { Attendee, Event, MyEventsFilter } from '../types/event.types'
import { EventAdapter } from '../adapters/EventAdapter'
import * as eventApi from '../services/events'

// ── DTO types ──────────────────────────────────────────────────────

export interface CreateEventDTO {
  title: string
  address: string
  date: number
  capacity: number
  lat?: number
  lng?: number
  plannedGames?: string[]
  skillLevel?: string
  atmosphere?: string
  imageKey?: string | null
}

export interface UpdateEventDTO {
  title?: string
  address?: string
  date?: number
  capacity?: number
  lat?: number
  lng?: number
  plannedGames?: string[]
  skillLevel?: string
  atmosphere?: string
}

export class EventRepository {
  /**
   * Fetches all events for the current user based on filter
   */
  async getMyEvents(filter: MyEventsFilter = 'all'): Promise<Event[]> {
    const data = await eventApi.getMyEvents(filter)
    return EventAdapter.toDomainList(data)
  }

  /**
   * Fetches a specific event by ID
   */
  async getEventById(id: string): Promise<Event> {
    const data = await eventApi.getEventById(id)
    return EventAdapter.toDomain(data)
  }

  /**
   * Fetches attendees for a specific event
   */
  async getAttendees(eventId: string): Promise<Attendee[]> {
    const data = await eventApi.getAttendees(eventId)
    return EventAdapter.toAttendeeDomainList(data)
  }

  /**
   * Creates a new event
   */
  async createEvent(data: CreateEventDTO): Promise<Event> {
    const payload = EventAdapter.toApiPayload(data)
    const response = await eventApi.createEvent(payload)
    return EventAdapter.toDomain(response)
  }

  /**
   * Updates an existing event
   */
  async updateEvent(id: string, data: UpdateEventDTO): Promise<Event> {
    const payload = EventAdapter.toApiPayload(data)
    const response = await eventApi.updateEvent(id, payload)
    return EventAdapter.toDomain(response)
  }

  /**
   * Deletes an event
   */
  async deleteEvent(id: string): Promise<void> {
    await eventApi.deleteEvent(id)
  }

  /**
   * Cancels an event
   */
  async cancelEvent(id: string): Promise<Event> {
    const response = await eventApi.cancelEvent(id)
    return EventAdapter.toDomain(response)
  }

  /**
   * Handles RSVP for an event
   */
  async rsvpToEvent(eventId: string): Promise<void> {
    await eventApi.rsvp(eventId)
  }

  /**
   * Leaves an event RSVP
   */
  async leaveEvent(eventId: string): Promise<void> {
    await eventApi.leave(eventId)
  }
}

// Export a singleton instance for the app
export const eventRepository = new EventRepository()
