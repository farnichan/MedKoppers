import type { Metadata } from "next";
import Link from "next/link";
import SignupForm from "./SignupForm";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  const t = COPY.auth;
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 pt-28 pb-16">
      <div className="card-grid rounded-2xl border-2 border-line bg-white p-6 sm:p-8">
        <h1 className="font-heading text-2xl font-bold tracking-[-0.01em]">{t.signupTitle}</h1>
        <p className="mt-1.5 font-medium text-muted">{t.signupSubtitle}</p>

        <SignupForm />

        <p className="mt-6 text-center text-sm font-medium text-muted">
          {t.hasAccount}{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            {COPY.nav.logIn}
          </Link>
        </p>
      </div>
    </main>
  );
}
