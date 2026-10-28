// Visual pieces for one answer option, shared by the test page and the
// landing page preview so they always look the same.

export type OptionState = "idle" | "selected" | "correct" | "wrong" | "missed";

export const LETTERS = "ABCDEFGHIJ";

const rowStyles: Record<OptionState, string> = {
  idle: "bg-paper hover:bg-cream",
  selected: "bg-yellow shadow-hard-sm -translate-x-px -translate-y-px",
  correct: "bg-correct-soft shadow-hard-sm",
  wrong: "bg-wrong-soft shadow-hard-sm",
  missed: "bg-correct-soft/70 border-dashed",
};

const chipStyles: Record<OptionState, string> = {
  idle: "bg-cream",
  selected: "bg-ink text-yellow",
  correct: "bg-correct text-paper",
  wrong: "bg-wrong text-paper",
  missed: "bg-paper text-correct",
};

const tags: Partial<Record<OptionState, { text: string; className: string }>> = {
  correct: { text: "Your answer ✓", className: "bg-correct text-paper" },
  wrong: { text: "Your answer ✗", className: "bg-wrong text-paper" },
  missed: { text: "Correct answer", className: "bg-paper text-correct" },
};

export function optionRowClass(state: OptionState, interactive: boolean) {
  return (
    // "relative" keeps the visually hidden radio inside the row, so tapping
    // an option doesn't make the page jump.
    "relative flex items-start gap-3 rounded-xl border-2 border-ink px-3 py-3 text-[15px] leading-snug font-medium " +
    "transition-[translate,box-shadow,background-color] duration-100 " +
    (interactive ? "cursor-pointer active:translate-0 active:shadow-none " : "") +
    "has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-teal " +
    rowStyles[state]
  );
}

export function OptionContent({
  index,
  text,
  state,
}: {
  index: number;
  text: string;
  state: OptionState;
}) {
  const tag = tags[state];
  return (
    <>
      <span
        aria-hidden
        className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 border-ink text-sm font-extrabold transition-colors ${chipStyles[state]}`}
      >
        {LETTERS[index]}
      </span>
      <span className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-0.5">
        <span>{text}</span>
        {tag && (
          <span
            className={`rounded-md border-2 border-ink px-1.5 py-0.5 text-xs font-bold whitespace-nowrap ${tag.className}`}
          >
            {tag.text}
          </span>
        )}
      </span>
    </>
  );
}
