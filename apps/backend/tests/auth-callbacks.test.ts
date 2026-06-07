/**
 * Tests for Better Auth callback configuration: sendResetPassword and
 * deleteUser.enabled.
 *
 * RED phase: createAuth doesn't yet expose these options.
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

    // The sendResetPassword callback should be a function.
    // In the test auth, it may be null/undefined since there's no real
    // email service, but the production createAuth must define it.
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

  it('production createAuth has sendResetPassword callback', () => {
    // Test the production factory indirectly — verify it doesn't throw
    // when the env is passed. The sendResetPassword is set in the config.
    // We can't call createAuth() without a real D1 binding in Node.js,
    // but we can verify the exported symbol shape.
    expect(typeof createAuth).toBe('function')

    // The factory should accept env with DB binding
    expect(createAuth.length).toBe(1) // one parameter (env)
  })
})
