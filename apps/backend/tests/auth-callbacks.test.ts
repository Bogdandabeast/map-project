/**
 * Tests for Better Auth callback configuration: sendResetPassword and
 * deleteUser.enabled.
 *
 * createTestAuth (the test helper in auth-setup.ts) configures both
 * sendResetPassword and deleteUser.enabled. The production createAuth
 * also provides sendResetPassword via emailAndPassword.
 */
import { describe, expect, it } from 'bun:test'
import { createAuth } from '../src/db/lib/auth'
import { createTestAuth } from './auth-setup'

describe('Better Auth callbacks', () => {
  it('configures sendResetPassword in emailAndPassword', async () => {
    // createAuth() currently doesn't accept sendResetPassword — this will
    // fail until Task A is implemented.
    const { auth } = await createTestAuth()

    const emailOpts = auth.options.emailAndPassword
    expect(emailOpts).toBeDefined()
    expect(emailOpts?.enabled).toBe(true)

    // sendResetPassword is configured in the test auth and required
    // in production — verify it's a defined function.
    expect(emailOpts?.sendResetPassword).toBeDefined()
    expect(typeof emailOpts?.sendResetPassword).toBe('function')
  })

  it('enables account deletion via user.deleteUser.enabled', async () => {
    const { auth } = await createTestAuth()

    // user.deleteUser.enabled should be true
    const userOpts = (auth.options as Record<string, unknown>).user as
      | Record<string, unknown>
      | undefined
    const deleteUser = userOpts?.deleteUser as Record<string, unknown> | undefined
    expect(deleteUser?.enabled).toBe(true)
  })

  it('production createAuth configures sendResetPassword callback', () => {
    // Mock a minimal D1 binding so we can call createAuth and inspect
    // the returned auth config. D1's prepare() returns a statement with
    // a .all() stub — enough to let better-auth initialise without I/O.
    const mockD1 = {
      prepare: () => ({
        all: async () => ({ results: [] }),
        first: async () => null,
        run: async () => ({ success: true }),
        raw: async () => [],
      }),
    } as unknown as D1Database

    const auth = createAuth({
      BETTER_AUTH_SECRET: 'test-secret-32-chars-test-secret-32-c',
      BETTER_AUTH_URL: 'http://localhost:3000',
      GITHUB_CLIENT_ID: '',
      GITHUB_CLIENT_SECRET: '',
      GOOGLE_CLIENT_ID: '',
      GOOGLE_CLIENT_SECRET: '',
      DB: mockD1,
    })

    const emailOpts = auth.options.emailAndPassword
    expect(emailOpts).toBeDefined()
    expect(emailOpts?.sendResetPassword).toBeInstanceOf(Function)
  })
})
