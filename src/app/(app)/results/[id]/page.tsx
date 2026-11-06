import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import PageHeader from "@/components/app/PageHeader";
import QuestionReview from "@/components/QuestionReview";
import { SourceCredit } from "@/components/TestPageParts";
import Stars from "@/components/Stars";
import { buttonClass } from "@/components/ui/button";
import { getMyAttempt, type AttemptDetail } from "@/lib/attempts";
import { getCurrentUser } from "@/lib/auth";
import { TEST_SUBJECT_SLUG } from "@/lib/config";
import { COPY, formatTestDate, percentOf, testLabel } from "@/lib/copy";
import { getQuestionBank } from "@/lib/questions";
import type { QuestionResult } from "@/lib/types";

export const metadata: Metadata = {
  title: "Test review",
};

const T = COPY.app.results;

const FILTERS = {
  all: () => true,
  wrong: (r: QuestionResult) => !r.isCorrect && r.selectedOptionId !== null,
  skipped: (r: QuestionResult) => r.selectedOptionId === null,
  correct: (r: QuestionResult) => r.isCorrect,
} as const;
type Filter = keyof typeof FILTERS;

export default function ResultsPage({ params, searchParams }: PageProps<"/results/[id]">) {
  return (
    <Suspense fallback={<ReviewSkeleton />}>
      {Promise.all([params, searchParams]).then(([{ id }, query]) => (
        <Review id={id} filter={toFilter(query.show)} />
      ))}
    </Suspense>
  );
}

function toFilter(value: string | string[] | undefined): Filter {
  return typeof value === "string" && value in FILTERS ? (value as Filter) : "all";
}

// Reads the session (and the id from the URL), so it sits behind <Suspense>.
async function Review({ id, filter }: { id: string; filter: Filter }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Row Level Security means this only finds the student's own tests.
  const attempt = await getMyAttempt(id);
  if (!attempt) notFound();

  const bank = await getQuestionBank(TEST_SUBJECT_SLUG);
  const questionsById = new Map(bank.map((q) => [q.id, q]));
  const numbered = attempt.answers.map((answer, i) => ({ answer, number: i + 1 }));
  const shown = numbered.filter(({ answer }) => FILTERS[filter](answer));

  return (
    <>
      <PageHeader
        crumbs={[{ label: COPY.app.nav.history, href: "/history" }, { label: testLabel(attempt.number) }]}
        actions={
          <Link href="/test" className={buttonClass({ size: "sm" })}>
            <Plus aria-hidden size={16} strokeWidth={2} />
            {COPY.app.nav.newTest}
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-3xl space-y-5 px-5 py-6 sm:px-6 sm:py-8">
        <Summary attempt={attempt} />

        <FilterTabs id={attempt.id} active={filter} answers={attempt.answers} />

        {shown.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">
            {T.noneInFilter}
          </p>
        ) : (
          <ol className="space-y-3">
            {shown.map(({ answer, number }) => (
              <QuestionReview
                key={answer.questionId}
                number={number}
                question={questionsById.get(answer.questionId) ?? null}
                result={answer}
              />
            ))}
          </ol>
        )}

        <SourceCredit className="px-1" />
      </main>
    </>
  );
}

function Summary({ attempt }: { attempt: AttemptDetail }) {
  const s = COPY.status;
  const wrong = attempt.answers.filter(FILTERS.wrong).length;
  const skipped = attempt.answers.filter(FILTERS.skipped).length;
  const parts = [
    { label: s.correct, value: attempt.score, bar: "bg-correct" },
    { label: s.wrong, value: wrong, bar: "bg-wrong" },
    { label: s.skipped, value: skipped, bar: "bg-subtle/40" },
  ];

  return (
    <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-sm font-medium text-muted">
            {T.title} · {formatTestDate(attempt.createdAt)}
          </h1>
          <p className="mt-2 flex items-baseline gap-3">
            <span className="text-4xl font-semibold tracking-tight tabular-nums">
              {attempt.score}
              <span className="text-subtle">/{attempt.total}</span>
            </span>
            <span className="text-lg font-medium text-muted tabular-nums">
              {percentOf(attempt.score, attempt.total)}%
            </span>
          </p>
        </div>
        <span className="animate-pop">
          <Stars score={attempt.score} total={attempt.total} size={28} />
        </span>
      </div>

      {/* Segmented bar: correct / wrong / not answered, with a legend. */}
      <div className="mt-5 flex h-2 gap-0.5" aria-hidden>
        {parts
          .filter((p) => p.value > 0)
          .map((p) => (
            <span key={p.label} className={`rounded-full ${p.bar}`} style={{ flexGrow: p.value }} />
          ))}
      </div>
      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {parts.map((p) => (
          <div key={p.label} className="flex items-center gap-2">
            <span aria-hidden className={`size-2 rounded-full ${p.bar}`} />
            <dt className="text-muted">{p.label}</dt>
            <dd className="font-semibold tabular-nums">{p.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function FilterTabs({ id, active, answers }: { id: string; active: Filter; answers: QuestionResult[] }) {
  return (
    <nav aria-label="Filter questions" className="grid grid-cols-2 gap-1 rounded-lg bg-ink/[0.04] p-1 sm:flex">
      {(Object.keys(FILTERS) as Filter[]).map((f) => {
        const isActive = f === active;
        return (
          <Link
            key={f}
            href={f === "all" ? `/results/${id}` : `/results/${id}?show=${f}`}
            scroll={false}
            replace
            aria-current={isActive ? "page" : undefined}
            className={`flex h-9 items-center justify-between gap-1.5 rounded-md px-3 text-[13px] font-medium whitespace-nowrap transition-colors sm:h-8 sm:shrink-0 sm:justify-start sm:text-sm ${
              isActive ? "bg-white text-ink shadow-[0_1px_2px_rgb(16_18_31/0.08)]" : "text-muted hover:text-ink"
            }`}
          >
            {T.filters[f]}
            <span className="text-xs text-subtle tabular-nums">{answers.filter(FILTERS[f]).length}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function ReviewSkeleton() {
  const block = "animate-pulse rounded-xl bg-ink/[0.04]";
  return (
    <>
      <div className="h-12 border-b border-line" />
      <div aria-busy aria-label={COPY.home.loading} className="mx-auto max-w-3xl space-y-5 px-5 py-6 sm:px-6 sm:py-8">
        <div className={`h-40 ${block}`} />
        <div className={`h-10 ${block}`} />
        <div className={`h-56 ${block}`} />
      </div>
    </>
  );
}
