import { describe, expect, it } from 'bun:test';
import { createDb } from '../src/db/index';

describe('createDb — D1 Factory', () => {
  it('should be a function', () => {
    expect(typeof createDb).toBe('function');
  });

  it('should return a drizzle instance when given a D1 binding', () => {
    // Minimal D1Database-like mock
    const mockD1 = {
      prepare: () => ({
        bind: () => ({
          all: () => Promise.resolve({ results: [] }),
          run: () => Promise.resolve({ success: true }),
          first: () => Promise.resolve(null),
        }),
      }),
      exec: () => Promise.resolve(null),
      batch: () => Promise.resolve([]),
    };

    const db = createDb(mockD1);
    expect(db).toBeDefined();
    // drizzle instances have query capabilities
    expect(typeof db.select).toBe('function');
    expect(typeof db.insert).toBe('function');
    expect(typeof db.update).toBe('function');
    expect(typeof db.delete).toBe('function');
  });

  it('should NOT import or use pg Pool', () => {
    // Verify there is no pool-related export
    const mod = require('../src/db/index');
    expect(mod.pool).toBeUndefined();
  });
});
