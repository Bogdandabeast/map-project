import { beforeAll, describe, expect, it } from 'bun:test';
import { readFileSync } from 'fs';
import { parse } from 'smol-toml';

// The drizzle.config.js uses ESM exports — we can import it directly
describe('drizzle.config.js', () => {
  let config: { dialect: string; dbCredentials: { url: string }; schema: string; out: string };
  let wranglerConfig: any;

  beforeAll(async () => {
    const mod = await import('../drizzle.config.js');
    config = mod.default;

    // Parse wrangler.toml to get the database_id
    const wranglerToml = readFileSync('./wrangler.toml', 'utf-8');
    wranglerConfig = parse(wranglerToml);
  });

  it('should use sqlite dialect', () => {
    expect(config.dialect).toBe('sqlite');
  });

  it('should use local wrangler D1 path for dbCredentials', () => {
    expect(config.dbCredentials.url).toContain('.wrangler/state/v3/d1');
    expect(config.dbCredentials.url).toContain('.sqlite');
  });

  it('should use D1 database_id from wrangler.toml as SQLite filename', () => {
    const databaseId = wranglerConfig.d1_databases[0].database_id;
    const expectedFilename = `${databaseId}.sqlite`;
    expect(config.dbCredentials.url).toContain(expectedFilename);
  });

  it('should reference schema.js (not .ts)', () => {
    expect(config.schema).toBe('./src/db/schemas/schema.js');
  });

  it('should output to ./drizzle directory', () => {
    expect(config.out).toBe('./drizzle');
  });
});
