import { describe, expect, it } from 'bun:test'
import app from '../src/index'

describe('backend', () => {
  it('responds to GET /', async () => {
    const res = await app.fetch(new Request('http://localhost/'))
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello Hono!')
  })
})
