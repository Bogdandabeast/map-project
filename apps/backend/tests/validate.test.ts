import { describe, expect, it } from 'bun:test'
import { Hono } from 'hono'
import { validateAuth } from '../src/middlewares/validate'

describe('validateAuth middleware', () => {
  it('rejects invalid email in sign-in body with 400', async () => {
    const app = new Hono()
    app.post('/api/auth/sign-in/email', validateAuth, c => c.text('ok'))

    const res = await app.request('/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad', password: '12345678' }),
    })

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty('error')
    expect(json).toHaveProperty('fields')
  })

  it('rejects short password in sign-up body with 400', async () => {
    const app = new Hono()
    app.post('/api/auth/sign-up/email', validateAuth, c => c.text('ok'))

    const res = await app.request('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John', email: 'user@example.com', password: '123' }),
    })

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty('error')
    expect(json).toHaveProperty('fields')
  })

  it('passes valid sign-in body to next handler', async () => {
    const app = new Hono()
    app.post('/api/auth/sign-in/email', validateAuth, c => c.text('ok'))

    const res = await app.request('/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: '12345678' }),
    })

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('ok')
  })

  it('passes valid sign-up body to next handler', async () => {
    const app = new Hono()
    app.post('/api/auth/sign-up/email', validateAuth, c => c.text('ok'))

    const res = await app.request('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John', email: 'user@example.com', password: '12345678' }),
    })

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('ok')
  })
})
