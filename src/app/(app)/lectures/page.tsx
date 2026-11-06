import { ArrowRight, PlayCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import PageHeader from "@/components/app/PageHeader";
import { buttonClass } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Lectures",
};

const T = COPY.app.lectures;

// Placeholder until lectures exist.
export default function LecturesPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: T.title }]} />
      <main className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-6 sm:py-8">
        <Suspense fallback={null}>
          <RequireUser />
        </Suspense>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight lg:hidden">{T.title}</h1>
        <section className="flex flex-col items-center rounded-xl border border-line bg-white px-6 py-14 text-center">
          <span aria-hidden className="grid size-14 place-items-center rounded-xl bg-tint-blue text-brand">
            <PlayCircle size={28} strokeWidth={1.75} />
          </span>
          <h2 className="mt-4 text-base font-semibold">{T.heading}</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">{T.text}</p>
          <Link href="/test" className={buttonClass({ variant: "secondary", className: "mt-6" })}>
            {T.cta}
            <ArrowRight aria-hidden size={16} />
          </Link>
        </section>
      </main>
    </>
  );
}

// Like every app page, only for signed-in students (reads the session, so
// it sits behind <Suspense>).
async function RequireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return null;
}
