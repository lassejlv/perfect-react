import { Context } from "hono";
import { getCookie } from "hono/cookie";
import { User } from "../.prismo/types";
import jwt from "jsonwebtoken";
import db from "./db";

export const auth = async (c: Context): Promise<boolean> => {
  try {
    const token = await getCookie(c, "session_token");
    if (!token) throw new Error("Unauthorized");

    const validJwtToken = (await jwt.verify(token, process.env.JWT_SECRET!)) as { id: string };
    if (!validJwtToken) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { id: validJwtToken.id },
    });

    if (!user) throw new Error("User not found");
    else return true;
  } catch (error) {
    return false;
  }
};
