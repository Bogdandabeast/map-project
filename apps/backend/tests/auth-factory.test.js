import { describe, expect, it } from 'bun:test';
import { getAuth } from '../src/lib/auth';

describe('getAuth — Per-Request Factory', () => {
  it('should be a function', () => {
    expect(typeof getAuth).toBe('function');
  });

  it('should return a betterAuth instance when given valid env', () => {
    const env = {
      DB: {
        prepare: () => ({
          bind: () => ({
            all: () => Promise.resolve({ results: [] }),
            run: () => Promise.resolve({ success: true }),
            first: () => Promise.resolve(null),
          }),
        }),
        exec: () => Promise.resolve(null),
        batch: () => Promise.resolve([]),
      },
      BETTER_AUTH_SECRET: 'a-very-long-secret-key-that-is-at-least-32-chars',
      BETTER_AUTH_URL: 'http://localhost:8787',
      TRUSTED_ORIGINS: 'http://localhost:5173',
    };

    const auth = getAuth(env);
    expect(auth).toBeDefined();
    // betterAuth instances have handler and api
    expect(typeof auth.handler).toBe('function');
    expect(typeof auth.api).toBe('object');
  });

  it('should NOT export a singleton auth object', () => {
    // The old export was `auth` as a singleton — it should not exist
    const mod = require('../src/lib/auth');
    expect(mod.auth).toBeUndefined();
  });

  it('should use sqlite provider (not pg)', () => {
    // Verify the module doesn't reference 'pg' as provider
    const fs = require('fs');
    const authSource = fs.readFileSync(
      new URL('../src/lib/auth.js', import.meta.url).pathname,
      'utf-8',
    );
    expect(authSource).toContain("provider: 'sqlite'");
    expect(authSource).not.toContain("provider: 'pg'");
  });
});
