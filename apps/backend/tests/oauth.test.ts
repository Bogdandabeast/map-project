import type { AuthCtx } from './auth-setup'
/**
 * Integration tests for OAuth social providers (Google, GitHub).
 *
 * Verifies that the social provider endpoints are properly configured
 * and return valid OAuth authorization redirects.
 */
import { beforeAll, describe, expect, it } from 'bun:test'
import { createTestAuth } from './auth-setup'

let ctx: AuthCtx

beforeAll(async () => {
  ctx = await createTestAuth()
})

// ══════════════════════════════════════════════════════════════
// Social provider configuration
// ══════════════════════════════════════════════════════════════

describe('social provider configuration', () => {
  it('has Google configured as a social provider', () => {
    const opts = ctx.auth.options
    expect(opts.socialProviders).toBeDefined()
    expect(opts.socialProviders?.google).toBeDefined()
    expect(opts.socialProviders?.google?.clientId).toBe('test-google-client-id')
  })

  it('has GitHub configured as a social provider', () => {
    const opts = ctx.auth.options
    expect(opts.socialProviders?.github).toBeDefined()
    expect(opts.socialProviders?.github?.clientId).toBe('test-github-client-id')
  })

  it('has account linking enabled with trusted providers', () => {
    const opts = ctx.auth.options
    expect(opts.account?.accountLinking).toBeDefined()
    expect(opts.account?.accountLinking?.enabled).toBe(true)
    expect(opts.account?.accountLinking?.trustedProviders).toContain('google')
    expect(opts.account?.accountLinking?.trustedProviders).toContain('github')
    expect(opts.account?.accountLinking?.trustedProviders).toContain(
      'email-password',
    )
  })
})

// ══════════════════════════════════════════════════════════════
// OAuth sign-in endpoints
// ══════════════════════════════════════════════════════════════

describe('OAuth sign-in endpoints', () => {
  it('POST /api/auth/sign-in/social with Google returns a redirect URL', async () => {
    const req = new Request('http://localhost/api/auth/sign-in/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'google',
        callbackURL: '/',
        disableRedirect: true,
      }),
    })
    const res = await ctx.auth.handler(req)
    const body = await res.json() as {
      url?: string
      redirect?: boolean
      error?: string
    }

    // With test credentials, Better Auth builds the OAuth authorize URL
    expect(body.url).toBeDefined()
    expect(body.url).toInclude('accounts.google.com')
    expect(body.url).toInclude('client_id=test-google-client-id')
    expect(body.url).toInclude('redirect_uri')
  })

  it('POST /api/auth/sign-in/social with GitHub returns a redirect URL', async () => {
    const req = new Request('http://localhost/api/auth/sign-in/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'github',
        callbackURL: '/',
        disableRedirect: true,
      }),
    })
    const res = await ctx.auth.handler(req)
    const body = await res.json() as {
      url?: string
      redirect?: boolean
      error?: string
    }

    expect(body.url).toBeDefined()
    expect(body.url).toInclude('github.com')
    expect(body.url).toInclude('client_id=test-github-client-id')
  })

  it('POST /api/auth/sign-in/social with unknown provider returns an error', async () => {
    const req = new Request('http://localhost/api/auth/sign-in/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'unknown-provider',
        callbackURL: '/',
        disableRedirect: true,
      }),
    })
    const res = await ctx.auth.handler(req)
    expect(res.status).toBe(404)
    const body = await res.json() as { error?: string, message?: string }
    expect(body.error || body.message).toInclude('not found')
  })

  it('sign-in/social endpoint exists and responds', async () => {
    const req = new Request('http://localhost/api/auth/sign-in/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'google',
        callbackURL: '/',
        disableRedirect: true,
      }),
    })
    const res = await ctx.auth.handler(req)
    expect(res.status).toBe(200)
  })
})

// ══════════════════════════════════════════════════════════════
// OAuth callback error handling
// ══════════════════════════════════════════════════════════════

describe('OAuth callback error handling', () => {
  it('redirects to error when callback is missing the code parameter', async () => {
    const req = new Request(
      'http://localhost/api/auth/callback/google',
      { method: 'GET' },
    )
    const res = await ctx.auth.handler(req)

    // Better Auth catches the missing-state error and returns a redirect
    // to the configured error URL with an error query parameter.
    expect(res.status).toBe(302)
    const location = res.headers.get('location') || ''
    expect(location).toInclude('error=')
  })

  it('redirects to error URL for an unknown OAuth provider callback', async () => {
    const req = new Request(
      'http://localhost/api/auth/callback/unknown-provider',
      { method: 'GET' },
    )
    const res = await ctx.auth.handler(req)

    // Better Auth redirects to the base URL with an error query param
    // when the provider is not found in the config.
    expect(res.status).toBe(302)
    const location = res.headers.get('location') || ''
    expect(location).toInclude('error=')
  })
})

// ══════════════════════════════════════════════════════════════
// Account linking
// ══════════════════════════════════════════════════════════════

describe('account linking', () => {
  it('allows linking a social account via the API', async () => {
    // Create a user with email+password first
    const user = ctx.test.createUser({
      email: 'linking-test@example.com',
    })
    await ctx.test.saveUser(user)

    // The linkSocial endpoint should be available
    const req = new Request(
      'http://localhost/api/auth/link-social',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await ctx.test.login({ userId: user.id })).token}`,
        },
        body: JSON.stringify({
          provider: 'google',
          callbackURL: '/',
        }),
      },
    )
    const res = await ctx.auth.handler(req)
    // A 200 means the link-social endpoint exists and the request is valid.
    // It will try to redirect to Google for authorization — that's expected.
    expect(res.status).toBe(200)
  })
})
