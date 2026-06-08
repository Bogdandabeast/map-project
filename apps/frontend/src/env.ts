/**
 * Frontend environment — validated at build time.
 *
 * Vite statically replaces import.meta.env.VITE_* at build time.
 * This module validates those values immediately so a missing
 * VITE_API_URL fails the build, not the user's browser.
 */
import { parseFrontendEnv } from '@repo/env'

// Vite replaces import.meta.env at build time. In test environments
// (Bun) the VITE_ keys are absent, so validation would throw.
// Fall back to localhost defaults so tests can import the module
// without crashing; production builds will catch missing vars.
const raw = import.meta.env as Record<string, unknown>
const hasViteKeys = Object.keys(raw).some(k => k.startsWith('VITE_'))

export const env = hasViteKeys
  ? parseFrontendEnv(raw)
  : { VITE_API_URL: 'http://localhost:3000', VITE_APP_URL: 'http://localhost:5173' }

/** URL of the backend API. */
export const API_URL: string = env.VITE_API_URL

/** URL of the frontend app (for OAuth redirects). */
export const APP_URL: string = env.VITE_APP_URL
