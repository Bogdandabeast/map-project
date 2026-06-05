import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = resolve(__dirname, '..', 'package.json');

function readPkg(): Record<string, unknown> {
  return JSON.parse(readFileSync(pkgPath, 'utf-8'));
}

describe('backend package.json', () => {
  it('should have wrangler dev script', () => {
    const pkg = readPkg();
    const scripts = pkg.scripts as Record<string, string>;
    expect(scripts.dev).toBe('wrangler dev');
  });

  it('should have wrangler deploy script', () => {
    const pkg = readPkg();
    const scripts = pkg.scripts as Record<string, string>;
    expect(scripts.deploy).toBe('wrangler deploy');
  });

  it('should have bun test script', () => {
    const pkg = readPkg();
    const scripts = pkg.scripts as Record<string, string>;
    expect(scripts.test).toBe('bun test');
  });

  it('should have drizzle-orm as a dependency', () => {
    const pkg = readPkg();
    const deps = pkg.dependencies as Record<string, string>;
    expect(deps).toHaveProperty('drizzle-orm');
  });

  it('should have better-auth as a dependency', () => {
    const pkg = readPkg();
    const deps = pkg.dependencies as Record<string, string>;
    expect(deps).toHaveProperty('better-auth');
  });

  it('should have @hono/zod-openapi as a dependency', () => {
    const pkg = readPkg();
    const deps = pkg.dependencies as Record<string, string>;
    expect(deps).toHaveProperty('@hono/zod-openapi');
  });

  it('should have zod as a dependency', () => {
    const pkg = readPkg();
    const deps = pkg.dependencies as Record<string, string>;
    expect(deps).toHaveProperty('zod');
  });

  it('should have wrangler as a devDependency', () => {
    const pkg = readPkg();
    const devDeps = pkg.devDependencies as Record<string, string>;
    expect(devDeps).toHaveProperty('wrangler');
  });

  it('should have @cloudflare/workers-types as a devDependency', () => {
    const pkg = readPkg();
    const devDeps = pkg.devDependencies as Record<string, string>;
    expect(devDeps).toHaveProperty('@cloudflare/workers-types');
  });

  it('should have drizzle-kit as a devDependency', () => {
    const pkg = readPkg();
    const devDeps = pkg.devDependencies as Record<string, string>;
    expect(devDeps).toHaveProperty('drizzle-kit');
  });

  it('should NOT have @types/bun', () => {
    const pkg = readPkg();
    const devDeps = pkg.devDependencies as Record<string, string>;
    expect(devDeps).not.toHaveProperty('@types/bun');
  });

  it('should NOT have pg', () => {
    const pkg = readPkg();
    const deps = pkg.dependencies as Record<string, string>;
    expect(deps).not.toHaveProperty('pg');
  });
});
