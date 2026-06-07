/**
 * Integration tests for RBAC middlewares (optionalAuth, requireRole).
 *
 * Uses Better Auth with libsql (`:memory:`) and the `testUtils`
 * plugin so we can create users, generate bearer tokens, and
 * exercise the middleware without a real D1 binding.
 */
import { describe, expect, it, beforeAll } from "bun:test"
import { Hono } from "hono"
import type { MiddlewareHandler } from "hono"
import type { AppEnv } from "../src/types/hono"
import { createTestAuth } from "./auth-setup"
import type { AuthCtx } from "./auth-setup"
import {
  optionalAuth,
  optionalAuthMiddleware,
} from "../src/middlewares/optionalAuth"
import {
  requireRole,
  requireRoleMiddleware,
} from "../src/middlewares/requireRole"

// ── Shared state ───────────────────────────────────────────────

let ctx: AuthCtx
const authFactory = () => ctx.auth

/** Wrapped middleware helpers that use the test auth. */
const testOptionalAuth: typeof optionalAuth = () =>
  optionalAuthMiddleware(authFactory)
const testRequireRole = (...roles: string[]): MiddlewareHandler<AppEnv> =>
  requireRoleMiddleware(authFactory, roles)

/**
 * Create a user with the given role and return helpers to make
 * authenticated requests.
 */
