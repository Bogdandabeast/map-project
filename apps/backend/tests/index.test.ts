import * as HttpStatusPhrases from '@repo/stoker/http-status-phrases'
import { describe, expect, test } from 'bun:test'
import app from '../src/app'

describe('Backend app', () => {
  test('GET / returns 200 and hello message', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello Hono!')
  })

  test('GET /non-existent returns 404 from stoker notFound', async () => {
    const path = '/non-existent'
    const res = await app.request(path)
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json).toHaveProperty('message')
    expect(json.message).toContain(HttpStatusPhrases.NOT_FOUND)
    expect(json.message).toContain(path)
  })
})
