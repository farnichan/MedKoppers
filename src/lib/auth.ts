import "server-only";
import { createServerClient } from "./supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
};

/**
 * The signed-in user, or null. Reads the session cookie, so only call this
 * from a Server Component behind a <Suspense> boundary (see src/app/home/page.tsx)
 * or from a Server Action.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name: typeof data.user.user_metadata?.name === "string" ? data.user.user_metadata.name : "",
  };
}
