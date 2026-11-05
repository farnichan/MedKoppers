import "server-only";
import { cache } from "react";
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
 *
 * Wrapped in React cache(), so calling it from several places while rendering
 * one page (e.g. the sidebar and the page) only checks the session once.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name: typeof data.user.user_metadata?.name === "string" ? data.user.user_metadata.name : "",
  };
});
