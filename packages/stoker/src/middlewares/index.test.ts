import { describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { notFound, onError, serveEmojiFavicon } from './index';

describe('notFound middleware', () => {
  it('should return 404 JSON with the requested path in the message', async () => {
    const app = new Hono();
    app.notFound(notFound);

    const res = await app.request('/some/nonexistent/path');
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json).toHaveProperty('message');
    expect(json.message).toInclude('/some/nonexistent/path');
  });

  it('should return 404 JSON for root path not found', async () => {
    const app = new Hono();
    app.notFound(notFound);

    const res = await app.request('/unknown');
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.message).toInclude('/unknown');
  });
});

describe('onError middleware', () => {
  it('should return 500 JSON with the error message on internal error', async () => {
    const app = new Hono();
    app.onError(onError);

    app.get('/error', () => {
      throw new Error('Something broke');
    });

    const res = await app.request('/error');
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json).toHaveProperty('message');
    expect(json.message).toBe('Something broke');
  });

  it('should use the status from the error if present', async () => {
    const app = new Hono();
    app.onError(onError);

    app.get('/unauthorized', () => {
      const err: any = new Error('Not allowed');
      err.status = 401;
      throw err;
    });

    const res = await app.request('/unauthorized');
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.message).toBe('Not allowed');
  });

  it('should return "Internal Server Error" when error has no message', async () => {
    const app = new Hono();
    app.onError(onError);

    app.get('/no-message', () => {
      throw new Error('');
    });

    const res = await app.request('/no-message');
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.message).toBe('Internal Server Error');
  });

  it('should default to 500 when error has no status property', async () => {
    const app = new Hono();
    app.onError(onError);

    app.get('/generic', () => {
      throw new Error('Generic error');
    });

    const res = await app.request('/generic');
    expect(res.status).toBe(500);
  });
});

describe('serveEmojiFavicon middleware', () => {
  it('should return the favicon emoji for /favicon.ico path', async () => {
    const app = new Hono();
    app.use(serveEmojiFavicon('🌍'));
    app.get('/', (c) => c.text('Hello'));

    const res = await app.request('/favicon.ico');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/x-icon');

    const body = await res.text();
    expect(body).toBe('🌍');
  });

  it('should pass through to next handler for non-favicon paths', async () => {
    const app = new Hono();
    app.use(serveEmojiFavicon('📝'));
    app.get('/hello', (c) => c.text('world'));

    const res = await app.request('/hello');
    expect(res.status).toBe(200);

    const body = await res.text();
    expect(body).toBe('world');
  });

  it('should work with different emoji values', async () => {
    const app = new Hono();
    app.use(serveEmojiFavicon('🔥'));

    const res = await app.request('/favicon.ico');
    expect(res.status).toBe(200);

    const body = await res.text();
    expect(body).toBe('🔥');
  });
});
