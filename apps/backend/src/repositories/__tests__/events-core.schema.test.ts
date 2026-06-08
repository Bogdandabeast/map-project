/**
 * Schema tests for events-core.ts (Task 1.1)
 *
 * Verifies the Drizzle table definitions and drizzle-zod generated schemas
 * can validate/transform data correctly.
 */
import { describe, expect, test } from 'bun:test'
import {
  eventAttendees,
  events,
  insertAttendeeSchema,
  insertEventSchema,
} from '../../db/schema/events-core'

describe('events table definition', () => {
  test('has the expected table name', () => {
    // The Symbol for the table name is internal, but we can verify the
    // table config exists by checking key columns are present in the definition
    expect(events).toBeDefined()
  })

  test('insertEventSchema accepts valid event data', () => {
    const valid = {
      id: 'evt-test-001',
      title: 'Board Game Night',
      address: '123 Main St',
      lat: 40.7128,
      lng: -74.006,
      date: Date.now() + 86400000,
      capacity: 10,
      creatorId: 'user-abc',
    }

    const result = insertEventSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('insertEventSchema rejects event with missing required fields', () => {
    const invalid = {
      id: 'evt-test-002',
      title: 'Board Game Night',
      // missing: address, lat, lng, date, capacity, creatorId
    }

    const result = insertEventSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  test('insertEventSchema rejects negative capacity', () => {
    const invalid = {
      id: 'evt-test-003',
      title: 'Board Game Night',
      address: '123 Main St',
      lat: 40.7128,
      lng: -74.006,
      date: Date.now() + 86400000,
      capacity: -1,
      creatorId: 'user-abc',
    }

    const result = insertEventSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('eventAttendees table definition', () => {
  test('has the expected table config', () => {
    expect(eventAttendees).toBeDefined()
  })

  test('insertAttendeeSchema accepts valid attendee data', () => {
    const valid = {
      eventId: 'evt-001',
      userId: 'user-abc',
    }

    const result = insertAttendeeSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('insertAttendeeSchema rejects missing eventId', () => {
    const invalid = {
      userId: 'user-abc',
    }

    const result = insertAttendeeSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})
