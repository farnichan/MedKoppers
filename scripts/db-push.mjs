// Applies any new files in supabase/migrations to your Supabase database.
//
// Run with:  npm run db:push
// Needs SUPABASE_DB_URL in .env.local (the "Session pooler" connection string).

import { spawnSync } from "node:child_process";

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl || dbUrl.includes("YOUR-DB-PASSWORD")) {
  console.error("Missing SUPABASE_DB_URL. Fill it in .env.local first (see .env.example).");
  process.exit(1);
}

const result = spawnSync("npx", ["supabase", "db", "push", "--db-url", dbUrl], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
