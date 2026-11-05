import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import TestForm from "@/components/TestForm";
import PixelArt from "@/components/pixel/PixelArt";
import { BOLD_CAPSULE, capsule } from "@/components/pixel/art";
import { QUESTIONS_PER_TEST, TEST_SUBJECT_SLUG } from "@/lib/config";
import { COPY } from "@/lib/copy";
import { drawRandomQuestions } from "@/lib/questions";

const PILL = capsule(14, BOLD_CAPSULE);

export const metadata: Metadata = {
  title: "Pharmacology test",
};

export default function PracticePage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-28 pb-20 sm:pt-32">
      <header className="mb-8 flex items-center gap-4 px-1">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-tint-blue">
          <PixelArt rows={PILL} size={44} />
        </span>
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-[-0.01em] sm:text-4xl">
            {COPY.practice.title}
          </h1>
          <p className="mt-1 font-medium text-muted">{COPY.practice.subtitle}</p>
        </div>
      </header>
      <Suspense fallback={<QuestionsSkeleton />}>
        <Questions />
      </Suspense>
    </main>
  );
}

async function Questions() {
  // Wait for a real request so each visit gets its own random set (the page
  // frame above is still pre-built and shows instantly).
  await connection();
  const questions = await drawRandomQuestions(TEST_SUBJECT_SLUG, QUESTIONS_PER_TEST);
  if (questions.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-soft p-6 text-muted">
        {COPY.practice.empty}
      </p>
    );
  }
  return <TestForm questions={questions} />;
}

function QuestionsSkeleton() {
  return (
    <div aria-busy aria-label={COPY.practice.loading} className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-line bg-white p-5">
          <div className="mb-3 h-3 w-28 rounded bg-soft" />
          <div className="mb-5 h-4 w-4/5 rounded bg-soft" />
          <div className="space-y-2">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="h-12 rounded-xl border border-line" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
