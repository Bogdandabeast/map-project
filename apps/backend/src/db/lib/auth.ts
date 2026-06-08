/* eslint-disable node/prefer-global/process -- Cloudflare Workers nodejs_compat */
import type { BackendEnv } from '../../env'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { betterAuth } from 'better-auth'
import { admin, bearer, jwt } from 'better-auth/plugins'
import { drizzle } from 'drizzle-orm/d1'
import { account, jwks, session, user, verification } from '../schema/auth'

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
 * Better Auth with Drizzle ORM + D1 adapter.
 *
 * We use `drizzleAdapter` so Better Auth respects the Drizzle column
 * name mappings (snake_case in SQLite → camelCase in JS).  Passing
 * `env.DB` directly would make Better Auth's built-in Kysely adapter
 * generate SQL with camelCase columns, which don't exist in the
 * Drizzle-created tables.
 *
 * For CLI tools (auth generate), the static export is used.
 * At runtime, call createAuth(env) with the Worker environment.
 */

function createStaticAuth() {
  return betterAuth({
    database: null as unknown as D1Database,
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        // eslint-disable-next-line no-console
        console.log(`Password reset requested for ${user.email}: ${url}`)
      },
    },
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    secret: requireSecret(process.env.BETTER_AUTH_SECRET, 'BETTER_AUTH_SECRET'),
    user: {
      deleteUser: {
        enabled: true,
      },
    },
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
 * Create an auth instance from the already-validated environment.
 *
 * All string-based secrets and URLs come from {@link BackendEnv}
 * (parsed by Zod at the handler level).  Only the D1 binding is
 * passed separately since it's a Cloudflare platform binding, not
 * a validated string.
 */
export function createAuth(env: BackendEnv & { DB: D1Database }) {
  const db = drizzle(env.DB)
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: { user, session, account, verification, jwks },
    }),
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        // eslint-disable-next-line no-console
        console.log(`Password reset requested for ${user.email}: ${url}`)
      },
    },
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
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

export type { AuthFactory } from '../../types/auth'
