import process from 'node:process'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { config } from '../config.js'
import * as mapsSchema from '../modules/maps/schema.js'
import * as schema from './schemas/schema.js'

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: config.DB_POOL_MAX,
  idleTimeoutMillis: config.DB_POOL_IDLE_TIMEOUT,
  connectionTimeoutMillis: config.DB_POOL_CONNECTION_TIMEOUT,
})

pool.on('error', (err) => {
  console.error('Unexpected pool error', err)
  pool.end()
    .then(() => process.emit('SIGTERM'))
    .catch((endErr) => {
      console.error('Error closing pool during shutdown', endErr)
      process.emit('SIGTERM')
    })
})

export const db = drizzle({
  client: pool,
  schema: { ...schema, ...mapsSchema },
})
