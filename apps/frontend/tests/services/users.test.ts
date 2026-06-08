import { beforeEach, describe, expect, it, mock } from 'bun:test'

import {
  addGame,
  confirmAvatar,
  getAvatarUploadUrl,
  getPublicProfile,
  removeGame,
} from '../../src/services/users'

// Mock global fetch
const mockFetch = mock(async (url: string, _options?: RequestInit) => {
  if (url.includes('/api/users/me/avatar/upload-url')) {
    return new Response(JSON.stringify({ uploadUrl: 'https://r2.example.com/upload', key: 'avatars/user-1' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (url.includes('/api/users/me/avatar')) {
    return new Response(null, { status: 204 })
  }
  if (url.includes('/api/users/me/games')) {
    return new Response(null, { status: 204 })
  }
  if (url.includes('/api/users/')) {
    return new Response(JSON.stringify({
      id: 'user-1',
      name: 'Test User',
      image: null,
      games: [],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return new Response(null, { status: 404 })
})

globalThis.fetch = mockFetch as typeof fetch

describe('users service', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('getAvatarUploadUrl', () => {
    it('calls the correct endpoint with credentials', async () => {
      const result = await getAvatarUploadUrl()

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(url).toContain('/api/users/me/avatar/upload-url')
      expect(options.credentials).toBe('include')
      expect(result).toEqual({ uploadUrl: 'https://r2.example.com/upload', key: 'avatars/user-1' })
    })
  })

  describe('confirmAvatar', () => {
    it('sends avatar key to the confirm endpoint', async () => {
      await confirmAvatar('avatars/user-1')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(url).toContain('/api/users/me/avatar')
      expect(options.method).toBe('PATCH')
      expect(options.credentials).toBe('include')
    })
  })

  describe('addGame', () => {
    it('sends gameId to the games endpoint', async () => {
      await addGame('game-1', 'intermediate')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const [_url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(options.method).toBe('POST')
      expect(options.credentials).toBe('include')
    })

    it('sends gameId without skillLevel when not provided', async () => {
      await addGame('game-2')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const [_url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      const body = JSON.parse(options.body as string)
      expect(body).toEqual({ gameId: 'game-2' })
    })
  })

  describe('removeGame', () => {
    it('sends DELETE to the games endpoint', async () => {
      await removeGame('game-1')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(url).toContain('/api/users/me/games/game-1')
      expect(options.method).toBe('DELETE')
      expect(options.credentials).toBe('include')
    })
  })

  describe('getPublicProfile', () => {
    it('fetches a public profile by userId', async () => {
      const profile = await getPublicProfile('user-1')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(url).toContain('/api/users/user-1')
      expect(options.credentials).toBe('include')
      expect(profile).toEqual({
        id: 'user-1',
        name: 'Test User',
        image: null,
        games: [],
      })
    })
  })

  describe('addGame body content', () => {
    it('includes skillLevel in body when provided', async () => {
      await addGame('game-1', 'advanced')

      const [_url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      const body = JSON.parse(options.body as string)
      expect(body).toEqual({ gameId: 'game-1', skillLevel: 'advanced' })
    })
  })

  describe('error handling', () => {
    it('throws on non-ok response for getAvatarUploadUrl', async () => {
      // Override mock for this test
      const errorFetch = mock(async () => new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }))
      globalThis.fetch = errorFetch as typeof fetch

      await expect(getAvatarUploadUrl()).rejects.toThrow()
    })
  })
})