async function authedUser(role: string) {
  const u = ctx.test.createUser({ role } as Record<string, unknown>)
  const saved = await ctx.test.saveUser(u as any)
  const { token } = await ctx.test.login({ userId: saved.id })
  return {
    user: saved,
    token,
    req(path: string) {
      return new Request(`http://localhost${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    },
  }
}

function unauthReq(path: string) {
  return new Request(`http://localhost${path}`)
}

// ── Boot ───────────────────────────────────────────────────────

beforeAll(async () => {
  ctx = await createTestAuth()
})

// ══════════════════════════════════════════════════════════════
// optionalAuth
// ══════════════════════════════════════════════════════════════

describe("optionalAuth", () => {
  it("sets user and session to null when no auth header", async () => {
    const app = new Hono<AppEnv>().get("/", testOptionalAuth(), (c) => {
      expect(c.var.user).toBeNull()
      expect(c.var.session).toBeNull()
      return c.json({ ok: true })
    })
    const res = await app.fetch(unauthReq("/"))
    expect(res.status).toBe(200)
  })

  it("sets user when valid bearer token is provided", async () => {
    const { user, token } = await authedUser("registered")

    const app = new Hono<AppEnv>().get("/", testOptionalAuth(), (c) => {
      expect(c.var.user).not.toBeNull()
      expect(c.var.user!.id).toBe(user.id)
      expect(c.var.session).not.toBeNull()
      return c.json({ ok: true })
    })

    const res = await app.fetch(
      new Request("http://localhost/", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    )
    expect(res.status).toBe(200)
  })

  it("never blocks the request", async () => {
    const app = new Hono<AppEnv>().get("/", testOptionalAuth(), (c) =>
      c.json({ status: "passed" }),
    )
    const { token } = await authedUser("admin")

    const [r1, r2] = await Promise.all([
      app.fetch(unauthReq("/")),
      app.fetch(
        new Request("http://localhost/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ),
    ])
    expect(r1.status).toBe(200)
    expect(r2.status).toBe(200)
  })
})

// ══════════════════════════════════════════════════════════════
// requireRole
// ══════════════════════════════════════════════════════════════

describe("requireRole", () => {
  describe("when not authenticated", () => {
    it("returns 401 with no auth header", async () => {
      const app = new Hono<AppEnv>().get(
        "/admin",
        testRequireRole("admin"),
        (c) => c.json({ ok: true }),
      )
      const res = await app.fetch(unauthReq("/admin"))
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.error).toBe("Unauthorized")
    })

    it("returns 401 with an invalid bearer token", async () => {
      const app = new Hono<AppEnv>().get(
        "/admin",
        testRequireRole("admin"),
        (c) => c.json({ ok: true }),
      )
      const res = await app.fetch(
        new Request("http://localhost/admin", {
          headers: { Authorization: "Bearer invalid-token" },
        }),
      )
      expect(res.status).toBe(401)
    })
  })

  describe("when authenticated but role is not allowed", () => {
    it("returns 403 for visitor on admin route", async () => {
      const app = new Hono<AppEnv>().get(
        "/admin",
        testRequireRole("admin"),
        (c) => c.json({ ok: true }),
      )
      const { req } = await authedUser("visitor")
      const res = await app.fetch(req("/admin"))
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toBe("Forbidden")
    })

    it("returns 403 for registered on moderator route", async () => {
      const app = new Hono<AppEnv>().get(
        "/mod",
        testRequireRole("moderator", "admin"),
        (c) => c.json({ ok: true }),
      )
      const { req } = await authedUser("registered")
      const res = await app.fetch(req("/mod"))
      expect(res.status).toBe(403)
    })
  })

  describe("when authenticated with an allowed role", () => {
    it("allows admin on admin route", async () => {
      const app = new Hono<AppEnv>().get(
        "/admin",
        testRequireRole("admin"),
        (c) => c.json({ ok: true }),
      )
      const { req } = await authedUser("admin")
      const res = await app.fetch(req("/admin"))
      expect(res.status).toBe(200)
    })

    it("allows moderator on mod-or-admin route", async () => {
      const app = new Hono<AppEnv>().get(
        "/mod",
        testRequireRole("moderator", "admin"),
        (c) => c.json({ ok: true }),
      )
      const { req } = await authedUser("moderator")
      const res = await app.fetch(req("/mod"))
      expect(res.status).toBe(200)
    })

    it("allows premium on registered+premium route", async () => {
      const app = new Hono<AppEnv>().get(
        "/content",
        testRequireRole("registered", "premium"),
        (c) => c.json({ ok: true }),
      )
      const { req } = await authedUser("premium")
      const res = await app.fetch(req("/content"))
      expect(res.status).toBe(200)
    })

    it("allows registered on registered+premium route", async () => {
      const app = new Hono<AppEnv>().get(
        "/content",
        testRequireRole("registered", "premium"),
        (c) => c.json({ ok: true }),
      )
      const { req } = await authedUser("registered")
      const res = await app.fetch(req("/content"))
      expect(res.status).toBe(200)
    })
  })

  describe("sets context variables on success", () => {
    it("sets user and session on c.var", async () => {
      const app = new Hono<AppEnv>().get(
        "/admin",
        testRequireRole("admin"),
        (c) => {
          expect(c.var.user).not.toBeNull()
          expect(c.var.session).not.toBeNull()
          return c.json({ ok: true })
        },
      )
      const { req } = await authedUser("admin")
      const res = await app.fetch(req("/admin"))
      expect(res.status).toBe(200)
    })
  })
})

// ══════════════════════════════════════════════════════════════
// optionalAuth + requireRole composition
// ══════════════════════════════════════════════════════════════

describe("composition", () => {
  it("optionalAuth + requireRole works together", async () => {
    const app = new Hono<AppEnv>().get(
      "/admin",
      testOptionalAuth(),
      testRequireRole("admin"),
      (c) => c.json({ ok: true }),
    )
    const { req } = await authedUser("admin")
    const res = await app.fetch(req("/admin"))
    expect(res.status).toBe(200)
  })

  it("optionalAuth + requireRole rejects unauthenticated", async () => {
    const app = new Hono<AppEnv>().get(
      "/admin",
      testOptionalAuth(),
      testRequireRole("admin"),
      (c) => c.json({ ok: true }),
    )
    const res = await app.fetch(unauthReq("/admin"))
    expect(res.status).toBe(401)
  })
})
