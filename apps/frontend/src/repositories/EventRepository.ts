import type { Attendee, Event, MyEventsFilter } from '../types/event.types'
import { EventAdapter } from '../adapters/EventAdapter'
import * as eventApi from '../services/events'

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
    // The current API doesn't have a direct /api/events/:id GET in the service,
    // it uses getMyEvents as a workaround. We maintain that logic here.
    const events = await eventApi.getMyEvents('all')
    const event = events.find(e => e.id === id)
    if (!event)
      throw new Error('Event not found')
    return EventAdapter.toDomain(event)
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
  async createEvent(data: any): Promise<Event> {
    const payload = EventAdapter.toApiPayload(data)
    const response = await eventApi.createEvent(payload)
    return EventAdapter.toDomain(response)
  }

  /**
   * Updates an existing event
   */
  async updateEvent(id: string, data: any): Promise<Event> {
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
