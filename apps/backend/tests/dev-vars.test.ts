import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('.dev.vars', () => {
  const devVarsPath = resolve(__dirname, '..', '.dev.vars');

  it('should exist and be readable', () => {
    const content = readFileSync(devVarsPath, 'utf-8');
    expect(content.length).toBeGreaterThan(0);
  });

  it('should contain BETTER_AUTH_SECRET', () => {
    const content = readFileSync(devVarsPath, 'utf-8');
    expect(content).toContain('BETTER_AUTH_SECRET=');
    // Must be at least 32 chars for better-auth
    const match = content.match(/^BETTER_AUTH_SECRET=(.+)$/m);
    expect(match).not.toBeNull();
    expect(match![1].length).toBeGreaterThanOrEqual(32);
  });

  it('should contain BETTER_AUTH_URL', () => {
    const content = readFileSync(devVarsPath, 'utf-8');
    expect(content).toContain('BETTER_AUTH_URL=http://localhost:8787');
  });
});

describe('.gitignore includes .dev.vars', () => {
  const gitignorePath = resolve(__dirname, '..', '..', '..', '.gitignore');

  it('should list .dev.vars in gitignore', () => {
    const content = readFileSync(gitignorePath, 'utf-8');
    expect(content).toContain('.dev.vars');
  });
});
