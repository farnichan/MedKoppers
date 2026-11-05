import { ArrowRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import PageHeader from "@/components/app/PageHeader";
import ScoreChart from "@/components/app/ScoreChart";
import StatGrid from "@/components/app/StatGrid";
import TestsTable from "@/components/app/TestsTable";
import PixelArt from "@/components/pixel/PixelArt";
import { ANSWER_SHEET } from "@/components/pixel/art";
import { tintFor } from "@/components/TopicTag";
import { buttonClass } from "@/components/ui/button";
import { getMyAttempts, getMyTopicStats, type AttemptSummary, type TopicStat } from "@/lib/attempts";
import { getCurrentUser } from "@/lib/auth";
import { COPY, formatDay, percentOf, welcomeBack } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Dashboard",
};

const T = COPY.app.dashboard;
const CHART_TESTS = 12;
const RECENT_TESTS = 5;
const TOPICS_SHOWN = 6;

export default function DashboardPage() {
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
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <Dashboard />
        </Suspense>
      </main>
    </>
  );
}

// Reads the session, so it has to sit behind the <Suspense> boundary above
// (see "Authentication with Cache Components" in the Next.js docs).
async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const [{ attempts, totalCount }, topics] = await Promise.all([getMyAttempts(), getMyTopicStats()]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{welcomeBack(user.name)}</h1>
      {attempts.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <Stats attempts={attempts} totalCount={totalCount} />
          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-xl border border-line bg-white p-4 sm:p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold">{T.chartTitle}</h2>
              <p className="mt-0.5 mb-5 text-xs text-subtle">
                {T.chartSubtitle(Math.min(attempts.length, CHART_TESTS))}
              </p>
              <ScoreChart attempts={attempts.slice(0, CHART_TESTS)} />
            </section>
            <TopicsCard topics={topics} />
          </div>
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{T.recentTitle}</h2>
              {attempts.length > RECENT_TESTS && (
                <Link href="/history" className="flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
                  {T.viewAll}
                  <ArrowRight aria-hidden size={14} />
                </Link>
              )}
            </div>
            <TestsTable attempts={attempts.slice(0, RECENT_TESTS)} />
          </section>
        </>
      )}
    </div>
  );
}

function Stats({ attempts, totalCount }: { attempts: AttemptSummary[]; totalCount: number }) {
  const percents = attempts.map((a) => percentOf(a.score, a.total));
  const avg = (list: number[]) => Math.round(list.reduce((sum, p) => sum + p, 0) / list.length);
  const bestIndex = percents.indexOf(Math.max(...percents));
  const answered = attempts.reduce((sum, a) => sum + a.total, 0);
  const correct = attempts.reduce((sum, a) => sum + a.score, 0);

  return (
    <StatGrid
      stats={[
        { label: T.testsTaken, value: String(totalCount), note: T.lastNote(formatDay(attempts[0].createdAt)) },
        { label: T.average, value: `${avg(percents)}%`, note: T.lastFiveNote(avg(percents.slice(0, 5))) },
        { label: T.best, value: `${percents[bestIndex]}%`, note: formatDay(attempts[bestIndex].createdAt) },
        { label: T.questionsAnswered, value: String(answered), note: T.correctNote(correct) },
      ]}
    />
  );
}

function TopicsCard({ topics }: { topics: TopicStat[] }) {
  return (
    <section className="rounded-xl border border-line bg-white p-4 sm:p-5">
      <h2 className="text-sm font-semibold">{T.topicsTitle}</h2>
      <p className="mt-0.5 mb-4 text-xs text-subtle">{T.topicsSubtitle}</p>
      <ul className="space-y-3.5">
        {topics.slice(0, TOPICS_SHOWN).map((t) => {
          const name = t.topic ?? T.otherTopic;
          const pct = percentOf(t.correct, t.total);
          return (
            <li key={name}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span aria-hidden className={`size-2.5 shrink-0 rounded-[3px] ring-1 ring-ink/15 ${tintFor(name)}`} />
                  <span className="truncate font-medium">{name}</span>
                </span>
                <span className="shrink-0 text-muted tabular-nums">
                  {pct}% <span className="text-xs text-subtle">· {t.correct}/{t.total}</span>
                </span>
              </div>
              <div aria-hidden className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
                <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="flex flex-col items-center rounded-xl border border-line bg-white px-6 py-14 text-center">
      <span aria-hidden className="grid size-14 place-items-center rounded-xl bg-tint-blue">
        <PixelArt rows={ANSWER_SHEET} size={36} />
      </span>
      <h2 className="mt-4 text-base font-semibold">{T.emptyTitle}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted">{T.emptyText}</p>
      <Link href="/test" className={buttonClass({ className: "mt-6" })}>
        {T.emptyCta}
        <ArrowRight aria-hidden size={16} />
      </Link>
    </section>
  );
}

function DashboardSkeleton() {
  const block = "animate-pulse rounded-xl bg-ink/[0.04]";
  return (
    <div aria-busy aria-label={COPY.home.loading} className="space-y-6">
      <div className={`h-8 w-56 ${block}`} />
      <div className={`h-24 ${block}`} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`h-64 lg:col-span-2 ${block}`} />
        <div className={`h-64 ${block}`} />
      </div>
    </div>
  );
}
