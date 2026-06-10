export type EventStatus = 'upcoming' | 'full' | 'cancelled' | 'past'

export interface Event {
  id: string
  title: string
  address: string
  lat: number
  lng: number
  date: Date // Convert number (timestamp) to Date object
  capacity: number
  plannedGames: string[]
  skillLevel: string | null
  atmosphere: string | null
  imageKey: string | null
  creatorId: string
  createdAt: Date
  updatedAt: Date
  status: EventStatus
}

export interface Attendee {
  userId: string
  displayName: string | null
  avatarUrl: string | null
  rsvpAt: Date
}

export type MyEventsFilter = 'created' | 'attending' | 'all'
