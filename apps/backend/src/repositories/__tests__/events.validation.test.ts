/**
 * Validation tests for events.ts (Task 1.2)
 *
 * Verifies Zod validation schemas for event API operations.
 */
import { describe, expect, test } from 'bun:test'
import {
  createEventSchema,
  eventParamsSchema,
  updateEventSchema,
} from '../../../../../packages/validations/src/events'

describe('createEventSchema', () => {
  test('accepts valid event creation data', () => {
    const valid = {
      title: 'Board Game Night',
      address: '123 Main St, New York',
      lat: 40.7128,
      lng: -74.006,
      date: Date.now() + 86400000,
      capacity: 10,
      plannedGames: ['catan', 'wingspan'],
      skillLevel: 'beginner',
      atmosphere: 'Casual fun night',
    }

    const result = createEventSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('rejects title shorter than 3 characters', () => {
    const invalid = {
      title: 'Bo',
      address: '123 Main St',
      lat: 40.7128,
      lng: -74.006,
      date: Date.now() + 86400000,
      capacity: 10,
    }

    const result = createEventSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  test('rejects empty title', () => {
    const invalid = {
      title: '',
      address: '123 Main St',
      lat: 40.7128,
      lng: -74.006,
      date: Date.now() + 86400000,
      capacity: 10,
    }

    const result = createEventSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  test('rejects a past date', () => {
    const invalid = {
      title: 'Past Event',
      address: '123 Main St',
      lat: 40.7128,
      lng: -74.006,
      date: Date.now() - 86400000,
      capacity: 10,
    }

    const result = createEventSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  test('rejects capacity of zero', () => {
    const invalid = {
      title: 'No Capacity Event',
      address: '123 Main St',
      lat: 40.7128,
      lng: -74.006,
      date: Date.now() + 86400000,
      capacity: 0,
    }

    const result = createEventSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  test('accepts optional fields as undefined', () => {
    const minimal = {
      title: 'Minimal Event',
      address: '123 Main St',
      lat: 40.7128,
      lng: -74.006,
      date: Date.now() + 86400000,
      capacity: 5,
    }

    const result = createEventSchema.safeParse(minimal)
    expect(result.success).toBe(true)
  })
})

describe('updateEventSchema', () => {
  test('allows partial updates', () => {
    const partial = {
      title: 'Updated Title',
      capacity: 15,
    }

    const result = updateEventSchema.safeParse(partial)
    expect(result.success).toBe(true)
  })

  test('accepts empty object (no changes)', () => {
    const result = updateEventSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  test('rejects negative capacity in update', () => {
    const invalid = { capacity: -5 }
    const result = updateEventSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('eventParamsSchema', () => {
  test('accepts valid event ID', () => {
    const valid = { id: 'evt-12345-abcde' }
    const result = eventParamsSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('rejects missing ID', () => {
    const result = eventParamsSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  test('rejects empty ID string', () => {
    const result = eventParamsSchema.safeParse({ id: '' })
    expect(result.success).toBe(false)
  })
})
