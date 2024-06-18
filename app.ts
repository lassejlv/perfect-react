import { Context, Hono } from "hono";

import ApiRouter from "./routes/api";
import R2 from "./routes/r2";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { RateLimit } from "@rlimit/http";

const app = new Hono();

app.use(logger());

// Rate limiter
const limiter = new RateLimit({
  namespace: "hono",
  maximum: 50,
  interval: "30s",
});

const rateLimitMiddleware = async (c: Context, next) => {
  // use x-forwarded-for or x-real-ip if available
  const identifier = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "anon";

  // check if the request is within the limit
  const limit = await limiter.check(identifier);
  console.info(limit);

  if (!limit.ok) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  await next();
};

app.use(rateLimitMiddleware);

// Set the base path for the API
app.basePath("/api").route("/", ApiRouter).route("/r2", R2);

// Serve the static files
app.get("*", serveStatic({ root: "./dist" }));
app.get("*", serveStatic({ path: "./dist/index.html" }));

const server = Bun.serve({
  port: process.env.PORT,
  fetch: app.fetch,
});

console.log(`Started on http://localhost:${server.port}`);
