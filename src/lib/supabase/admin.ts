// Importing "server-only" makes the build fail if this file is ever pulled
// into browser code, so the secret key can't leak by accident.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

// Uses the secret (service role) key, which bypasses Row Level Security.
// Only for server code that needs answer_keys, i.e. marking.
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "Missing environment variable SUPABASE_SECRET_KEY. Copy .env.example to .env.local and fill it in.",
    );
  }
  return createClient(supabaseUrl(), secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
