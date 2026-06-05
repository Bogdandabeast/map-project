import { describe, expect, it } from 'bun:test';
import { app } from '../src/app';
import { createMockEnv } from './helpers';

const mockEnv = createMockEnv();

describe('Auth Middleware', () => {
  it('should return 401 when accessing protected route without session', async () => {
    const res = await app.request('/api/protected', {}, mockEnv);
    expect(res.status).toBe(401);
  });
});
