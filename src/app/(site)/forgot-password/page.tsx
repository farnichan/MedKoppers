import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ForgotPasswordForm from "./ForgotPasswordForm";
import RedirectIfSignedIn from "@/components/auth/RedirectIfSignedIn";
import { COPY } from "@/lib/copy";
import { skipEmailCodes } from "@/lib/dev-auth";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  const t = COPY.auth;
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 pt-28 pb-16">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <div className="card-grid rounded-2xl border-2 border-line bg-white p-6 sm:p-8">
        <h1 className="font-heading text-2xl font-bold tracking-[-0.01em]">{t.forgotTitle}</h1>
        <p className="mt-1.5 font-medium text-muted">{t.forgotSubtitle}</p>

        <ForgotPasswordForm devNoCode={skipEmailCodes} />

        <p className="mt-6 text-center text-sm font-medium text-muted">
          <Link href="/login" className="font-semibold text-brand hover:underline">
            {t.backToLogin}
          </Link>
        </p>
      </div>
    </main>
  );
}
