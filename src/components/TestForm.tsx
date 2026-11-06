"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { drawNewQuestions, submitTest } from "@/app/actions";
import { OptionContent, optionRowClass, type OptionState } from "@/components/OptionRow";
import TopicTag from "@/components/TopicTag";
import PixelArt from "@/components/pixel/PixelArt";
import { STAR, STAR_EMPTY } from "@/components/pixel/art";
import { buttonClass } from "@/components/ui/button";
import { COPY, scoreSummary, starsFor } from "@/lib/copy";
import type { Answers, QuestionResult, StudentQuestion, TestResult } from "@/lib/types";

const T = COPY.practice;

// "site": the public demo's playful look. "app": the cleaner signed-in app
// look (focus mode, below a 56px top bar), keeping the game bits as accents.
const STYLES = {
  site: {
    list: "space-y-4",
    questMap:
      "sticky top-[84px] z-40 rounded-2xl border border-line bg-white/80 px-4 py-3 backdrop-blur-xl sm:top-[92px]",
    card: "card-grid scroll-mt-44 rounded-2xl border-2 border-line bg-white p-4 sm:p-5",
    badge: "rounded-md bg-ink px-2 py-0.5 text-xs font-bold text-white",
    questionText: "text-[17px]",
    results:
      "graph-paper animate-pop relative overflow-hidden rounded-2xl border-2 border-ink/10 bg-white px-6 py-8 text-center shadow-[0_6px_0_0_rgb(16_18_31/0.08)]",
    resultsTitle: "font-heading text-lg font-semibold text-muted",
    bigScore: "font-heading text-6xl font-bold tracking-[-0.02em]",
  },
  app: {
    list: "space-y-3",
    questMap:
      "sticky top-[68px] z-30 rounded-xl border border-line bg-white/90 px-4 py-3 shadow-[0_1px_2px_rgb(16_18_31/0.04)] backdrop-blur-xl",
    card: "scroll-mt-40 rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgb(16_18_31/0.03)] sm:p-5",
    badge: "text-xs font-medium text-subtle tabular-nums",
    questionText: "text-[15px] sm:text-base",
    results:
      "animate-pop relative overflow-hidden rounded-xl border border-line bg-white px-6 py-8 text-center shadow-[0_1px_3px_rgb(16_18_31/0.05)]",
    resultsTitle: "text-sm font-medium text-muted",
    bigScore: "text-5xl font-semibold tracking-tight tabular-nums",
  },
};
type Styles = (typeof STYLES)["site"];

// True once the page's JavaScript is running. Before that, a tap on Submit
// would make the browser do an old-style form submit (reloading the page
// with a new random set and losing the answers), so inputs stay disabled.
const subscribeNoop = () => () => {};
function useHydrated() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export default function TestForm({
  questions: initialQuestions,
  submit = submitTest,
  dashboardHref,
  variant = "site",
}: {
  questions: StudentQuestion[];
  /** Visual style: the public site's, or the signed-in app's. */
  variant?: keyof typeof STYLES;
  /** Server Action that marks the test. Defaults to the public demo's (not saved). */
  submit?: (questionIds: string[], answers: Answers) => Promise<TestResult>;
  /** Signed-in tests: shows "saved" + a link back to the dashboard after marking. */
  dashboardHref?: string;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();
  const [isLoadingNew, startLoadingNew] = useTransition();
  const hydrated = useHydrated();
  const s = STYLES[variant];

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const resultsById = new Map(result?.results.map((r) => [r.questionId, r]));

  // Jump to the top (results / first question) once results appear or are
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
        const graded = await submit(
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <QuestMap
        s={s}
        questions={questions}
        answers={answers}
        resultsById={result ? resultsById : null}
      />

      {result && (
        <ResultsScreen
          result={result}
          answered={answeredCount}
          onTryAgain={handleTryAgain}
          isLoading={isLoadingNew}
          dashboardHref={dashboardHref}
          s={s}
        />
      )}

      <ol className={s.list}>
        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            s={s}
            number={index + 1}
            question={question}
            selectedOptionId={answers[question.id] ?? null}
            result={resultsById.get(question.id)}
            locked={result !== null}
            disabled={!hydrated}
            onSelect={(optionId) =>
              setAnswers((prev) => ({ ...prev, [question.id]: optionId }))
            }
          />
        ))}
      </ol>

      {error && <p className="text-sm font-semibold text-wrong">{error}</p>}

      {result ? (
        <button
          type="button"
          onClick={handleTryAgain}
          disabled={isLoadingNew}
          className={buttonClass({ size: "lg", className: "mt-4 w-full" })}
        >
          {isLoadingNew ? T.loadingNew : T.tryAgain}
        </button>
      ) : (
        <div className="pt-4">
          <button
            type="submit"
            disabled={!hydrated || isSubmitting}
            className={buttonClass({ size: "lg", className: "w-full" })}
          >
            {isSubmitting ? T.submitting : T.submit}
          </button>
          {unansweredCount > 0 && (
            <p className="mt-3 text-center text-xs font-medium text-subtle">{T.unansweredNote}</p>
          )}
        </div>
      )}
    </form>
  );
}

