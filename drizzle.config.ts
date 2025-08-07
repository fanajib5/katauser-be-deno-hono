// drizzle.config.ts
import type { Config } from "drizzle-kit";
import process from "node:process";

// Validasi environment variables
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

if (!DB_HOST || !DB_NAME || !DB_USER || !DB_PASS) {
  throw new Error("❌ Missing required database environment variables");
}

export default {
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./migrations",
  dbCredentials: {
    host: DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASS,
    ssl: process.env.DB_SSL === "true" ? "require" : false,
  },
} satisfies Config;
