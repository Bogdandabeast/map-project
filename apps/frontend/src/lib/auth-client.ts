import { createAuthClient } from 'better-auth/react'

/**
 * Auth client singleton for the frontend.
 * Provides signIn, signUp, signOut, useSession, and getSession.
 * Base URL is resolved via Vite's dev proxy (/api → localhost:3000).
 */
export const authClient = createAuthClient()
