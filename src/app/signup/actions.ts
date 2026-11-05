"use server";

import { redirect } from "next/navigation";
import { authErrorMessage } from "@/lib/copy";
import { createServerClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Creates the account (unconfirmed) and emails a 6-digit signup code. */
export async function signUp(name: string, email: string, password: string): Promise<ActionResult> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName) return { ok: false, error: "Please enter your name." };
  if (!trimmedEmail) return { ok: false, error: "Please enter your email." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: { data: { name: trimmedName } },
  });
  if (error) return { ok: false, error: authErrorMessage(error.message) };
  return { ok: true };
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
