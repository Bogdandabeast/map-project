import type { MiddlewareHandler } from "hono"
import { createAuth, type AuthFactory } from "../db/lib/auth"
import type { AppEnv } from "../types/hono"

/**
 * Internal middleware factory. Accepts an `AuthFactory` so tests can
 * inject a test auth instance.
 */
export function requireRoleMiddleware(
  authFactory: AuthFactory,
  roles: string[],
): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const auth = authFactory(c.env)
    const result = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    if (!result) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const userRole = (result.user as { role?: string }).role
    if (!userRole || !roles.includes(userRole)) {
      return c.json(
        {
          error: "Forbidden",
          message: `Required one of: ${roles.join(", ")}`,
        },
        403,
      )
    }

    c.set("user", result.user)
    c.set("session", result.session)

    await next()
  }
}

/**
 * Role-based access control middleware.
 *
 * Requires a valid session (Bearer token or cookie). Returns 401 if
 * the user is not authenticated, or 403 if the authenticated user's
 * role is not one of the allowed `roles`.
 *
 * Sets `c.var.user` and `c.var.session` on success so downstream
 * handlers don't need to re-fetch the session.
 *
 * @param roles - One or more role names allowed to access the route.
 *
 * @example
 * ```ts
 * app.get("/api/admin", requireRole("admin"), (c) => {
 *   const user = c.var.user // guaranteed non-null here
 * })
 *
 * app.get("/api/mod", requireRole("moderator", "admin"), (c) => {
 *   // …
 * })
 * ```
 */
export function requireRole(...roles: string[]): MiddlewareHandler<AppEnv> {
  return requireRoleMiddleware(createAuth, roles)
}
