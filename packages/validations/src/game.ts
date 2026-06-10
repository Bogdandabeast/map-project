import { z } from 'zod/v4'

// ── Game Search Schema ────────────────────────────────────────────
export const gameSearchSchema = z.object({
  q: z.string().min(1).max(100),
})

export type GameSearchInput = z.infer<typeof gameSearchSchema>

// ── Game Detail Params Schema ─────────────────────────────────────
export const gameDetailParamsSchema = z.object({
  id: z.string().uuid(),
})

export type GameDetailParams = z.infer<typeof gameDetailParamsSchema>
