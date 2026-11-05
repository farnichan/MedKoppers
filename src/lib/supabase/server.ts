import "server-only";
import { cookies } from "next/headers";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./env";

// Uses the publishable (anon) key and reads/writes the signed-in user's
// session from cookies, so Row Level Security applies as that user.
// For Server Components and Server Actions only (needs next/headers cookies).
export async function createServerClient() {
  const cookieStore = await cookies();
  return createSupabaseServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render, where cookies can't be
          // written. src/proxy.ts refreshes the session on every request
          // instead, so this is safe to ignore.
        }
      },
    },
  });
}
