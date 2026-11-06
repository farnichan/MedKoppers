import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import RedirectIfSignedIn from "@/components/auth/RedirectIfSignedIn";
import LoginForm from "./LoginForm";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  const t = COPY.auth;
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-5 pt-28 pb-16">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <div className="card-grid rounded-2xl border-2 border-line bg-white p-6 sm:p-8">
        <h1 className="font-heading text-2xl font-bold tracking-[-0.01em]">{t.loginTitle}</h1>
        <p className="mt-1.5 font-medium text-muted">{t.loginSubtitle}</p>

        <LoginForm />

        <p className="mt-6 text-center text-sm font-medium text-muted">
          {t.noAccount}{" "}
          <Link href="/signup" className="font-semibold text-brand hover:underline">
            {COPY.nav.signUp}
          </Link>
        </p>
      </div>
    </main>
  );
}
