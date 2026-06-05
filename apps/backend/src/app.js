import createApp from './lib/create-app.js';
import { getAuth } from './lib/auth.js';
import { authMiddleware } from './middlewares/auth.js';
import { validateAuth } from './middlewares/validate.js';

export const app = createApp();

// Set auth on every request via Workers env bindings
app.use('*', (c, next) => {
  c.set('auth', getAuth(c.env));
  return next();
});

// Mount better-auth handler with validation for sign-in/sign-up
app.on(['POST'], '/api/auth/sign-in/email', validateAuth, (c) => {
  return c.get('auth').handler(c.req.raw);
});

app.on(['POST'], '/api/auth/sign-up/email', validateAuth, (c) => {
  return c.get('auth').handler(c.req.raw);
});

// Handle remaining auth routes (GET, other POST endpoints)
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return c.get('auth').handler(c.req.raw);
});

// Protected route
app.get('/api/protected', authMiddleware, (c) => {
  return c.text('protected route data');
});

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

export default app;
