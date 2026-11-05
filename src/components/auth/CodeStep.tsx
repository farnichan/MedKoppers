"use client";

import { useEffect, useState, useTransition } from "react";
import Field from "./Field";
import { buttonClass } from "@/components/ui/button";
import { inputClass } from "@/components/ui/input";
import { codeSentTo, COPY } from "@/lib/copy";

const T = COPY.auth;

type FormState = { error: string } | null;
type ResendResult = { ok: true } | { ok: false; error: string };

/**
 * The "enter the 6-digit code" step, shared by sign up, log in and forgot
 * password. `children` adds extra fields below the code (e.g. a new password).
 * `hideCode` hides the code field and resend link (local dev with
 * SKIP_EMAIL_CODES, where no code is emailed).
 */
export default function CodeStep({
  email,
  state,
  action,
  pending,
  notice,
  onChangeEmail,
  onResend,
  children,
  submitLabel = T.verifySubmit,
  submittingLabel = T.verifySubmitting,
  hideCode = false,
  sentMessage,
}: {
  email: string;
  state: FormState;
  action: (formData: FormData) => void;
  pending: boolean;
  /** Optional line shown above "We've sent a code to…". */
  notice?: string;
  onChangeEmail: () => void;
  onResend: () => Promise<ResendResult>;
  children?: React.ReactNode;
  submitLabel?: string;
  submittingLabel?: string;
  hideCode?: boolean;
  /** Replaces "We've sent a 6-digit code to …". */
  sentMessage?: string;
}) {
  const [resendState, setResendState] = useState<{ error: string } | { sent: true } | null>(null);
  const [cooldown, setCooldown] = useState(30);
  const [isResending, startResend] = useTransition();

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  function handleResend() {
    setResendState(null);
    startResend(async () => {
      const result = await onResend();
      setResendState(result.ok ? { sent: true } : { error: result.error });
      setCooldown(30);
    });
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      {notice && <p className="text-sm font-semibold text-ink">{notice}</p>}
      {!hideCode && <p className="text-sm font-medium text-muted">{sentMessage ?? codeSentTo(email)}</p>}
      {!hideCode && (
      <Field label={T.codeLabel}>
        <input
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          placeholder={T.codePlaceholder}
          className={inputClass("text-center text-lg tracking-[0.3em]")}
        />
      </Field>
      )}
      {children}

      {state?.error && <p className="text-sm font-semibold text-wrong">{state.error}</p>}
      {resendState && "error" in resendState && (
        <p className="text-sm font-semibold text-wrong">{resendState.error}</p>
      )}
      {resendState && "sent" in resendState && (
        <p className="text-sm font-semibold text-correct">{T.resendSent}</p>
      )}

      <button type="submit" disabled={pending} className={buttonClass({ className: "w-full" })}>
        {pending ? submittingLabel : submitLabel}
      </button>

      <div className="flex items-center justify-between text-sm font-medium">
        <button type="button" onClick={onChangeEmail} className="text-muted hover:text-ink hover:underline">
          {T.changeEmail}
        </button>
        {!hideCode && (
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className="text-brand hover:underline disabled:pointer-events-none disabled:text-subtle"
        >
          {cooldown > 0 ? T.resendIn(cooldown) : T.resend}
        </button>
        )}
      </div>
    </form>
  );
}
