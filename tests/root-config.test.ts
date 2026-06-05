import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('turbo.json', () => {
  const turboPath = resolve(__dirname, '..', 'turbo.json');

  it('should have a test task pipeline', () => {
    const turbo = JSON.parse(readFileSync(turboPath, 'utf-8'));
    expect(turbo.tasks).toHaveProperty('test');
  });
});

describe('root package.json', () => {
  const rootPkgPath = resolve(__dirname, '..', 'package.json');

  it('should have turbo run test script', () => {
    const pkg = JSON.parse(readFileSync(rootPkgPath, 'utf-8'));
    const scripts = pkg.scripts as Record<string, string>;
    expect(scripts.test).toBe('turbo run test');
  });
});
