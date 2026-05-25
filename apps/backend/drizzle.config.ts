import { defineConfig } from 'drizzle-kit'
import { config } from './src/config.js'

export default defineConfig({
  out: './drizzle',
  schema: ['./src/db/schemas/schema.ts', './src/modules/maps/schema.ts'],
  dialect: 'postgresql',
  dbCredentials: {
    url: config.DATABASE_URL,
  },
})
