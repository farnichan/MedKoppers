"use client";

import { useActionState, useState } from "react";
import { resetPassword, sendResetCode } from "./actions";
import CodeStep from "@/components/auth/CodeStep";
import Field from "@/components/auth/Field";
import { buttonClass } from "@/components/ui/button";
import { inputClass } from "@/components/ui/input";
import { COPY } from "@/lib/copy";

const T = COPY.auth;

type FormState = { error: string } | null;

/**
 * Forgot password: 1) email -> a reset code is emailed, 2) code + new password
 * -> password changed and signed in. `devNoCode` (local dev with
 * SKIP_EMAIL_CODES) skips the code field.
 */
export default function ForgotPasswordForm({ devNoCode }: { devNoCode: boolean }) {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");

  async function handleEmail(_prev: FormState, formData: FormData): Promise<FormState> {
    const enteredEmail = String(formData.get("email") ?? "");
    const result = await sendResetCode(enteredEmail);
    if (!result.ok) return { error: result.error };
    setEmail(enteredEmail.trim().toLowerCase());
    setStep("reset");
    return null;
  }

  async function handleReset(_prev: FormState, formData: FormData): Promise<FormState> {
    const code = String(formData.get("code") ?? "");
    const password = String(formData.get("password") ?? "");
    const result = await resetPassword(email, code, password);
    // On success resetPassword redirects, so this line only runs on error.
    if (!result.ok) return { error: result.error };
    return null;
  }

  const [emailState, emailAction, emailPending] = useActionState(handleEmail, null);
  const [resetState, resetAction, resetPending] = useActionState(handleReset, null);

  if (step === "reset") {
    return (
      <CodeStep
        email={email}
        state={resetState}
        action={resetAction}
        pending={resetPending}
        hideCode={devNoCode}
        notice={devNoCode ? T.resetNoCodeDev : undefined}
        sentMessage={T.resetCodeSentTo(email)}
        submitLabel={T.resetSubmit}
        submittingLabel={T.resetSubmitting}
        onChangeEmail={() => setStep("email")}
        onResend={() => sendResetCode(email)}
      >
        <Field label={T.newPasswordLabel}>
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
      </CodeStep>
    );
  }

  return (
    <form action={emailAction} className="mt-6 space-y-4">
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

      {emailState?.error && <p className="text-sm font-semibold text-wrong">{emailState.error}</p>}

      <button type="submit" disabled={emailPending} className={buttonClass({ className: "w-full" })}>
        {emailPending ? T.forgotSubmitting : T.forgotSubmit}
      </button>
    </form>
  );
}
