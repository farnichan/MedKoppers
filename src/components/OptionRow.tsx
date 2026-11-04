// Visual pieces for one answer option, shared by the test page and the
// landing page preview so they always look the same.

export type OptionState = "idle" | "selected" | "correct" | "wrong" | "missed";

export const LETTERS = "ABCDEFGHIJ";

const rowStyles: Record<OptionState, string> = {
  idle: "border-line bg-white hover:border-subtle/60 hover:bg-soft",
  selected: "border-brand bg-brand-soft shadow-[0_0_0_1px_var(--color-brand)]",
  correct: "border-correct bg-correct-soft shadow-[0_0_0_1px_var(--color-correct)]",
  wrong: "border-wrong bg-wrong-soft shadow-[0_0_0_1px_var(--color-wrong)]",
  missed: "border-correct border-dashed bg-correct-soft/60",
};

const chipStyles: Record<OptionState, string> = {
  idle: "border-line bg-soft text-muted",
  selected: "border-brand bg-brand text-white",
  correct: "border-correct bg-correct text-white",
  wrong: "border-wrong bg-wrong text-white",
  missed: "border-correct bg-white text-correct",
};

const tags: Partial<Record<OptionState, { text: string; className: string }>> = {
  correct: { text: "Your answer", className: "text-correct" },
  wrong: { text: "Your answer", className: "text-wrong" },
  missed: { text: "Correct answer", className: "text-correct" },
};

export function optionRowClass(state: OptionState, interactive: boolean) {
  return (
    // "relative" keeps the visually hidden radio inside the row, so tapping
    // an option doesn't make the page jump.
    "relative flex items-start gap-3 rounded-xl border px-3.5 py-3 text-[15px] leading-snug transition-colors " +
    (interactive ? "cursor-pointer " : "") +
    "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-brand " +
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
        className={`grid size-6 shrink-0 place-items-center rounded-md border text-xs font-bold transition-colors ${chipStyles[state]}`}
      >
        {LETTERS[index]}
      </span>
      <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 pt-0.5">
        <span>{text}</span>
        {tag && <span className={`text-xs font-medium ${tag.className}`}>{tag.text}</span>}
      </span>
    </>
  );
}
