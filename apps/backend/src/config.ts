import process from 'node:process'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export function validateConfig(env: unknown) {
  return envSchema.parse(env)
}

export const config = validateConfig(process.env)
export type Config = z.infer<typeof envSchema>
