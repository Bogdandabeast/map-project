import { describe, expect, it } from 'bun:test'
import app from '../src/app'

describe('Hono Routing Debug', () => {
  it('should reach the debug route', async () => {
    const res = await app.request('/api/auth/debug')
    console.warn('Debug Status:', res.status)
    expect(res.status).toBe(200)
  })
})
