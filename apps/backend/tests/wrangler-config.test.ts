import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'bun:test'

const __dirname = dirname(fileURLToPath(import.meta.url))
const wranglerPath = resolve(__dirname, '..', 'wrangler.toml')

function readWranglerToml(): string {
  return readFileSync(wranglerPath, 'utf-8')
}

describe('wrangler.toml', () => {
  it('should exist and be readable', () => {
    const content = readWranglerToml()
    expect(content.length).toBeGreaterThan(0)
  })

  it('should declare the correct worker name', () => {
    const content = readWranglerToml()
    expect(content).toContain('name = "map-project-backend"')
  })

  it('should point main to the app entry point', () => {
    const content = readWranglerToml()
    expect(content).toContain('main = "src/app.js"')
  })

  it('should declare a D1 database binding', () => {
    const content = readWranglerToml()
    expect(content).toContain('[[d1_databases]]')
    expect(content).toContain('binding = "DB"')
    expect(content).toContain('database_name = "map-project-db"')
  })

  it('should declare an R2 bucket binding', () => {
    const content = readWranglerToml()
    expect(content).toContain('[[r2_buckets]]')
    expect(content).toContain('binding = "R2"')
    expect(content).toContain('bucket_name = "map-project-images"')
  })

  it('should set NODE_ENV and TRUSTED_ORIGINS vars', () => {
    const content = readWranglerToml()
    expect(content).toContain('[vars]')
    expect(content).toContain('NODE_ENV = "production"')
    expect(content).toContain('TRUSTED_ORIGINS = "http://localhost:5173"')
  })

  it('should declare a compatibility date', () => {
    const content = readWranglerToml()
    expect(content).toMatch(/compatibility_date\s*=\s*"2025-06-05"/)
  })
})
