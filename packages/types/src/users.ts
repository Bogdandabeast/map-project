/** Shared API contracts — consumed by both frontend and backend. */

// ── Users API ──────────────────────────────────────────────────

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
  role: string
  gameCount: number
}
