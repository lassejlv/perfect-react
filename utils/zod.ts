import { z } from "zod";

export const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(8),
  email: z.string().email(),
});
