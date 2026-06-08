import { API_URL } from '../env'

// ── Types (mirror API response shapes) ────────────────────────────────

export interface EventData {
  id: string
  title: string
  address: string
  lat: number
  lng: number
  date: number
  capacity: number
  plannedGames: string[]
  skillLevel: string | null
  atmosphere: string | null
  imageKey: string | null
  creatorId: string
  createdAt: number
  updatedAt: number
  status: 'upcoming' | 'full' | 'cancelled' | 'past'
}

export interface Attendee {
  userId: string
  displayName: string | null
  avatarUrl: string | null
  rsvpAt: number
}

export interface RsvpResponse {
  eventId: string
  userId: string
  rsvpAt: number
}

export interface UploadUrlResponse {
  uploadUrl: string
  key: string
}

export type MyEventsFilter = 'created' | 'attending' | 'all'

// ── Fetch wrapper ─────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit & { expectNoContent?: boolean } = {},
): Promise<T> {
  const { headers: optHeaders, expectNoContent, ...rest } = options
  const headers: Record<string, string> = {
    ...(optHeaders instanceof Headers
      ? Object.fromEntries(optHeaders.entries())
      : (optHeaders as Record<string, string> | undefined)),
    'Content-Type': 'application/json',
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  if (response.status === 204) {
    return undefined as unknown as T
  }

  return response.json() as Promise<T>
}

// ── API functions ─────────────────────────────────────────────────────

/** POST /api/events — Create a new event */
export async function createEvent(
  data: {
    title: string
    address: string
    lat: number
    lng: number
    date: number
    capacity: number
    plannedGames?: string[]
    skillLevel?: string
    atmosphere?: string
  },
): Promise<EventData> {
  return request<EventData>('/api/events', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** PATCH /api/events/:id — Update an event (creator only) */
export async function updateEvent(
  id: string,
  data: Record<string, unknown>,
): Promise<EventData> {
  return request<EventData>(`/api/events/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/** DELETE /api/events/:id — Delete an event (creator or mod/admin) */
export async function deleteEvent(id: string): Promise<void> {
  return request<void>(`/api/events/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

/** POST /api/events/:id/cancel — Cancel an event (creator only) */
export async function cancelEvent(id: string): Promise<EventData> {
  return request<EventData>(`/api/events/${encodeURIComponent(id)}/cancel`, {
    method: 'POST',
  })
}

/** POST /api/events/:id/upload-url — Get R2 pre-signed upload URL */
export async function getUploadUrl(
  eventId: string,
  contentType: string = 'image/jpeg',
): Promise<UploadUrlResponse> {
  return request<UploadUrlResponse>(
    `/api/events/${encodeURIComponent(eventId)}/upload-url`,
    {
      method: 'POST',
      body: JSON.stringify({ contentType }),
    },
  )
}

/** POST /api/events/:id/rsvp — RSVP to an event (409 if full) */
export async function rsvp(eventId: string): Promise<RsvpResponse> {
  return request<RsvpResponse>(
    `/api/events/${encodeURIComponent(eventId)}/rsvp`,
    { method: 'POST' },
  )
}

/** DELETE /api/events/:id/rsvp — Leave an event */
export async function leave(eventId: string): Promise<void> {
  return request<void>(
    `/api/events/${encodeURIComponent(eventId)}/rsvp`,
    { method: 'DELETE' },
  )
}

/** GET /api/events/:id/attendees — Get attendee list */
export async function getAttendees(eventId: string): Promise<Attendee[]> {
  return request<Attendee[]>(
    `/api/events/${encodeURIComponent(eventId)}/attendees`,
  )
}

/** GET /api/me/events?filter=created|attending|all — Get my events */
export async function getMyEvents(
  filter: MyEventsFilter = 'all',
): Promise<EventData[]> {
  return request<EventData[]>(
    `/api/me/events?filter=${encodeURIComponent(filter)}`,
  )
}
