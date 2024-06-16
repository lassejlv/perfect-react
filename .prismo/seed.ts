import db from "../utils/db";

await db.generateTypes({ writeToSQLFile: false });
