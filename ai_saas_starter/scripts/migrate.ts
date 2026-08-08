import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for migrations");

const sql = postgres(databaseUrl, { max: 1 });
try {
  const migration = await readFile(resolve("db/schema.sql"), "utf8");
  await sql.unsafe(migration);
  console.log("Applied db/schema.sql");
} finally {
  await sql.end();
}
