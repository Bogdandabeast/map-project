import { describe, expect, it } from 'bun:test'
import { validateConfig } from '../src/config'

describe('Config Wrapper', () => {
  it('should throw an error if DATABASE_URL is missing', () => {
    // Simulamos un entorno donde falta la DATABASE_URL
    const mockEnv = {
      BETTER_AUTH_SECRET: 'secret-de-32-caracteres-muy-largo-123',
      BETTER_AUTH_URL: 'http://localhost:3000',
    }
    // Esperamos que la función lance un error al validar este objeto
    expect(() => validateConfig(mockEnv)).toThrow()
  })
  it('should pass if all required variables are present and valid', () => {
    const mockEnv = {
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      BETTER_AUTH_SECRET: 'secret-de-32-caracteres-muy-largo-123',
      BETTER_AUTH_URL: 'http://localhost:3000',
      NODE_ENV: 'production',
    }
    // Esperamos que NO lance error y que el resultado contenga los valores básicos
    const result = validateConfig(mockEnv)
    expect(result.DATABASE_URL).toBe(mockEnv.DATABASE_URL)
    expect(result.BETTER_AUTH_URL).toBe(mockEnv.BETTER_AUTH_URL)
  })
})

describe('TRUSTED_ORIGINS Transformation', () => {
  it('should split, trim and filter empty strings from TRUSTED_ORIGINS', () => {
    const mockEnv = {
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      BETTER_AUTH_SECRET: 'secret-de-32-caracteres-muy-largo-123',
      BETTER_AUTH_URL: 'http://localhost:3000',
      TRUSTED_ORIGINS: ' http://a.com, , http://b.com ',
    }
    const config = validateConfig(mockEnv)
    expect(config.TRUSTED_ORIGINS).toEqual(['http://a.com', 'http://b.com'])
  })

  it('should use the default value when TRUSTED_ORIGINS is missing', () => {
    const mockEnv = {
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      BETTER_AUTH_SECRET: 'secret-de-32-caracteres-muy-largo-123',
      BETTER_AUTH_URL: 'http://localhost:3000',
    }
    const config = validateConfig(mockEnv)
    expect(config.TRUSTED_ORIGINS).toEqual(['http://localhost:5173'])
  })
})
