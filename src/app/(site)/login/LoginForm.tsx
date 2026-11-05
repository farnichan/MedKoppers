"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { checkPassword, resendLoginCode, verifyLoginCode } from "./actions";
import CodeStep from "@/components/auth/CodeStep";
import Field from "@/components/auth/Field";
import { buttonClass } from "@/components/ui/button";
import { inputClass } from "@/components/ui/input";
import { COPY } from "@/lib/copy";

const T = COPY.auth;

type FormState = { error: string } | null;

export default function LoginForm() {
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [email, setEmail] = useState("");

  async function handleCredentials(_prev: FormState, formData: FormData): Promise<FormState> {
    const enteredEmail = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await checkPassword(enteredEmail, password);
    if (!result.ok) return { error: result.error };

    setEmail(enteredEmail.trim().toLowerCase());
    setStep("code");
    return null;
  }

  async function handleVerify(_prev: FormState, formData: FormData): Promise<FormState> {
    const code = String(formData.get("code") ?? "");
    const result = await verifyLoginCode(email, code);
    // On success verifyLoginCode redirects, so this line only runs on error.
    if (!result.ok) return { error: result.error };
    return null;
  }

  const [credState, credAction, credPending] = useActionState(handleCredentials, null);
  const [verifyState, verifyAction, verifyPending] = useActionState(handleVerify, null);

  if (step === "code") {
    return (
      <CodeStep
        email={email}
        state={verifyState}
        action={verifyAction}
        pending={verifyPending}
        onChangeEmail={() => setStep("credentials")}
        onResend={() => resendLoginCode(email)}
      />
    );
  }

  return (
    <form action={credAction} className="mt-6 space-y-4">
      <Field label={T.emailLabel}>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={T.emailPlaceholder}
          className={inputClass()}
        />
      </Field>
      <Field label={T.passwordLabel}>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder={T.currentPasswordPlaceholder}
          className={inputClass()}
        />
      </Field>
      <p className="-mt-2 text-right text-sm">
        <Link href="/forgot-password" className="font-semibold text-brand hover:underline">
          {T.forgotLink}
        </Link>
      </p>

      {credState?.error && <p className="text-sm font-semibold text-wrong">{credState.error}</p>}

      <button type="submit" disabled={credPending} className={buttonClass({ className: "w-full" })}>
        {credPending ? T.loginSubmitting : T.loginSubmit}
      </button>
    </form>
  );
}
