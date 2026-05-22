import type { Context, Next } from 'hono'
import { signInSchema, signUpSchema } from '@repo/validations'

/**
 * validateAuth — Validation middleware for auth endpoints
 *
 * Intercepts POST requests to auth routes and validates the request body
 * against the appropriate Zod schema (signInSchema or signUpSchema).
 * Returns 400 with { error, fields } on validation failure.
 * Passes to next() on success.
 */
export async function validateAuth(c: Context, next: Next) {
  const path = c.req.path

  let schema
  if (path.endsWith('/sign-in/email')) {
    schema = signInSchema
  }
  else if (path.endsWith('/sign-up/email')) {
    schema = signUpSchema
  }
  else {
    // Not an auth route we validate — pass through
    return await next()
  }

  let body: unknown
  try {
    body = await c.req.raw.clone().json()
  }
  catch {
    return c.json({ error: 'Invalid JSON body', fields: {} }, 400)
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    return c.json({ error: 'Validation failed', fields: fieldErrors }, 400)
  }

  return await next()
}
