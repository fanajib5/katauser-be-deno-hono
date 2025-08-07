import { createClient } from "@supabase/supabase-js";
import * as path from "https://deno.land/std@0.177.0/path/mod.ts";
import { walk } from "https://deno.land/std@0.177.0/fs/walk.ts";

// 1. Baca env
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const MIGRATIONS_DIR = "./migrations";

async function runMigrations() {
  console.log("🔍 Connecting to Supabase...");

  // Pastikan tabel schema_migrations ada
  const { error: setupError } = await supabase.rpc(
    "create_migrations_table_if_not_exists",
  );
  if (setupError && !setupError.message.includes("already exists")) {
    console.error("❌ Setup error:", setupError);
    Deno.exit(1);
  }

  // Ambil daftar migrasi yang sudah dijalankan
  const { data: applied, error: selectError } = await supabase
    .from("schema_migrations")
    .select("version");

  if (selectError) {
    console.error("❌ Failed to read applied migrations:", selectError);
    Deno.exit(1);
  }

  const appliedVersions = new Set(applied?.map((m) => m.version));

  let appliedCount = 0;

  // Baca semua file .sql di folder migrations
  for await (const entry of walk(MIGRATIONS_DIR, {
    match: [/.sql$/],
    exts: ["sql"],
  })) {
    const filename = path.basename(entry.path);
    const version = filename.split("_")[0]; // 0001

    if (appliedVersions.has(version)) {
      console.log(`⏭️  Already applied: ${filename}`);
      continue;
    }

    console.log(`🚀 Running migration: ${filename}`);
    const content = await Deno.readTextFile(entry.path);

    // Ekstrak nama dari komentar
    const nameMatch = content.match(/--\s*name:\s*(.+)/);
    const name = nameMatch ? nameMatch[1] : filename;

    try {
      // Jalankan SQL via RPC (aman)
      const { error } = await supabase.rpc("execute_sql", {
        sql_text: content,
      });
      if (error) throw error;

      // Simpan ke schema_migrations
      await supabase.from("schema_migrations").insert({
        version,
        name,
      });

      console.log(`✅ Applied: ${version} - ${name}`);
      appliedCount++;
    } catch (error) {
      console.error(`❌ Failed to apply ${version}:`, error.message);
      Deno.exit(1);
    }
  }

  console.log(`🎉 Done! ${appliedCount} migration(s) applied.`);
}

// Jalankan
await runMigrations();
