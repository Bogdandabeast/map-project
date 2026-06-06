/* eslint-disable node/prefer-global/process -- Cloudflare Workers nodejs_compat */
import { betterAuth } from 'better-auth'
import { admin } from "better-auth/plugins"
import { adminClient } from "better-auth/client/plugins"
/**
 * Better Auth with native D1 support.
 *
 * Pass env.DB directly as the database option — Better Auth auto-detects
 * the D1 binding and uses its built-in Kysely adapter.
 *
 * For CLI tools (auth generate), the static export is used.
 * At runtime, call createAuth(env) with the Worker environment.
 */

export const auth = betterAuth({
  database: null as unknown as D1Database,
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET || '',
  plugins: [
          admin()
      ]
})

/**
 * Create an auth instance with the real D1 binding from the Worker env.
 */
export function createAuth(env: { DB: D1Database, BETTER_AUTH_SECRET?: string, BETTER_AUTH_URL?: string }) {
  return betterAuth({
    database: env.DB,
    emailAndPassword: {
      enabled: true,
    },
    baseURL: env.BETTER_AUTH_URL || 'http://localhost:3000',
    secret: env.BETTER_AUTH_SECRET || '',

    plugins: [
            adminClient()
        ]
  })
}
