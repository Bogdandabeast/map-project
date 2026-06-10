/**
 * Validation tests for game.ts (Task 1.2)
 *
 * Verifies Zod v4 validation schemas for game search and detail operations.
 */
import { describe, expect, test } from 'bun:test'
import {
  gameDetailParamsSchema,
  gameSearchSchema,
} from '../../../../../packages/validations/src/game'

describe('gameSearchSchema', () => {
  test('accepts valid search query', () => {
    const valid = { q: 'Catan' }
    const result = gameSearchSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('rejects empty query string', () => {
    const invalid = { q: '' }
    const result = gameSearchSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  test('rejects query longer than 100 characters', () => {
    const invalid = { q: 'a'.repeat(101) }
    const result = gameSearchSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  test('accepts query at max length (100 chars)', () => {
    const valid = { q: 'a'.repeat(100) }
    const result = gameSearchSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('accepts single character query', () => {
    const valid = { q: 'a' }
    const result = gameSearchSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('rejects missing query field', () => {
    const result = gameSearchSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('gameDetailParamsSchema', () => {
  test('accepts valid UUID', () => {
    const valid = { id: '550e8400-e29b-41d4-a716-446655440000' }
    const result = gameDetailParamsSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('rejects non-UUID string', () => {
    const invalid = { id: 'not-a-uuid' }
    const result = gameDetailParamsSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  test('rejects empty id string', () => {
    const result = gameDetailParamsSchema.safeParse({ id: '' })
    expect(result.success).toBe(false)
  })

  test('rejects missing id field', () => {
    const result = gameDetailParamsSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
