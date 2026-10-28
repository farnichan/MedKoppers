"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { drawNewQuestions, submitTest } from "@/app/actions";
import { OptionContent, optionRowClass, type OptionState } from "@/components/OptionRow";
import { buttonClass } from "@/components/ui/button";
import { COPY, scoreReaction } from "@/lib/copy";
import type { Answers, QuestionResult, StudentQuestion, TestResult } from "@/lib/types";

const T = COPY.practice;

export default function TestForm({
  questions: initialQuestions,
}: {
  questions: StudentQuestion[];
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();
  const [isLoadingNew, startLoadingNew] = useTransition();

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
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
        const graded = await submitTest(
          questions.map((q) => q.id),
          answers,
        );
        startSubmit(() => setResult(graded));
      } catch {
        setError(T.error);
      }
    });
  }

  function handleTryAgain() {
    setError(null);
    startLoadingNew(async () => {
      try {
        const fresh = await drawNewQuestions();
        startLoadingNew(() => {
          setQuestions(fresh);
          setAnswers({});
          setResult(null);
        });
      } catch {
        setError(T.error);
      }
    });
  }

  const progress = (answeredCount / questions.length) * 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {result && (
        <ScoreCard
          result={result}
          answered={answeredCount}
          onTryAgain={handleTryAgain}
          isLoading={isLoadingNew}
        />
      )}

      <ol className="space-y-5">
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

      {result ? (
        <div className="pt-3">
          {error && <p className="mb-3 font-bold text-wrong">{error}</p>}
          <button
            type="button"
            onClick={handleTryAgain}
            disabled={isLoadingNew}
            className={buttonClass({ size: "lg", className: "w-full" })}
          >
            {isLoadingNew ? T.loadingNew : `${T.tryAgain} 🎲`}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-ink bg-paper p-5 shadow-hard">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <span className="font-extrabold">
              {answeredCount}/{questions.length} done
            </span>
            <span className="text-right text-sm font-bold text-muted">
              {COPY.progress(answeredCount, questions.length)}
            </span>
          </div>
          <div className="mb-5 h-4 overflow-hidden rounded-full border-2 border-ink bg-cream">
            <div
              className={`h-full bg-teal transition-[width] duration-300 ${progress > 0 && progress < 100 ? "border-r-2 border-ink" : ""}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {error && <p className="mb-3 font-bold text-wrong">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className={buttonClass({ size: "lg", className: "w-full" })}
          >
            {isSubmitting ? T.submitting : T.submit}
          </button>
          {unansweredCount > 0 && (
            <p className="mt-3 text-center text-sm font-medium text-muted">{T.unansweredNote}</p>
          )}
        </div>
      )}
    </form>
  );
}

function ScoreCard({
  result,
  answered,
  onTryAgain,
  isLoading,
}: {
  result: TestResult;
  answered: number;
  onTryAgain: () => void;
  isLoading: boolean;
}) {
  const wrong = result.results.filter((r) => !r.isCorrect && r.selectedOptionId).length;
  const skipped = result.results.filter((r) => !r.selectedOptionId).length;
  const reaction = scoreReaction(result.score, result.total, answered);

  return (
    <section
      aria-live="polite"
      className="pop-in relative overflow-hidden rounded-3xl border-2 border-ink bg-yellow p-6 shadow-hard-lg"
    >
      <span
        aria-hidden
        className="absolute top-3 right-3 rotate-12 text-6xl drop-shadow-[3px_3px_0_var(--color-ink)] sm:text-7xl"
      >
        {reaction.emoji}
      </span>
      <p className="text-sm font-bold">Your score</p>
      <p className="text-7xl leading-none font-extrabold tracking-[-0.04em]">
        {result.score}
        <span className="text-ink/40">/{result.total}</span>
      </p>
      <p className="mt-4 text-2xl font-extrabold">{reaction.title}</p>
      <p className="font-medium">{reaction.line}</p>

      <dl className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
        <Stat className="bg-correct-soft" label="Kop" value={result.score} />
        <Stat className="bg-wrong-soft" label="Bhul" value={wrong} />
        <Stat className="bg-paper" label="Skip" value={skipped} />
      </dl>

      <button
        type="button"
        onClick={onTryAgain}
        disabled={isLoading}
        className={buttonClass({ variant: "plain", className: "mt-6" })}
      >
        {isLoading ? T.loadingNew : `${T.tryAgain} 🎲`}
      </button>
    </section>
  );
}

function Stat({ className, label, value }: { className: string; label: string; value: number }) {
  return (
    <div className={`flex gap-1.5 rounded-lg border-2 border-ink px-2.5 py-1 ${className}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
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
    <li className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-hard sm:p-5">
      <fieldset disabled={locked}>
        <legend className="w-full">
          <span className="mb-3 flex items-center justify-between gap-3">
            <span className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-md border-2 border-ink bg-ink px-1.5 py-0.5 text-cream">
                Q{number}
              </span>
              {question.topic && <span className="text-muted">{question.topic}</span>}
            </span>
            {locked && <StatusPill result={result} selectedOptionId={selectedOptionId} />}
          </span>
          <span className="mb-4 block text-lg leading-snug font-bold">{question.text}</span>
        </legend>

        {question.imageUrl && (
          <Image
            src={question.imageUrl}
            alt={`Image for question ${number}`}
            width={800}
            height={500}
            sizes="(max-width: 672px) 100vw, 640px"
            className="mb-4 h-auto w-full rounded-xl border-2 border-ink bg-white"
          />
        )}

        <div className="space-y-2.5">
          {question.options.map((option, i) => {
            const state = optionState({
              isSelected: selectedOptionId === option.id,
              isCorrect: result?.correctOptionId === option.id,
              locked,
            });
            return (
              <label
                key={option.id}
                className={`${optionRowClass(state, !locked)} ${locked && state === "idle" ? "opacity-50" : ""}`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={() => onSelect(option.id)}
                  className="sr-only"
                />
                <OptionContent index={i} text={option.text} state={state} />
              </label>
            );
          })}
        </div>
      </fieldset>
    </li>
  );
}

function optionState({
  isSelected,
  isCorrect,
  locked,
}: {
  isSelected: boolean;
  isCorrect: boolean;
  locked: boolean;
}): OptionState {
  if (!locked) return isSelected ? "selected" : "idle";
  if (isSelected) return isCorrect ? "correct" : "wrong";
  return isCorrect ? "missed" : "idle";
}

function StatusPill({
  result,
  selectedOptionId,
}: {
  result: QuestionResult | undefined;
  selectedOptionId: string | null;
}) {
  const pill = "pop-in shrink-0 rounded-lg border-2 border-ink px-2 py-0.5 text-sm font-extrabold";
  const s = COPY.status;
  if (!result) return <span className={`${pill} bg-cream`}>{s.notMarked}</span>;
  if (result.isCorrect) return <span className={`${pill} -rotate-3 bg-correct-soft`}>{s.correct}</span>;
  if (!selectedOptionId) return <span className={`${pill} rotate-2 bg-cream`}>{s.skipped}</span>;
  return <span className={`${pill} rotate-3 bg-wrong-soft`}>{s.wrong}</span>;
}
