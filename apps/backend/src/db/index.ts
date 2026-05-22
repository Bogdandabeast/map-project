import process from 'node:process'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { config } from '../config.js'
import * as schema from './schemas/schema.js'

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: Number(process.env.DB_POOL_CONNECTION_TIMEOUT) || 5000,
})

pool.on('error', (err) => {
  console.error('Unexpected pool error', err)
  process.exit(1)
})

export const db = drizzle({ client: pool, schema })
