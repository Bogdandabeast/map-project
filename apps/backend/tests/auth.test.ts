import { describe, expect, it } from 'bun:test'
import app from '../src/app'

describe('Auth Middleware', () => {
  it('should return 401 when accessing protected route without session', async () => {
    // This test is currently RED.
    // It will fail because the middleware is not yet implemented.
    const res = await app.request('/api/protected')
    expect(res.status).toBe(401)
  })
})
