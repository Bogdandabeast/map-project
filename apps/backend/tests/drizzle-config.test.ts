import { beforeAll, describe, expect, it } from 'bun:test';

// The drizzle.config.js uses ESM exports — we can import it directly
describe('drizzle.config.js', () => {
  let config: { dialect: string; dbCredentials: { url: string }; schema: string; out: string };

  beforeAll(async () => {
    const mod = await import('../drizzle.config.js');
    config = mod.default;
  });

  it('should use sqlite dialect', () => {
    expect(config.dialect).toBe('sqlite');
  });

  it('should use local wrangler D1 path for dbCredentials', () => {
    expect(config.dbCredentials.url).toContain('.wrangler/state/v3/d1');
    expect(config.dbCredentials.url).toContain('.sqlite');
  });

  it('should reference schema.js (not .ts)', () => {
    expect(config.schema).toBe('./src/db/schemas/schema.js');
  });

  it('should output to ./drizzle directory', () => {
    expect(config.out).toBe('./drizzle');
  });
});
