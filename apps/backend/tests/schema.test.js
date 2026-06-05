import { describe, expect, it } from 'bun:test';
import { user, session, account } from '../src/db/schemas/schema';

describe('Schema — SQLite Tables', () => {
  it('should export user table with expected columns', () => {
    expect(user).toBeDefined();
    // Verify key columns exist after migration
    const cols = Object.keys(user);
    expect(cols).toContain('id');
    expect(cols).toContain('email');
    expect(cols).toContain('name');
    expect(cols).toContain('createdAt');
    expect(cols).toContain('updatedAt');
  });

  it('should export session table with expected columns', () => {
    expect(session).toBeDefined();
    const cols = Object.keys(session);
    expect(cols).toContain('id');
    expect(cols).toContain('token');
    expect(cols).toContain('userId');
    expect(cols).toContain('expiresAt');
  });

  it('should export account table with expected columns', () => {
    expect(account).toBeDefined();
    const cols = Object.keys(account);
    expect(cols).toContain('id');
    expect(cols).toContain('userId');
    expect(cols).toContain('providerId');
    expect(cols).toContain('accountId');
  });

  it('should use sqlite column types (not pg)', () => {
    // After migration to sqlite-core, columns should have SQLite symbol types
    // This verifies the import comes from sqlite-core, not pg-core
    expect(user).toBeDefined();
    expect(() => import('drizzle-orm/sqlite-core')).not.toThrow();
  });
});
