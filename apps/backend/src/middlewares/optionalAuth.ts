import type { MiddlewareHandler } from "hono"
import { createAuth } from "../db/lib/auth"
import type { AppEnv } from "../types/hono"
import type { AuthFactory } from "../types/auth"

/**
 * Internal middleware factory. Accepts an `AuthFactory` so tests can
 * inject a test auth instance. The public API always uses the real
 * `createAuth` from the project.
 */
export function optionalAuthMiddleware(
  authFactory: AuthFactory,
): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const auth = authFactory(c.env)
    const result = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    c.set("user", result?.user ?? null)
    c.set("session", result?.session ?? null)

    await next()
  }
}

/**
 * Optional authentication middleware.
 *
 * Extracts the session from the incoming request's Bearer token or
 * session cookie. If valid, sets `c.var.user` and `c.var.session`;
 * otherwise sets both to `null`. Never blocks the request.
 *
 * @example
 * ```ts
 * app.get("/api/profile", optionalAuth(), (c) => {
 *   const user = c.var.user // User | null
 * })
 * ```
 */
export function optionalAuth(): MiddlewareHandler<AppEnv> {
  return optionalAuthMiddleware(createAuth)
}
