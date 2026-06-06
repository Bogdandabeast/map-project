import { Hono } from "hono";
import { createAuth } from "./db/lib/auth";

const app = new Hono<{ Bindings: { DB: D1Database; BETTER_AUTH_SECRET: string; BETTER_AUTH_URL: string } }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

export default app;
