import * as HttpStatusPhrases from '@repo/stoker/http-status-phrases';
import { describe, expect, test } from 'bun:test';
import appModule, { app } from '../src/app';
import { createMockEnv } from './helpers';

const mockEnv = createMockEnv();

describe('Backend app — Workers Entry Point', () => {
  test('GET / returns 200 and hello message', async () => {
    const res = await app.request('/', {}, mockEnv);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Hello Hono!');
  });

  test('GET /non-existent returns 404 from stoker notFound', async () => {
    const path = '/non-existent';
    const res = await app.request(path, {}, mockEnv);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toHaveProperty('message');
    expect(json.message).toContain(HttpStatusPhrases.NOT_FOUND);
    expect(json.message).toContain(path);
  });

  test('default export is the Hono app with fetch method', () => {
    expect(appModule).toBeDefined();
    expect(typeof appModule.fetch).toBe('function');
  });

  test('should NOT export Bun.serve server or gracefulShutdown', () => {
    expect(appModule.server).toBeUndefined();
    expect(appModule.gracefulShutdown).toBeUndefined();
  });
});
