/**
 * Better Auth config for CLI tools (generate, migrate).
 *
 * The runtime config lives in src/db/lib/auth.ts using D1 native support.
 * This file provides a Drizzle-based config so the CLI can introspect
 * plugins and schema without a live D1 binding.
 */
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import { admin, bearer, jwt } from "better-auth/plugins"
import { user, session, account, verification } from "./src/db/schema/auth"

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

const db = drizzle(createClient({ url: ":memory:" }))

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: requireSecret(process.env.BETTER_AUTH_SECRET, "BETTER_AUTH_SECRET"),
  plugins: [admin(), bearer(), jwt()],
})
