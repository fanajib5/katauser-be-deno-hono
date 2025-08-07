// db/client.ts
import { drizzle } from "https://esm.sh/drizzle-orm@0.44.4/postgres-js";
import {
  users,
  organizations,
  projects,
  feedback,
  tags,
  feedbackTags,
  feedbackAnalysis,
} from "./schema.ts";
import postgres from "https://esm.sh/postgres@3.4.3";

// Ambil dari Supabase: Settings > Database > Connection String
const connectionString = process.env.SUPABASE_CONN_STRING;

const client = postgres(connectionString);
const db = drizzle(client, { schema: { users, posts } });

export {
  db,
  users,
  organizations,
  projects,
  feedback,
  tags,
  feedbackTags,
  feedbackAnalysis,
};
