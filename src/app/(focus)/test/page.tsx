import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { submitAndSaveTest } from "./actions";
import TestForm from "@/components/TestForm";
import { NoQuestions, QuestionsSkeleton, SourceCredit } from "@/components/TestPageParts";
import { getCurrentUser } from "@/lib/auth";
import { QUESTIONS_PER_TEST, TEST_SUBJECT_SLUG } from "@/lib/config";
import { COPY } from "@/lib/copy";
import { drawRandomQuestions } from "@/lib/questions";

export const metadata: Metadata = {
  title: "New test",
};

// The signed-in test, in focus mode: same as the public demo, but the result
// is saved to the student's dashboard.
export default function TestPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 pt-6 pb-20 sm:pt-8">
      <p className="px-1 text-sm text-muted">{COPY.practice.subtitle}</p>
      <SourceCredit className="mt-1 mb-5 px-1" />
      <Suspense fallback={<QuestionsSkeleton />}>
        <Questions />
      </Suspense>
    </main>
  );
}

// Reads the session, so it sits behind the <Suspense> boundary above.
async function Questions() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const questions = await drawRandomQuestions(TEST_SUBJECT_SLUG, QUESTIONS_PER_TEST);
  if (questions.length === 0) return <NoQuestions />;
  return <TestForm questions={questions} submit={submitAndSaveTest} dashboardHref="/home" variant="app" />;
}
