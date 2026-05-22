import { Hono } from 'hono'
import { afterEach, describe, expect, it, vi } from 'vitest'

import onError from './on-error.js'

describe('onError', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    vi.restoreAllMocks()
  })

  it('should use NODE_ENV from context if defined', async () => {
    const app = new Hono()
    app.use('*', async (c, next) => {
      c.env = { NODE_ENV: 'production' }
      await next()
    })
    app.get('/', () => {
      throw new Error('Test error')
    })
    app.onError(onError)

    const response = await app.request('/')
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json).toEqual({
      message: 'Test error',
    })
  })

  it('should use NODE_ENV from process.env otherwise', async () => {
    process.env.NODE_ENV = 'production'
    const app = new Hono()
    app.get('/', () => {
      throw new Error('Test error')
    })
    app.onError(onError)

    const response = await app.request('/')
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json).toEqual({
      message: 'Test error',
    })
  })
})
