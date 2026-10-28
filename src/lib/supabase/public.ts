import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./env";

// Uses the publishable (anon) key, so Row Level Security applies:
// it can read subjects, questions and options, but NOT answer_keys.
export function createPublicClient() {
  return createClient(supabaseUrl(), supabasePublishableKey(), {
    auth: { persistSession: false },
  });
}
