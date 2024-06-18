import { Context } from "hono";
import { getCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
import db from "./db";
import { User } from "@prisma/client";

export const auth = async (c): Promise<User | null> => {
  try {
    const token = await getCookie(c, "session_token");
    if (!token) throw new Error("Unauthorized");

    const validJwtToken = (await jwt.verify(token, process.env.JWT_SECRET!)) as { id: string };
    if (!validJwtToken) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { id: validJwtToken.id },
    });

    if (!user) throw new Error("User not found");
    else return user;
  } catch (error) {
    return null;
  }
};
