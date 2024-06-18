import { Context, Hono } from "hono";

import ApiRouter from "./routes/api";
import R2 from "./routes/r2";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";

const app = new Hono();

app.use(logger());

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
