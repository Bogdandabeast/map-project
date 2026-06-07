import { Hono } from "hono";
import { createAuth } from "./db/lib/auth";
import type { AppEnv } from "./types/hono";

const app = new Hono<AppEnv>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

export default app;
