import { describe, expect, it } from 'bun:test';
import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute, z } from '@hono/zod-openapi';
import { defaultHook } from './index';

describe('defaultHook', () => {
  it('should return 422 with flattened field errors on validation failure', async () => {
    const app = new OpenAPIHono({ defaultHook });

    const route = createRoute({
      method: 'post',
      path: '/sign-in',
      request: {
        body: {
          content: {
            'application/json': {
              schema: z.object({
                email: z.string().email(),
              }),
            },
          },
        },
      },
      responses: {
        200: { description: 'OK' },
      },
    });

    app.openapi(route, (c) => {
      return c.json({ ok: true });
    });

    const res = await app.request('/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    });

    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.errors).toHaveProperty('email');
  });

  it('should return field errors for multiple invalid fields', async () => {
    const app = new OpenAPIHono({ defaultHook });

    const route = createRoute({
      method: 'post',
      path: '/register',
      request: {
        body: {
          content: {
            'application/json': {
              schema: z.object({
                email: z.string().email(),
                password: z.string().min(8),
              }),
            },
          },
        },
      },
      responses: {
        200: { description: 'OK' },
      },
    });

    app.openapi(route, (c) => {
      return c.json({ ok: true });
    });

    const res = await app.request('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad', password: '123' }),
    });

    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.errors).toHaveProperty('email');
    expect(json.errors).toHaveProperty('password');
  });

  it('should not interfere with valid requests', async () => {
    const app = new OpenAPIHono({ defaultHook });

    const route = createRoute({
      method: 'post',
      path: '/verify',
      request: {
        body: {
          content: {
            'application/json': {
              schema: z.object({
                token: z.string().min(1),
              }),
            },
          },
        },
      },
      responses: {
        200: { description: 'OK' },
      },
    });

    app.openapi(route, (c) => {
      const { token } = c.req.valid('json');
      return c.json({ token });
    });

    const res = await app.request('/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'abc123' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.token).toBe('abc123');
  });

  it('should return 422 with success=false for all validation failures', async () => {
    const app = new OpenAPIHono({ defaultHook });

    const route = createRoute({
      method: 'post',
      path: '/age',
      request: {
        body: {
          content: {
            'application/json': {
              schema: z.object({
                age: z.number().min(18),
              }),
            },
          },
        },
      },
      responses: {
        200: { description: 'OK' },
      },
    });

    app.openapi(route, (c) => c.json({ ok: true }));

    const res = await app.request('/age', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age: 12 }),
    });

    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(typeof json.errors).toBe('object');
  });
});
