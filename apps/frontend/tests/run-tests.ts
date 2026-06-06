#!/usr/bin/env bun
/**
 * Test runner with per-file isolation for Bun test.
 *
 * Bun test runs all files in a single process, which causes DOM state leakage
 * between test files when Ionic components render under happy-dom.
 * This runner spawns a separate `bun test` process per file for clean isolation.
 *
 * Usage: bun run tests/run-tests.ts
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const cwd = process.cwd();
const preload = resolve(cwd, 'tests', 'setup.ts');
const srcDir = resolve(cwd, 'src');
const testsDir = resolve(cwd, 'tests');

function collectTestFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTestFiles(full));
    } else if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const testFiles = [
  ...collectTestFiles(srcDir),
  ...collectTestFiles(testsDir).filter(
    (f) => !f.endsWith('run-tests.ts') && !f.endsWith('setup.ts'),
  ),
];

let totalPass = 0;
let totalFail = 0;

for (const file of testFiles) {
  const rel = relative(cwd, file);
  const result = spawnSync('bun', ['test', '--preload', preload, file], {
    cwd,
    stdio: 'pipe',
    timeout: 60000,
  });

  const stdout = result.stdout.toString().trim();
  const stderr = result.stderr.toString().trim();
  const combined = stdout + '\n' + stderr;

  const passMatch = combined.match(/(\d+)\s+pass/);
  const failMatch = combined.match(/(\d+)\s+fail/);
  const pass = passMatch ? Number(passMatch[1]) : 0;
  const fail = failMatch ? Number(failMatch[1]) : 0;

  totalPass += pass;
  totalFail += fail;

  if (fail > 0) {
    console.log(`FAIL ${rel} — ${pass}P/${fail}F`);
    const lines = combined.split('\n');
    for (const line of lines) {
      if (line.includes('(fail)') || (line.includes('error:') && !line.includes('[Ionicons'))) {
        console.log(`  ${line.trim()}`);
      }
    }
  } else if (pass > 0) {
    console.log(`OK   ${rel} — ${pass}P`);
  } else {
    console.log(`?    ${rel} — no results`);
  }
}

console.log(`\nTotal: ${totalPass} pass, ${totalFail} fail`);
process.exit(totalFail > 0 ? 1 : 0);
