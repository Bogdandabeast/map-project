import { describe, expect, it } from 'bun:test'
import { validateConfig } from '../src/config'
// Esto va a dar error porque el archivo no existe
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
    // Esperamos que NO lance error y que el resultado sea el mismo objeto
    expect(validateConfig(mockEnv)).toEqual(mockEnv)
  })
})
