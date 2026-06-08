import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// Single source of truth for ALL environment variables
// across the entire monorepo.
//
// Backend secrets  → .dev.vars (local) / wrangler secret put (prod)
// Backend bindings → wrangler.jsonc
// Frontend vars    → .env / .env.local (Vite's import.meta.env)
// ═══════════════════════════════════════════════════════════════

// ── Backend: Better Auth ──────────────────────────────────────
const betterAuthVars = {
  BETTER_AUTH_SECRET: z
    .string()
    .nonempty('BETTER_AUTH_SECRET is required — generate with: openssl rand -hex 32'),

  BETTER_AUTH_URL: z
    .string()
    .url('BETTER_AUTH_URL must be a valid URL')
    .default('http://localhost:3000'),

  /** Comma-separated list of allowed origins for CORS/cookies. */
  TRUSTED_ORIGINS: z
    .string()
    .optional()
    .default(''),
}

// ── Backend: OAuth providers ──────────────────────────────────
const oauthVars = {
  GITHUB_CLIENT_ID: z.string().optional().default(''),
  GITHUB_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
}

// ── Backend: full schema ──────────────────────────────────────
export const backendEnvSchema = z.object({
  ...betterAuthVars,
  ...oauthVars,
})

// ── Frontend: Vite-injected vars ──────────────────────────────
export const frontendEnvSchema = z.object({
  /** Backend API URL */
  VITE_API_URL: z
    .string()
    .url('VITE_API_URL must be a valid URL')
    .default('http://localhost:3000'),

  /** Frontend app URL (used for OAuth redirects) — required, no default */
  VITE_APP_URL: z
    .string()
    .url('VITE_APP_URL must be a valid URL'),
})

// ── Unified: every variable in the monorepo ───────────────────
export const envSchema = z.object({
  ...betterAuthVars,
  ...oauthVars,
  ...frontendEnvSchema.shape,
})

// ── Types ─────────────────────────────────────────────────────
export type BackendEnv = z.infer<typeof backendEnvSchema>
export type FrontendEnv = z.infer<typeof frontendEnvSchema>
export type ValidatedEnv = z.infer<typeof envSchema>

// ═══════════════════════════════════════════════════════════════
// Runtime validators
// ═══════════════════════════════════════════════════════════════

/**
 * Validate backend environment (Cloudflare Workers `env` binding).
 *
 * All secrets must be present.  Throws with every missing/invalid
 * variable listed at once — no death by a thousand `undefined` checks.
 */
export function parseBackendEnv(raw: Record<string, unknown>): BackendEnv {
  const result = backendEnvSchema.safeParse(raw)

  if (result.success)
    return result.data

  const issues = result.error.issues
    .map((i) => {
      const path = i.path.length > 0 ? i.path.join('.') : '<root>'
      return `  • ${path}: ${i.message}`
    })
    .join('\n')

  throw new Error(
    `❌ Backend environment validation failed — ${result.error.issues.length} issue(s):\n${issues}`,
  )
}

/**
 * Validate frontend environment at build time (Vite's import.meta.env).
 *
 * VITE_ prefixed vars are statically replaced at build time,
 * so this catches missing config BEFORE deploy.
 */
export function parseFrontendEnv(raw: Record<string, unknown>): FrontendEnv {
  const result = frontendEnvSchema.safeParse(raw)

  if (result.success)
    return result.data

  const issues = result.error.issues
    .map((i) => {
      const path = i.path.length > 0 ? i.path.join('.') : '<root>'
      return `  • ${path}: ${i.message}`
    })
    .join('\n')

  throw new Error(
    `❌ Frontend environment validation failed — ${result.error.issues.length} issue(s):\n${issues}`,
  )
}
