import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = resolve(__dirname, '..', 'package.json');

function readPkg(): Record<string, unknown> {
  return JSON.parse(readFileSync(pkgPath, 'utf-8'));
}

describe('frontend package.json', () => {
  it('should have bun test script', () => {
    const pkg = readPkg();
    const scripts = pkg.scripts as Record<string, string>;
    expect(scripts.test).toBe('bun test');
  });

  it('should NOT have vitest in devDependencies', () => {
    const pkg = readPkg();
    const devDeps = pkg.devDependencies as Record<string, string> | undefined;
    expect(devDeps).not.toHaveProperty('vitest');
  });
});
