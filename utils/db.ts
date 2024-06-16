import { PrismoClient } from "prismoo";
import { Tables } from "../.prismo/types";

const db = new PrismoClient<Tables>({
  url: process.env.TURSO_URL!,
  token: process.env.TURSO_TOKEN!,
  noRest: true,
});

export default db;
