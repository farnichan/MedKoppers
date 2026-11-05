"use server";

import { redirect } from "next/navigation";
import { authErrorMessage, COPY } from "@/lib/copy";
import { skipEmailCodes } from "@/lib/dev-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Emails a 6-digit reset code. Always reports success when the email is
 * valid, whether or not an account exists, so this can't be used to find out
 * who has an account (Supabase itself behaves the same way).
 */
export async function sendResetCode(email: string): Promise<ActionResult> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) return { ok: false, error: "Please enter your email." };

  // Local dev with SKIP_EMAIL_CODES: no email; resetPassword fetches the code itself.
  if (skipEmailCodes) return { ok: true };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
  if (error) return { ok: false, error: authErrorMessage(error.message) };
  return { ok: true };
}

/**
 * Checks the emailed code, sets the new password and signs the student in.
 * Code and new password are entered together, so nobody ends up signed in
 * with a half-finished reset.
 */
export async function resetPassword(email: string, code: string, password: string): Promise<ActionResult> {
  const trimmedEmail = email.trim().toLowerCase();
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  let token = code.trim();
  if (skipEmailCodes) {
    // Local dev only: get a real reset code from Supabase without emailing it.
    const { data, error } = await createAdminClient().auth.admin.generateLink({
      type: "recovery",
      email: trimmedEmail,
    });
    if (error) return { ok: false, error: COPY.auth.noAccountDev };
    token = data.properties.email_otp;
  }
  if (!token) return { ok: false, error: "Please enter the code." };

  const supabase = await createServerClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email: trimmedEmail,
    token,
    type: "recovery",
  });
  if (verifyError) return { ok: false, error: authErrorMessage(verifyError.message) };

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) {
    await supabase.auth.signOut();
    // Supabase rejects reusing the current password with a "different" message.
    if (updateError.message.toLowerCase().includes("different")) {
      return { ok: false, error: COPY.auth.passwordReused };
    }
    return { ok: false, error: authErrorMessage(updateError.message) };
  }

  redirect("/home");
}
