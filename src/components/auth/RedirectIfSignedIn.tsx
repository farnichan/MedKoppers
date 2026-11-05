import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

/**
 * Sends an already signed-in student straight to their dashboard. Put it on
 * the log in / sign up / forgot password pages inside <Suspense fallback={null}>,
 * so the form itself still loads instantly for everyone else.
 */
export default async function RedirectIfSignedIn() {
  const user = await getCurrentUser();
  if (user) redirect("/home");
  return null;
}
