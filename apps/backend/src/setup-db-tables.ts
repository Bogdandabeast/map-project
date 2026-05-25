import { pool } from './db'

async function createTables() {
  const sql = `
    CREATE TABLE IF NOT EXISTS "maps" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "bounds" json NOT NULL,
      "createdAt" timestamp NOT NULL,
      "updatedAt" timestamp NOT NULL
    );
    CREATE TABLE IF NOT EXISTS "markers" (
      "id" text PRIMARY KEY NOT NULL,
      "mapId" text NOT NULL,
      "name" text,
      "lat" double precision NOT NULL,
      "lng" double precision NOT NULL,
      "createdAt" timestamp NOT NULL,
      "updatedAt" timestamp NOT NULL,
      CONSTRAINT "markers_mapId_maps_id_fk" FOREIGN KEY ("mapId") REFERENCES "maps"("id") ON DELETE cascade ON UPDATE no action
    );
  `

  try {
    await pool.query(sql)
    console.warn('Tables created successfully')
  }
  catch (err) {
    console.error('Error creating tables:', err)
  }
  finally {
    await pool.end()
  }
}

createTables()
