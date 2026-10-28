import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import TestForm from "@/components/TestForm";
import Sticker from "@/components/ui/Sticker";
import { QUESTIONS_PER_TEST, TEST_SUBJECT_SLUG } from "@/lib/config";
import { COPY } from "@/lib/copy";
import { drawRandomQuestions } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Pharmacology practice test",
};

export default function PracticePage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-28 pb-20 sm:pt-32">
      <header className="mb-8 px-1">
        <Sticker color="yellow" tilt={-3}>
          {COPY.practice.titleSticker}
        </Sticker>
        <h1 className="mt-4 text-5xl leading-[0.95] font-extrabold tracking-[-0.035em] sm:text-6xl">
          Pharmacology
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{COPY.practice.subtitle}</p>
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
      <p className="rounded-2xl border-2 border-ink bg-paper p-6 font-medium shadow-hard">
        {COPY.practice.empty}
      </p>
    );
  }
  return <TestForm questions={questions} />;
}

function QuestionsSkeleton() {
  return (
    <div aria-busy className="space-y-5">
      <p className="text-center font-bold text-muted">{COPY.practice.loading}</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border-2 border-ink/20 bg-paper p-5">
          <div className="mb-3 h-3 w-24 rounded bg-ink/10" />
          <div className="mb-5 h-4 w-4/5 rounded bg-ink/10" />
          <div className="space-y-2">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="h-12 rounded-xl border-2 border-ink/10 bg-cream" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
