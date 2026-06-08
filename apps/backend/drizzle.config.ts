import { defineConfig } from 'drizzle-kit'
import { findLocalD1Db } from './src/db/lib/local-db'

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: findLocalD1Db(),
  },
})
