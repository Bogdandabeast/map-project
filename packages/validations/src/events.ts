import { z } from 'zod/v4'

// ── Shared enums ──────────────────────────────────────────────────
export const SkillLevel = z.enum(['beginner', 'intermediate', 'advanced'])
export const EventStatus = z.enum([
  'upcoming',
  'full',
  'cancelled',
  'past',
])

// ── Create Event Schema ───────────────────────────────────────────
export const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  address: z.string().min(1).max(500),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  date: z.number().int().refine(ts => ts > Date.now(), {
    message: 'Event date must be in the future',
  }),
  capacity: z.number().int().min(1).max(10000),
  plannedGames: z.array(z.string()).optional(),
  skillLevel: SkillLevel.optional(),
  atmosphere: z.string().max(1000).optional(),
})

export type CreateEventInput = z.infer<typeof createEventSchema>

// ── Update Event Schema ───────────────────────────────────────────
export const updateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  address: z.string().min(1).max(500).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  date: z
    .number()
    .int()
    .refine(ts => ts > Date.now(), {
      message: 'Event date must be in the future',
    })
    .optional(),
  capacity: z.number().int().min(1).max(10000).optional(),
  plannedGames: z.array(z.string()).optional(),
  skillLevel: SkillLevel.optional(),
  atmosphere: z.string().max(1000).optional(),
})

export type UpdateEventInput = z.infer<typeof updateEventSchema>

// ── Event Params Schema ───────────────────────────────────────────
export const eventParamsSchema = z.object({
  id: z.string().min(1),
})

export type EventParams = z.infer<typeof eventParamsSchema>
