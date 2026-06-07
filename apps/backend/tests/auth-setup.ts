/**
 * Test helper for RBAC middleware tests.
 *
 * Creates an in-memory SQLite database, applies the existing Drizzle
 * migrations via drizzle-orm/libsql/migrator, then builds a Better Auth
 * instance backed by the drizzle adapter. The `testUtils` plugin lets us
 * create users and generate bearer tokens quickly.
 */
import { betterAuth } from "better-auth"
import { admin, bearer, jwt, testUtils } from "better-auth/plugins"
import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
import { createClient } from "@libsql/client"
import { join } from "node:path"
import type { TestHelpers } from "better-auth/plugins"
import { role, user, session, account, verification, jwks } from "../src/db/schema/auth"

// ── Setup ──────────────────────────────────────────────────────

export async function createTestAuth() {
  const client = createClient({ url: ":memory:" })
  const db = drizzle(client)

  // Apply existing migrations so the in-memory DB has all tables.
  await migrate(db, {
    migrationsFolder: join(import.meta.dir, "../migrations"),
  })

  // Seed the role table — the user.role FK references it.
  await db.insert(role).values([
    { name: "user" },
    { name: "visitor" },
    { name: "registered" },
    { name: "premium" },
    { name: "moderator" },
    { name: "admin" },
  ])

  const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: { user, session, account, verification, jwks },
    }),
    emailAndPassword: { enabled: true },
    secret: "test-secret-32-chars-test-secret-32-c",
    baseURL: "http://localhost:3000",
    socialProviders: {
      google: {
        clientId: "test-google-client-id",
        clientSecret: "test-google-client-secret",
      },
      github: {
        clientId: "test-github-client-id",
        clientSecret: "test-github-client-secret",
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "github", "email-password"],
      },
    },
    plugins: [admin(), bearer(), jwt(), testUtils()],
  })

  const ctx = await auth.$context
  return {
    auth,
    test: (ctx as unknown as { test: TestHelpers }).test,
  }
}

export type AuthCtx = Awaited<ReturnType<typeof createTestAuth>>
