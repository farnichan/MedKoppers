"use server";

import { redirect } from "next/navigation";
import { authErrorMessage, COPY } from "@/lib/copy";
import { skipEmailCodes } from "@/lib/dev-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { checkPassword } from "@/app/(site)/login/actions";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * "signup": a new account was created and a signup code was emailed.
 * "login": the email already had a confirmed account and the password matched,
 * so a login code was emailed instead and the form continues as a log in.
 */
export type SignUpResult = { ok: true; mode: "signup" | "login" } | { ok: false; error: string };

/**
 * Creates the account (unconfirmed) and emails a 6-digit signup code. If the
 * email already belongs to a confirmed account, Supabase pretends to succeed
 * but sends nothing (and returns a user with no identities); in that case we
 * treat it as a log in when the password matches.
 */
export async function signUp(name: string, email: string, password: string): Promise<SignUpResult> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName) return { ok: false, error: "Please enter your name." };
  if (!trimmedEmail) return { ok: false, error: "Please enter your email." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  if (skipEmailCodes) return devSignUp(trimmedName, trimmedEmail, password);

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: { data: { name: trimmedName } },
  });
  if (error) return { ok: false, error: authErrorMessage(error.message) };

  const alreadyRegistered = data.user?.identities?.length === 0;
  if (!alreadyRegistered) return { ok: true, mode: "signup" };

  const login = await checkPassword(trimmedEmail, password);
  if (!login.ok) return { ok: false, error: COPY.auth.existingAccount };
  return { ok: true, mode: "login" };
}

/**
 * Local dev with SKIP_EMAIL_CODES only: creates the account already confirmed
 * (no email sent) and signs straight in. An existing account is treated as a
 * log in, like the normal flow.
 */
async function devSignUp(name: string, email: string, password: string): Promise<SignUpResult> {
  const { error } = await createAdminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error && error.code !== "email_exists") return { ok: false, error: authErrorMessage(error.message) };

  // Signs in and redirects to /home if the password is right.
  const login = await checkPassword(email, password);
  return login.ok ? { ok: true, mode: "login" } : { ok: false, error: COPY.auth.existingAccount };
}

/** Confirms the account with the emailed code and signs the user in. */
export async function verifySignupCode(email: string, code: string): Promise<ActionResult> {
  if (!code.trim()) return { ok: false, error: "Please enter the code." };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: code.trim(),
    type: "signup",
  });
  if (error) return { ok: false, error: authErrorMessage(error.message) };
  redirect("/home");
}

export async function resendSignupCode(email: string): Promise<ActionResult> {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim().toLowerCase(),
  });
  if (error) return { ok: false, error: authErrorMessage(error.message) };
  return { ok: true };
}
