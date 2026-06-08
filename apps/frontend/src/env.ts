/**
 * Frontend environment — validated at build time.
 *
 * Vite statically replaces import.meta.env.VITE_* at build time.
 * This module validates those values immediately so a missing
 * VITE_API_URL fails the build, not the user's browser.
 */
import { parseFrontendEnv } from '@repo/env'

export const env = parseFrontendEnv(import.meta.env as unknown as Record<string, unknown>)

/** URL of the backend API. Guaranteed non-empty after validation. */
export const API_URL: string = env.VITE_API_URL
