import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { RegisterSchema } from "../utils/zod";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { auth } from "../utils/auth";
import { sendEmail } from "../utils/email";
import { z } from "zod";
import jwt from "jsonwebtoken";
import db from "../utils/db";
import redis from "../utils/redis";
import crypto from "crypto";

const router = new Hono();

router.get("/", (c) => {
  // setCookie(c, "session", crypto.randomUUID(), {
  //   path: "/",
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "strict",
  //   maxAge: 60 * 60 * 24 * 7,
  //   expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
  // });

  // const cookie = getCookie(c, "session");

  return c.json({ hello: "world" });
});

router.post("/register", zValidator("json", RegisterSchema), async (c) => {
  const validated = c.req.valid("json");
  if (!validated) return c.json({ error: "Invalid request" }, 400);

  try {
    const userExists = await db.user.findFirst({
      where: {
        email: validated.email,
        username: validated.username,
      },
    });

    if (userExists) throw new Error("User already exists");

    const newUser = await db.user.create({
      data: {
        email: validated.email,
        username: validated.username,
        password: await Bun.password.hash(validated.password),
      },
    });

    return c.json({ message: "User created", user: newUser });
  } catch (error) {
    return c.json({ error: "An error occurred", message: error }, 500);
  }
});

router.post("/login", zValidator("json", RegisterSchema.pick({ email: true, password: true })), async (c) => {
  const validated = c.req.valid("json");

  if (!validated) return c.json({ error: "Invalid request" }, 400);

  try {
    const user = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) throw new Error("User not found");

    const validPassword = await Bun.password.verify(validated.password, user.password);
    if (!validPassword) throw new Error("Invalid password");

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    setCookie(c, "session_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
    });

    return c.json({ message: "User logged in" });
  } catch (error) {
    return c.json({ error: "An error occurred", message: error }, 500);
  }
});

router.delete("/logout", async (c) => {
  const session = await auth(c);
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  deleteCookie(c, "session_token", {
    path: "/",
    httpOnly: true,
    secure: true,
  });

  return c.json({ message: "User logged out" });
});

router.post("/forgot-password", zValidator("json", RegisterSchema.pick({ email: true })), async (c) => {
  const validated = c.req.valid("json");
  if (!validated) return c.json({ error: "Invalid request" }, 400);

  const session = await auth(c);
  if (session) return c.json({ error: "User is already logged in" }, 400);

  const user = await db.user.findFirst({
    where: {
      email: validated.email,
    },
  });

  if (!user) return c.json({ error: "User not found" }, 404);

  const token = crypto.randomBytes(25).toString("hex");

  const key = `password_reset:${token}`;
  await redis.set(key, user.id);
  await redis.expire(key, 60 * 15); // 15 minutes

  try {
    await sendEmail(
      user.email!,
      "Reset Password",
      `Click here to reset your password: ${process.env.WEBSITE_URL}/reset-password/${token}`
    );
    return c.json({ message: "Email sent" });
  } catch (error) {
    console.log(error);

    return c.json({ error: "An error occurred", message: error }, 500);
  }
});

router.post("/validate-token", zValidator("query", z.object({ token: z.string().min(25) })), async (c) => {
  const validated = c.req.valid("query");

  if (!validated) return c.json({ error: "Invalid request" }, 400);

  try {
    const validJwtToken = (await redis.get(`password_reset:${validated.token}`)) as string;
    if (!validJwtToken) return c.json({ error: "Invalid token" }, 400);

    const user = await db.user.findUnique({
      where: { id: validJwtToken },
    });

    if (!user) return c.json({ error: "User not found" }, 404);

    return c.json({ message: "Token is valid" });
  } catch (error) {
    return c.json({ error: "An error occurred", message: error }, 500);
  }
});

router.put("/reset-password", zValidator("json", z.object({ token: z.string(), password: z.string() })), async (c) => {
  const validated = c.req.valid("json");
  if (!validated) return c.json({ error: "Invalid request" }, 400);

  try {
    const validJwtToken = (await redis.get(`password_reset:${validated.token}`)) as string;
    if (!validJwtToken) return c.json({ error: "Invalid token" }, 400);

    const user = await db.user.findUnique({
      where: { id: validJwtToken },
    });

    if (!user) return c.json({ error: "User not found" }, 404);

    const hashedPassword = await Bun.password.hash(validated.password);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    await redis.del(`password_reset:${validated.token}`);
    await sendEmail(user.email!, "Password Reset", "Your password has been reset. Please login with your new password.");

    return c.json({ message: "Password reset" });
  } catch (error) {
    return c.json({ error: "An error occurred", message: error }, 500);
  }
});

router.put("/update-user", zValidator("json", z.object({ username: z.string().min(3).max(20) })), async (c) => {
  const validated = c.req.valid("json");
  if (!validated) return c.json({ error: "Invalid request" }, 400);

  const session = await auth(c);
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  try {
    const usernameTaken = await db.user.findFirst({ where: { username: validated.username } });
    if (usernameTaken) return c.json({ error: "Username is already taken" }, 400);

    await db.user.update({
      where: { id: session.id },
      data: {
        username: validated.username,
      },
    });

    return c.json({ message: "User updated" });
  } catch (error) {
    return c.json({ error: "An error occurred", message: error }, 500);
  }
});

router.get("/verify-email", zValidator("query", z.object({ token: z.string().min(40) })), async (c) => {
  const validated = c.req.valid("query");
  if (!validated) return c.json({ error: "Invalid request" }, 400);

  try {
    const key = `email_verification:${validated.token}`;
    const userId = await redis.get(key);
    if (!userId) return c.json({ error: "Invalid token" }, 400);

    await db.user.update({
      where: { id: userId },
      data: {
        verified: true,
      },
    });

    await redis.del(key);

    return c.redirect(`${process.env.WEBSITE_URL}/dashboard?verified=true`, 302);
  } catch (error) {
    return c.json({ error: "An error occurred", message: error }, 500);
  }
});

router.post("/verify-email", async (c) => {
  const session = await auth(c);
  if (!session) return c.json({ error: "Unauthorized" });

  try {
    const token = crypto.randomBytes(40).toString("hex");
    const key = `email_verification:${token}`;
    await redis.set(key, session.id);
    await redis.expire(key, 60 * 15); // 15 minutes

    await sendEmail(
      session.email!,
      "Verify Email",
      `Please verify your email to activate your account: ${process.env.WEBSITE_URL}/api/verify-email?token=${token}`
    );

    return c.json({ message: "Email sent" });
  } catch (error) {
    return c.json({ error: "An error occurred", message: error }, 500);
  }
});

router.get("/session", async (c) => {
  const token = getCookie(c, "session_token");
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  const validJwtToken = (await jwt.verify(token, process.env.JWT_SECRET!)) as { id: string };
  if (!validJwtToken) return c.json({ error: "Unauthorized" }, 401);

  const user = await db.user.findUnique({
    where: { id: validJwtToken.id },
  });

  if (!user) return c.json({ error: "User not found" }, 404);

  return c.json({
    message: "User is logged in",
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      verified: user.verified,
      avatar: user.avatar,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    },
  });
});

export default router;