/**
 * Sticky bar with one block per question, like a level map. Blocks fill in
 * as questions are answered; after marking they show correct / wrong /
 * skipped. Tapping a block scrolls to that question.
 */
function QuestMap({
  s,
  questions,
  answers,
  resultsById,
}: {
  s: Styles;
  questions: StudentQuestion[];
  answers: Answers;
  resultsById: Map<string, QuestionResult> | null;
}) {
  const answered = questions.filter((q) => answers[q.id]).length;

  function blockStyle(q: StudentQuestion) {
    if (resultsById) {
      const r = resultsById.get(q.id);
      if (!r) return "bg-soft border-line";
      if (r.isCorrect) return "bg-correct border-correct";
      return r.selectedOptionId ? "bg-wrong border-wrong" : "bg-white border-line";
    }
    return answers[q.id] ? "bg-brand border-brand" : "bg-white border-line";
  }

  return (
    <div className={s.questMap}>
      <div className="mb-2 flex items-baseline justify-between text-sm font-semibold">
        <span className="font-semibold">{T.kicker}</span>
        <span className="text-muted">
          {resultsById ? "Results" : `${answered}/${questions.length}`}
        </span>
      </div>
      <div className="flex gap-1">
        {questions.map((q, i) => (
          <button
            key={q.id}
            type="button"
            aria-label={`Go to question ${i + 1}`}
            onClick={() =>
              document.getElementById(`q-${i + 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className={`h-3 flex-1 rounded-[3px] border-2 transition-colors ${blockStyle(q)}`}
          />
        ))}
      </div>
    </div>
  );
}

function ResultsScreen({
  result,
  answered,
  onTryAgain,
  isLoading,
  dashboardHref,
  s,
}: {
  s: Styles;
  result: TestResult;
  answered: number;
  onTryAgain: () => void;
  isLoading: boolean;
  dashboardHref?: string;
}) {
  const wrong = result.results.filter((r) => !r.isCorrect && r.selectedOptionId).length;
  const skipped = result.results.filter((r) => !r.selectedOptionId).length;
  const stars = starsFor(result.score, result.total);
  const percent = result.total ? Math.round((result.score / result.total) * 100) : 0;

  return (
    <section
      aria-live="polite"
      className={s.results}
    >
      <h2 className={s.resultsTitle}>Your score</h2>

      <div className="mt-5 flex items-end justify-center gap-2" aria-label={`${stars} out of 3 stars`}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-pop"
            style={{ animationDelay: `${0.2 + i * 0.15}s` }}
          >
            <PixelArt rows={i < stars ? STAR : STAR_EMPTY} size={i === 1 ? 64 : 48} />
          </span>
        ))}
      </div>

      <p className={`mt-4 ${s.bigScore}`}>
        {result.score}
        <span className="text-subtle">/{result.total}</span>
      </p>
      <p className="mt-1 text-lg font-semibold text-muted">{percent}%</p>
      <p className="mx-auto mt-3 max-w-sm font-medium text-muted">
        {scoreSummary(result.score, result.total, answered)}
      </p>

      <dl className="mt-5 flex flex-wrap justify-center gap-2 text-sm font-semibold">
        <Stat className="bg-correct-soft text-correct" label={COPY.status.correct} value={result.score} />
        <Stat className="bg-wrong-soft text-wrong" label={COPY.status.wrong} value={wrong} />
        <Stat className="bg-soft text-muted" label={COPY.status.skipped} value={skipped} />
      </dl>

      {dashboardHref && (
        <p className={`mt-5 text-sm font-semibold ${result.saveFailed ? "text-wrong" : "text-correct"}`}>
          {result.saveFailed ? COPY.app.test.notSaved : COPY.app.test.saved}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onTryAgain}
          disabled={isLoading}
          className={buttonClass()}
        >
          {isLoading ? T.loadingNew : T.tryAgain}
        </button>
        {dashboardHref && (
          <Link href={dashboardHref} className={buttonClass({ variant: "secondary" })}>
            {COPY.app.test.toDashboard}
          </Link>
        )}
      </div>
    </section>
  );
}

function Stat({ className, label, value }: { className: string; label: string; value: number }) {
  return (
    <div className={`flex gap-1.5 rounded-lg px-2.5 py-1 ${className}`}>
      <dt>{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
}

function QuestionCard({
  s,
  number,
  question,
  selectedOptionId,
  result,
  locked,
  disabled,
  onSelect,
}: {
  s: Styles;
  number: number;
  question: StudentQuestion;
  selectedOptionId: string | null;
  result: QuestionResult | undefined;
  locked: boolean;
  disabled: boolean;
  onSelect: (optionId: string) => void;
}) {
  return (
    <li
      id={`q-${number}`}
      className={s.card}
    >
      <fieldset disabled={locked || disabled}>
        <legend className="w-full">
          <span className="mb-3 flex items-center justify-between gap-3 text-xs">
            <span className="flex flex-wrap items-center gap-2">
              <span className={s.badge}>
                Q{number}
              </span>
              {question.topic && <TopicTag topic={question.topic} />}
            </span>
            {locked && <StatusPill result={result} selectedOptionId={selectedOptionId} />}
          </span>
          <span className={`mb-4 block leading-normal font-medium whitespace-pre-line ${s.questionText}`}>{question.text}</span>
        </legend>

        {question.imageUrl && (
          <Image
            src={question.imageUrl}
            alt={`Image for question ${number}`}
            width={800}
            height={500}
            sizes="(max-width: 672px) 100vw, 640px"
            className="mb-4 h-auto w-full rounded-xl border border-line bg-white"
          />
        )}

        <div className="space-y-2">
          {question.options.map((option, i) => {
            const state = optionState({
              isSelected: selectedOptionId === option.id,
              isCorrect: result?.correctOptionId === option.id,
              locked,
            });
            return (
              <label
                key={option.id}
                className={`${optionRowClass(state, !locked)} ${locked && state === "idle" ? "opacity-55" : ""}`}
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
  const pill = "animate-pop shrink-0 rounded-full px-2.5 py-1 text-xs font-bold";
  const s = COPY.status;
  if (!result) return <span className={`${pill} bg-soft text-muted`}>{s.notMarked}</span>;
  if (result.isCorrect)
    return (
      <span className={`${pill} bg-correct-soft text-correct`}>
        {s.correct}
      </span>
    );
  if (!selectedOptionId) return <span className={`${pill} bg-soft text-muted`}>{s.skipped}</span>;
  return <span className={`${pill} bg-wrong-soft text-wrong`}>{s.wrong}</span>;
}
