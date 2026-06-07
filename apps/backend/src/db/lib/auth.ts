/* eslint-disable node/prefer-global/process -- Cloudflare Workers nodejs_compat */
import { betterAuth } from 'better-auth'
import { admin,bearer,jwt } from 'better-auth/plugins'


function requireSecret(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing required env var: ${name}. `
      + `Better Auth requires a secret to sign tokens. `
      + `Generate one with: openssl rand -hex 32`,
    )
  }
  return value
}

/**
 * Better Auth with native D1 support.
 *
 * Pass env.DB directly as the database option — Better Auth auto-detects
 * the D1 binding and uses its built-in Kysely adapter.
 *
 * For CLI tools (auth generate), the static export is used.
 * At runtime, call createAuth(env) with the Worker environment.
 */

function createStaticAuth() {
  return betterAuth({
    database: null as unknown as D1Database,
    emailAndPassword: {
      enabled: true,
    },
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    secret: requireSecret(process.env.BETTER_AUTH_SECRET, 'BETTER_AUTH_SECRET'),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'github'],
      },
    },
    plugins: [admin(), bearer(), jwt()],
  })
}

let _staticAuth: ReturnType<typeof betterAuth> | null = null

export const auth = new Proxy<ReturnType<typeof betterAuth>>(
  {} as ReturnType<typeof betterAuth>,
  {
    get(_, p) {
      if (!_staticAuth)
        _staticAuth = createStaticAuth()
      const v = Reflect.get(_staticAuth, p)
      return typeof v === 'function' ? v.bind(_staticAuth) : v
    },
    has(_, p) {
      if (!_staticAuth)
        _staticAuth = createStaticAuth()
      return Reflect.has(_staticAuth, p)
    },
  },
)

/**
 * Create an auth instance with the real D1 binding from the Worker env.
 */
export function createAuth(env: {
  DB: D1Database
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
}) {
  return betterAuth({
    database: env.DB,
    emailAndPassword: {
      enabled: true,
    },
    baseURL: env.BETTER_AUTH_URL || 'http://localhost:3000',
    secret: requireSecret(env.BETTER_AUTH_SECRET, 'env.BETTER_AUTH_SECRET'),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID || '',
        clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID || '',
        clientSecret: env.GITHUB_CLIENT_SECRET || '',
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'github', 'email-password'],
      },
    },
    plugins: [
      admin(),
      bearer(),
      jwt(),
    ],
  })
}

/**
 * Factory signature for creating an auth instance from environment.
 * The default implementation is `createAuth`; tests inject a
 * libsql-backed alternative via the middleware test helpers.
 */
type CreateAuthEnv = Parameters<typeof createAuth>[0]
export type AuthFactory = (env: CreateAuthEnv) => ReturnType<typeof createAuth>
