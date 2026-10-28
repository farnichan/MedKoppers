import { Suspense } from "react";
import TestForm from "@/components/TestForm";
import { TEST_SUBJECT_SLUG } from "@/lib/config";
import { getTestQuestions } from "@/lib/questions";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold">Pharmacology</h1>
      <p className="mb-6 text-sm text-gray-600">
        Choose one answer for each question, then tap Submit.
      </p>
      <Suspense fallback={<p className="text-gray-600">Loading questions…</p>}>
        <Questions />
      </Suspense>
    </main>
  );
}

async function Questions() {
  const questions = await getTestQuestions(TEST_SUBJECT_SLUG);
  if (questions.length === 0) {
    return <p className="text-gray-600">No questions yet.</p>;
  }
  return <TestForm questions={questions} />;
}
