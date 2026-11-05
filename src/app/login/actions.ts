"use server";

import { redirect } from "next/navigation";
import { authErrorMessage } from "@/lib/copy";
import { createServerClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Checks the password, then emails a 6-digit login code. Supabase has no
 * single "password + email OTP" call, so this checks the password first
 * (signing that attempt straight back out again, since it's not the real
 * sign-in yet), then sends the code; verifyLoginCode below does the real
 * sign-in once the code is confirmed.
 */
export async function checkPassword(email: string, password: string): Promise<ActionResult> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password) {
    return { ok: false, error: "Please enter your email and password." };
  }

  const supabase = await createServerClient();
  const { error: passwordError } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });
  if (passwordError) return { ok: false, error: authErrorMessage(passwordError.message) };

  await supabase.auth.signOut();

  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: trimmedEmail,
    options: { shouldCreateUser: false },
  });
  if (otpError) return { ok: false, error: authErrorMessage(otpError.message) };

  return { ok: true };
}

/** Verifies the emailed code and starts the real session. */
export async function verifyLoginCode(email: string, code: string): Promise<ActionResult> {
  if (!code.trim()) return { ok: false, error: "Please enter the code." };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: code.trim(),
    type: "email",
  });
  if (error) return { ok: false, error: authErrorMessage(error.message) };
  redirect("/home");
}

export async function resendLoginCode(email: string): Promise<ActionResult> {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: false },
  });
  if (error) return { ok: false, error: authErrorMessage(error.message) };
  return { ok: true };
}
