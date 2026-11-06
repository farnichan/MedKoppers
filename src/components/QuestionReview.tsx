import Image from "next/image";
import { OptionContent, optionRowClass, type OptionState } from "@/components/OptionRow";
import TopicTag from "@/components/TopicTag";
import { COPY } from "@/lib/copy";
import type { QuestionResult, StudentQuestion } from "@/lib/types";

// A read-only, already-marked question, for reviewing a past test in the app.
export default function QuestionReview({
  number,
  question,
  result,
}: {
  number: number;
  /** null if the question has since been removed from the bank. */
  question: StudentQuestion | null;
  result: QuestionResult;
}) {
  return (
    <li className="rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgb(16_18_31/0.03)] sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-subtle tabular-nums">Question {number}</span>
          {question?.topic && <TopicTag topic={question.topic} />}
        </span>
        <StatusPill result={result} />
      </div>

      {question ? (
        <>
          <p className="mb-4 text-[15px] leading-snug font-semibold whitespace-pre-line sm:text-base">{question.text}</p>
          {question.imageUrl && (
            <Image
              src={question.imageUrl}
              alt={`Image for question ${number}`}
              width={800}
              height={500}
              sizes="(max-width: 768px) 100vw, 720px"
              className="mb-4 h-auto w-full rounded-lg border border-line bg-white"
            />
          )}
          <div className="space-y-2">
            {question.options.map((option, i) => {
              const state = optionState(option.id, result);
              return (
                <div
                  key={option.id}
                  className={`${optionRowClass(state, false)} ${state === "idle" ? "opacity-55" : ""}`}
                >
                  <OptionContent index={i} text={option.text} state={state} />
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted">{COPY.app.results.missingQuestion}</p>
      )}
    </li>
  );
}

function optionState(optionId: string, result: QuestionResult): OptionState {
  const isSelected = result.selectedOptionId === optionId;
  const isCorrect = result.correctOptionId === optionId;
  if (isSelected) return isCorrect ? "correct" : "wrong";
  return isCorrect ? "missed" : "idle";
}

function StatusPill({ result }: { result: QuestionResult }) {
  const pill = "flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium";
  const dot = "size-1.5 rounded-full";
  const s = COPY.status;
  if (result.isCorrect)
    return (
      <span className={`${pill} bg-correct-soft text-correct`}>
        <span aria-hidden className={`${dot} bg-correct`} />
        {s.correct}
      </span>
    );
  if (!result.selectedOptionId)
    return (
      <span className={`${pill} bg-soft text-muted ring-1 ring-line`}>
        <span aria-hidden className={`${dot} bg-subtle`} />
        {s.skipped}
      </span>
    );
  return (
    <span className={`${pill} bg-wrong-soft text-wrong`}>
      <span aria-hidden className={`${dot} bg-wrong`} />
      {s.wrong}
    </span>
  );
}
