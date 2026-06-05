import { describe, expect, it } from 'bun:test'
import { validateConfig } from '../src/config'

describe('Config — Workers Bindings', () => {
  it('should throw if BETTER_AUTH_SECRET is missing', () => {
    const env = {
      BETTER_AUTH_URL: 'http://localhost:8787',
    }
    expect(() => validateConfig(env)).toThrow()
  })

  it('should throw if BETTER_AUTH_SECRET is shorter than 32 chars', () => {
    const env = {
      BETTER_AUTH_SECRET: 'short-secret',
      BETTER_AUTH_URL: 'http://localhost:8787',
    }
    expect(() => validateConfig(env)).toThrow()
  })

  it('should throw if BETTER_AUTH_URL is not a valid URL', () => {
    const env = {
      BETTER_AUTH_SECRET: 'a-very-long-secret-key-that-is-at-least-32-chars',
      BETTER_AUTH_URL: 'not-a-url',
    }
    expect(() => validateConfig(env)).toThrow()
  })

  it('should pass with minimal required env bindings', () => {
    const env = {
      BETTER_AUTH_SECRET: 'a-very-long-secret-key-that-is-at-least-32-chars',
      BETTER_AUTH_URL: 'http://localhost:8787',
    }
    const config = validateConfig(env)
    expect(config.BETTER_AUTH_SECRET).toBe(env.BETTER_AUTH_SECRET)
    expect(config.BETTER_AUTH_URL).toBe(env.BETTER_AUTH_URL)
  })
})

describe('TRUSTED_ORIGINS Transformation', () => {
  it('should split, trim and filter empty strings from TRUSTED_ORIGINS', () => {
    const env = {
      BETTER_AUTH_SECRET: 'a-very-long-secret-key-that-is-at-least-32-chars',
      BETTER_AUTH_URL: 'http://localhost:8787',
      TRUSTED_ORIGINS: ' http://a.com, , http://b.com ',
    }
    const config = validateConfig(env)
    expect(config.TRUSTED_ORIGINS).toEqual(['http://a.com', 'http://b.com'])
  })

  it('should default TRUSTED_ORIGINS to localhost:5173 when missing', () => {
    const env = {
      BETTER_AUTH_SECRET: 'a-very-long-secret-key-that-is-at-least-32-chars',
      BETTER_AUTH_URL: 'http://localhost:8787',
    }
    const config = validateConfig(env)
    expect(config.TRUSTED_ORIGINS).toEqual(['http://localhost:5173'])
  })
})

describe('NODE_ENV', () => {
  it('should default NODE_ENV to "development"', () => {
    const env = {
      BETTER_AUTH_SECRET: 'a-very-long-secret-key-that-is-at-least-32-chars',
      BETTER_AUTH_URL: 'http://localhost:8787',
    }
    const config = validateConfig(env)
    expect(config.NODE_ENV).toBe('development')
  })

  it('should accept "production" and "test" as valid NODE_ENV values', () => {
    const env = {
      BETTER_AUTH_SECRET: 'a-very-long-secret-key-that-is-at-least-32-chars',
      BETTER_AUTH_URL: 'http://localhost:8787',
      NODE_ENV: 'production',
    }
    const config = validateConfig(env)
    expect(config.NODE_ENV).toBe('production')
  })

  it('should reject invalid NODE_ENV values', () => {
    const env = {
      BETTER_AUTH_SECRET: 'a-very-long-secret-key-that-is-at-least-32-chars',
      BETTER_AUTH_URL: 'http://localhost:8787',
      NODE_ENV: 'staging',
    }
    expect(() => validateConfig(env)).toThrow()
  })
})

describe('No DATABASE_URL or DB_POOL_* fields', () => {
  it('should NOT require DATABASE_URL', () => {
    const env = {
      BETTER_AUTH_SECRET: 'a-very-long-secret-key-that-is-at-least-32-chars',
      BETTER_AUTH_URL: 'http://localhost:8787',
    }
    // Should not throw about missing DATABASE_URL
    const config = validateConfig(env)
    expect(config).toBeDefined()
  })

  it('should NOT include DB_POOL_MAX, DB_POOL_IDLE_TIMEOUT, DB_POOL_CONNECTION_TIMEOUT', () => {
    const env = {
      BETTER_AUTH_SECRET: 'a-very-long-secret-key-that-is-at-least-32-chars',
      BETTER_AUTH_URL: 'http://localhost:8787',
    }
    const config = validateConfig(env)
    expect(config).not.toHaveProperty('DATABASE_URL')
    expect(config).not.toHaveProperty('DB_POOL_MAX')
    expect(config).not.toHaveProperty('DB_POOL_IDLE_TIMEOUT')
    expect(config).not.toHaveProperty('DB_POOL_CONNECTION_TIMEOUT')
  })
})
