"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { submitTest } from "@/app/actions";
import type { Answers, QuestionResult, StudentQuestion, TestResult } from "@/lib/types";

const LETTERS = "ABCDEFGHIJ";

export default function TestForm({ questions }: { questions: StudentQuestion[] }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

  const answeredCount = Object.keys(answers).length;
  const resultsById = new Map(result?.results.map((r) => [r.questionId, r]));

  // Jump to the top (score / first question) once results appear or are
  // cleared. Done after render so the page has its new layout first.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
  }, [result]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startSubmit(async () => {
      try {
        const graded = await submitTest(answers);
        startSubmit(() => setResult(graded));
      } catch {
        setError("Something went wrong while submitting. Please try again.");
      }
    });
  }

  function handleTryAgain() {
    setAnswers({});
    setResult(null);
    setError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {result && (
        <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-600">Your score</p>
          <p className="text-3xl font-bold">
            {result.score}/{result.total}
          </p>
          <button
            type="button"
            onClick={handleTryAgain}
            className="mt-3 rounded-md border border-gray-400 px-4 py-2 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      )}

      <ol className="space-y-6">
        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            number={index + 1}
            question={question}
            selectedOptionId={answers[question.id] ?? null}
            result={resultsById.get(question.id)}
            locked={result !== null}
            onSelect={(optionId) =>
              setAnswers((prev) => ({ ...prev, [question.id]: optionId }))
            }
          />
        ))}
      </ol>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {result ? (
        <button
          type="button"
          onClick={handleTryAgain}
          className="w-full rounded-md bg-gray-900 px-4 py-3 font-medium text-white"
        >
          Try again
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-center text-sm text-gray-600">
            Answered {answeredCount} of {questions.length}
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-gray-900 px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      )}
    </form>
  );
}

function QuestionCard({
  number,
  question,
  selectedOptionId,
  result,
  locked,
  onSelect,
}: {
  number: number;
  question: StudentQuestion;
  selectedOptionId: string | null;
  result: QuestionResult | undefined;
  locked: boolean;
  onSelect: (optionId: string) => void;
}) {
  return (
    <li className="rounded-lg border border-gray-200 p-4">
      <fieldset disabled={locked}>
        <legend className="mb-3 w-full">
          <span className="flex items-start justify-between gap-3">
            <span className="text-sm font-semibold text-gray-500">Q{number}</span>
            {locked && <ResultBadge result={result} selectedOptionId={selectedOptionId} />}
          </span>
          <span className="mt-1 block font-medium">{question.text}</span>
        </legend>

        {question.imageUrl && (
          <Image
            src={question.imageUrl}
            alt={`Image for question ${number}`}
            width={800}
            height={500}
            sizes="(max-width: 672px) 100vw, 640px"
            className="mb-3 h-auto w-full rounded border border-gray-200"
          />
        )}

        <div className="space-y-2">
          {question.options.map((option, i) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrectAnswer = result?.correctOptionId === option.id;

            let style = "border-gray-300";
            if (locked && isCorrectAnswer) style = "border-green-600 bg-green-50";
            else if (locked && isSelected) style = "border-red-600 bg-red-50";
            else if (isSelected) style = "border-gray-900 bg-gray-100";

            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${style}`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => onSelect(option.id)}
                  className="mt-1"
                />
                <span>
                  <span className="mr-1 font-semibold">{LETTERS[i]}.</span>
                  {option.text}
                  {locked && isCorrectAnswer && !isSelected && (
                    <span className="ml-2 text-sm font-medium text-green-700">
                      Correct answer
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </li>
  );
}

function ResultBadge({
  result,
  selectedOptionId,
}: {
  result: QuestionResult | undefined;
  selectedOptionId: string | null;
}) {
  if (!result) return <span className="text-sm text-gray-500">Not marked</span>;
  if (result.isCorrect)
    return <span className="text-sm font-semibold text-green-700">Correct</span>;
  return (
    <span className="text-sm font-semibold text-red-700">
      {selectedOptionId ? "Wrong" : "Not answered"}
    </span>
  );
}
