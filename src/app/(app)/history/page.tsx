import { ArrowRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import PageHeader from "@/components/app/PageHeader";
import TestsTable from "@/components/app/TestsTable";
import { buttonClass } from "@/components/ui/button";
import { getMyAttempts } from "@/lib/attempts";
import { getCurrentUser } from "@/lib/auth";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = {
  title: "History",
};

const T = COPY.app.history;

export default function HistoryPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: T.title }]}
        actions={
          <Link href="/test" className={buttonClass({ size: "sm" })}>
            <Plus aria-hidden size={16} strokeWidth={2} />
            {COPY.app.nav.newTest}
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-6 sm:py-8">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-ink/[0.04]" />}>
          <History />
        </Suspense>
      </main>
    </>
  );
}

async function History() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { attempts, totalCount } = await getMyAttempts();

  if (attempts.length === 0) {
    const d = COPY.app.dashboard;
    return (
      <section className="flex flex-col items-center rounded-xl border border-line px-6 py-14 text-center">
        <h1 className="text-base font-semibold">{d.emptyTitle}</h1>
        <p className="mt-1 max-w-sm text-sm text-muted">{d.emptyText}</p>
        <Link href="/test" className={buttonClass({ className: "mt-6" })}>
          {d.emptyCta}
          <ArrowRight aria-hidden size={16} />
        </Link>
      </section>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{T.title}</h1>
      <p className="mt-1 mb-6 text-sm text-muted">{T.subtitle(totalCount)}</p>
      <TestsTable attempts={attempts} />
    </div>
  );
}
