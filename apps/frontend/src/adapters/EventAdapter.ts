import type { Attendee as ApiAttendee, EventData } from '../services/events'
import type { Attendee, Event } from '../types/event.types'

export class EventAdapter {
  /**
   * Maps raw API EventData to Domain Event
   */
  static toDomain(apiEvent: EventData): Event {
    return {
      ...apiEvent,
      date: new Date(apiEvent.date),
      createdAt: new Date(apiEvent.createdAt),
      updatedAt: new Date(apiEvent.updatedAt),
    }
  }

  /**
   * Maps a list of API EventData to Domain Events
   */
  static toDomainList(apiEvents: EventData[]): Event[] {
    return apiEvents.map(e => EventAdapter.toDomain(e))
  }

  /**
   * Maps raw API Attendee to Domain Attendee
   */
  static toAttendeeDomain(apiAttendee: ApiAttendee): Attendee {
    return {
      ...apiAttendee,
      rsvpAt: new Date(apiAttendee.rsvpAt),
    }
  }

  /**
   * Maps a list of API Attendees to Domain Attendees
   */
  static toAttendeeDomainList(apiAttendees: ApiAttendee[]): Attendee[] {
    return apiAttendees.map(a => EventAdapter.toAttendeeDomain(a))
  }

  /**
   * Maps Domain Event back to API payload (for POST/PATCH)
   */
  static toApiPayload(event: any): any {
    const payload = { ...event }
    if (payload.date instanceof Date)
      payload.date = payload.date.getTime()
    return payload
  }
}
