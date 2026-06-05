/**
 * Test helpers — shared mock env for Workers bindings.
 */
export function createMockEnv(overrides = {}) {
  return {
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
    ...overrides,
  };
}
