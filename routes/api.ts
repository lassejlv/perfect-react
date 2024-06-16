import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { RegisterSchema } from "../utils/zod";
import { User } from "../.prismo/types";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
import db from "../utils/db";
import { auth } from "../utils/auth";
import { sendEmail } from "../utils/email";
import { z } from "zod";

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
    const userExist = await db.findFirst<User>({
      table: "User",
      where: { email: validated.email, username: validated.username },
    });

    if (userExist) throw new Error("User already exists");

    const newUser = await db.create<User>({
      table: "User",
      data: {
        email: validated.email,
        username: validated.username,
        password: await Bun.password.hash(validated.password),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
    const user = await db.findFirst<User>({
      table: "User",
      where: {
        email: validated.email,
      },
    });

    if (!user) throw new Error("User not found");

    const validPassword = await Bun.password.verify(validated.password, user.password!);
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

  const user = await db.findFirst<User>({
    table: "User",
    where: {
      email: validated.email,
    },
  });

  if (!user) return c.json({ error: "User not found" }, 404);

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "20m" });

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
    const validJwtToken = (await jwt.verify(validated.token, process.env.JWT_SECRET!)) as { id: number };
    if (!validJwtToken) return c.json({ error: "Invalid token" }, 400);

    const user = await db.findFirst<User>({
      table: "User",
      where: {
        id: validJwtToken.id,
      },
    });

    if (!user) return c.json({ error: "User not found" }, 404);

    return c.json({ message: "Token is valid" });
  } catch (error) {
    return c.json({ error: "An error occurred", message: error }, 500);
  }
});

router.put("/reset-password", zValidator("json", z.object({ token: z.string().min(25), password: z.string().min(8) })), async (c) => {
  const validated = c.req.valid("json");

  if (!validated) return c.json({ error: "Invalid request" }, 400);

  try {
    const validJwtToken = (await jwt.verify(validated.token, process.env.JWT_SECRET!)) as { id: number };
    if (!validJwtToken) return c.json({ error: "Invalid token" }, 400);

    const user = await db.findFirst<User>({
      table: "User",
      where: {
        id: validJwtToken.id,
      },
    });

    if (!user) return c.json({ error: "User not found" }, 404);

    const newPassword = await Bun.password.hash(validated.password);

    await db.update<User>({
      table: "User",
      where: {
        id: user.id,
      },
      data: {
        password: newPassword,
        updated_at: new Date().toISOString(),
      },
    });

    return c.json({ message: "Password reset" });
  } catch (error) {
    return c.json({ error: "An error occurred", message: error }, 500);
  }
}

router.get("/session", async (c) => {
  const token = getCookie(c, "session_token");
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  const validJwtToken = (await jwt.verify(token, process.env.JWT_SECRET!)) as { id: number };
  if (!validJwtToken) return c.json({ error: "Unauthorized" }, 401);

  const user = await db.findFirst<User>({
    table: "User",
    where: {
      id: validJwtToken.id,
    },
  });

  if (!user) return c.json({ error: "User not found" }, 404);

  return c.json({
    message: "User is logged in",
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  });
});

export default router;
