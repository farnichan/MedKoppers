import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import TestForm from "@/components/TestForm";
import { NoQuestions, QuestionsSkeleton, TestHeader } from "@/components/TestPageParts";
import { QUESTIONS_PER_TEST, TEST_SUBJECT_SLUG } from "@/lib/config";
import { drawRandomQuestions } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Pharmacology test",
};

// The public demo test: anyone can take it, results aren't saved.
// Signed-in students use /test instead, which saves to their dashboard.
export default function PracticePage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 pt-28 pb-20 sm:pt-32">
      <TestHeader />
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
  if (questions.length === 0) return <NoQuestions />;
  return <TestForm questions={questions} />;
}
