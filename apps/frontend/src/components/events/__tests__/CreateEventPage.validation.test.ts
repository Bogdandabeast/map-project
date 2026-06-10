import { describe, expect, it } from 'bun:test'
import { validateCreateEventForm } from '../../../pages/events/CreateEventPage'

// ── Tests ─────────────────────────────────────────────────────────

describe('validateCreateEventForm', () => {
  const validData = {
    title: 'Game Night',
    address: 'Calle Mayor 12',
    date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    capacity: 8,
  }

  it('returns no errors for valid data', () => {
    const errors = validateCreateEventForm(validData)
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it('rejects empty title', () => {
    const errors = validateCreateEventForm({ ...validData, title: '' })
    expect(errors.title).toBeDefined()
  })

  it('rejects title shorter than 3 characters', () => {
    const errors = validateCreateEventForm({ ...validData, title: 'AB' })
    expect(errors.title).toContain('at least 3')
  })

  it('rejects title longer than 200 characters', () => {
    const errors = validateCreateEventForm({ ...validData, title: 'A'.repeat(201) })
    expect(errors.title).toContain('at most 200')
  })

  it('rejects empty address', () => {
    const errors = validateCreateEventForm({ ...validData, address: '' })
    expect(errors.address).toBeDefined()
  })

  it('rejects empty date', () => {
    const errors = validateCreateEventForm({ ...validData, date: '' })
    expect(errors.date).toBeDefined()
  })

  it('rejects date in the past', () => {
    const errors = validateCreateEventForm({
      ...validData,
      date: new Date(Date.now() - 86400000).toISOString(),
    })
    expect(errors.date).toContain('5 minutes from now')
  })

  it('rejects capacity of 0', () => {
    const errors = validateCreateEventForm({ ...validData, capacity: 0 })
    expect(errors.capacity).toContain('at least 1')
  })

  it('rejects capacity over 10000', () => {
    const errors = validateCreateEventForm({ ...validData, capacity: 10001 })
    expect(errors.capacity).toContain('at most 10,000')
  })

  it('accepts capacity of 1', () => {
    const errors = validateCreateEventForm({ ...validData, capacity: 1 })
    expect(errors.capacity).toBeUndefined()
  })

  it('accepts capacity of 10000', () => {
    const errors = validateCreateEventForm({ ...validData, capacity: 10000 })
    expect(errors.capacity).toBeUndefined()
  })

  it('returns multiple errors when multiple fields are invalid', () => {
    const errors = validateCreateEventForm({
      title: '',
      address: '',
      date: '',
      capacity: 0,
    })
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(3)
  })
})
