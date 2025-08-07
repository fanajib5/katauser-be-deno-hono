// drizzle.config.ts
import type { Config } from "drizzle-kit";
import process from "node:process";

function parsePgConnectionString(connectionString: string) {
  // Pastikan protokolnya ada
  if (!connectionString.startsWith("postgresql://")) {
    throw new Error("Hanya mendukung protokol postgresql://");
  }

  // Ganti postgresql:// jadi postgres:// agar bisa di-parse oleh URL
  const normalized = connectionString.replace("postgresql://", "postgres://");
  const url = new URL(normalized);

  const host = url.hostname;
  const port = url.port ? parseInt(url.port) : 5432; // default 5432
  const database = url.pathname.slice(1); // hapus leading '/'
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);

  return {
    DB_HOST: host,
    DB_PORT: port,
    DB_NAME: database,
    DB_USER: user,
    DB_PASS: password,
    DB_SSL: true, // Supabase selalu butuh SSL
  };
}

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS } = parsePgConnectionString(
  process.env.DB_URL || "",
);

// Validasi environment variables
if (!DB_HOST || !DB_NAME || !DB_USER || !DB_PASS) {
  throw new Error("❌ Missing required database environment variables");
}

export default {
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./migrations",
  dbCredentials: {
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASS,
    ssl: process.env.DB_SSL === "true" ? "require" : false,
  },
} satisfies Config;
