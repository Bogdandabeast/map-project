import { describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

describe('docker-compose.yml — should NOT exist', () => {
  it('should not exist after cleanup', () => {
    expect(existsSync(resolve(rootDir, 'docker-compose.yml'))).toBe(false);
  });
});

describe('.env — should NOT exist', () => {
  it('should not exist after cleanup', () => {
    expect(existsSync(resolve(rootDir, '.env'))).toBe(false);
  });
});

describe('.env.example — should NOT exist', () => {
  it('should not exist after cleanup', () => {
    expect(existsSync(resolve(rootDir, '.env.example'))).toBe(false);
  });
});
