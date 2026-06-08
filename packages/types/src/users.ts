/** Shared API contracts — consumed by both frontend and backend. */

// ── Users API ──────────────────────────────────────────────────

/** Application role names — must match the role table seeds. */
export type UserRole = 'admin' | 'premium' | 'user'

/** POST /api/users/me/avatar/upload-url */
export interface AvatarUploadUrlResponse {
  uploadUrl: string
  key: string
}

/** GET /api/users/:id */
export interface PublicProfile {
  id: string
  name: string
  image: string | null
  role: UserRole
  gameCount: number
}
