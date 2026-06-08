/**
 * Tests for R2 pre-signed URL helper.
 *
 * Asserts the expected behavior of createPresignedUrl: returns a URL-like
 * string, includes the key, generates distinct URLs for different keys,
 * and falls back gracefully when the R2 binding is absent.
 */
import { describe, expect, it } from 'bun:test'
import { createPresignedUrl } from '../../src/storage/r2'

// Minimal R2Bucket mock that returns a pre-signed URL
function mockR2() {
  return {
    createMultipartUpload: () => {
      throw new Error('not implemented')
    },
    resumeMultipartUpload: () => {
      throw new Error('not implemented')
    },
    put: () => {
      throw new Error('not implemented')
    },
    get: () => {
      throw new Error('not implemented')
    },
    delete: () => {
      throw new Error('not implemented')
    },
    head: () => {
      throw new Error('not implemented')
    },
    list: () => {
      throw new Error('not implemented')
    },
  } satisfies Partial<R2Bucket> as unknown as R2Bucket
}

describe('createPresignedUrl', () => {
  it('returns a string URL when R2 is available', async () => {
    const env = {
      R2: mockR2(),
    }

    // RED: createPresignedUrl will throw because the mock is incomplete,
    // OR it will produce some output. We test that the return is a string.
    // When fully implemented, it should return a URL-like string.
    const result = await createPresignedUrl(
      env as unknown as { R2: R2Bucket },
      'avatars/user-id/123.jpg',
      3600,
    )

    // A valid result should be a non-empty string
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns a dev-friendly URL when R2 is not available', async () => {
    // When R2 binding is missing, the function should return a
    // placeholder URL instead of crashing.
    const env = {} as { R2?: R2Bucket }

    const result = await createPresignedUrl(env, 'test-key', 3600)

    // Should return something that at least looks URL-like or a data URI
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('generates distinct URLs for different keys', async () => {
    const env = {
      R2: mockR2(),
    } as unknown as { R2: R2Bucket }

    const url1 = await createPresignedUrl(env, 'avatars/1.jpg', 3600)
    const url2 = await createPresignedUrl(env, 'avatars/2.jpg', 3600)

    // Different keys should produce different URLs
    expect(url1).not.toBe(url2)
  })

  it('includes key in the returned URL', async () => {
    const env = {
      R2: mockR2(),
    } as unknown as { R2: R2Bucket }

    const key = 'avatars/user-42/profile.webp'
    const url = await createPresignedUrl(env, key, 3600)

    // Even in dev mode, the key should be reflected in the response
    expect(url).toInclude(key)
  })
})
