import { z } from 'zod'

const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  TRUSTED_ORIGINS: z.string()
    .default('http://localhost:5173')
    .transform(val => val.split(',')
      .map(o => o.trim())
      .filter(o => o.length > 0)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export function validateConfig(env) {
  return envSchema.parse(env)
}
