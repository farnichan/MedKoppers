"use client";

import { useActionState, useState } from "react";
import { resendSignupCode, signUp, verifySignupCode } from "./actions";
import { resendLoginCode, verifyLoginCode } from "@/app/login/actions";
import CodeStep from "@/components/auth/CodeStep";
import Field from "@/components/auth/Field";
import { buttonClass } from "@/components/ui/button";
import { inputClass } from "@/components/ui/input";
import { COPY } from "@/lib/copy";

const T = COPY.auth;

type FormState = { error: string } | null;

export default function SignupForm() {
  const [step, setStep] = useState<"details" | "code">("details");
  const [email, setEmail] = useState("");
  // "login" when the email already had an account and the password matched.
  const [mode, setMode] = useState<"signup" | "login">("signup");

  async function handleDetails(_prev: FormState, formData: FormData): Promise<FormState> {
    const name = String(formData.get("name") ?? "");
    const enteredEmail = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signUp(name, enteredEmail, password);
    if (!result.ok) return { error: result.error };

    setEmail(enteredEmail.trim().toLowerCase());
    setMode(result.mode);
    setStep("code");
    return null;
  }

  async function handleVerify(_prev: FormState, formData: FormData): Promise<FormState> {
    const code = String(formData.get("code") ?? "");
    const verify = mode === "login" ? verifyLoginCode : verifySignupCode;
    const result = await verify(email, code);
    // On success verify redirects, so this line only runs on error.
    if (!result.ok) return { error: result.error };
    return null;
  }

  const [detailsState, detailsAction, detailsPending] = useActionState(handleDetails, null);
  const [verifyState, verifyAction, verifyPending] = useActionState(handleVerify, null);

  if (step === "code") {
    return (
      <CodeStep
        email={email}
        state={verifyState}
        action={verifyAction}
        pending={verifyPending}
        onChangeEmail={() => setStep("details")}
        notice={mode === "login" ? T.existingAccountLogin : undefined}
        onResend={() => (mode === "login" ? resendLoginCode(email) : resendSignupCode(email))}
      />
    );
  }

  return (
    <form action={detailsAction} className="mt-6 space-y-4">
      <Field label={T.nameLabel}>
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder={T.namePlaceholder}
          className={inputClass()}
        />
      </Field>
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
          autoComplete="new-password"
          required
          minLength={8}
          placeholder={T.passwordPlaceholder}
          className={inputClass()}
        />
      </Field>

      {detailsState?.error && <p className="text-sm font-semibold text-wrong">{detailsState.error}</p>}

      <button type="submit" disabled={detailsPending} className={buttonClass({ className: "w-full" })}>
        {detailsPending ? T.signupSubmitting : T.signupSubmit}
      </button>
    </form>
  );
}
