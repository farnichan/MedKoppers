import PixelArt from "@/components/pixel/PixelArt";
import { BOLD_CAPSULE, capsule } from "@/components/pixel/art";
import { COPY } from "@/lib/copy";

// Pieces shared by the public demo test (/practice) and the signed-in test (/test).

const PILL = capsule(14, BOLD_CAPSULE);

export function TestHeader() {
  return (
    <header className="mb-8 flex items-center gap-4 px-1">
      <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-tint-blue">
        <PixelArt rows={PILL} size={44} />
      </span>
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-[-0.01em] sm:text-4xl">
          {COPY.practice.title}
        </h1>
        <p className="mt-1 font-medium text-muted">{COPY.practice.subtitle}</p>
      </div>
    </header>
  );
}

export function NoQuestions() {
  return (
    <p className="rounded-2xl border border-line bg-soft p-6 text-muted">{COPY.practice.empty}</p>
  );
}

export function QuestionsSkeleton() {
  return (
    <div aria-busy aria-label={COPY.practice.loading} className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-line bg-white p-5">
          <div className="mb-3 h-3 w-28 rounded bg-soft" />
          <div className="mb-5 h-4 w-4/5 rounded bg-soft" />
          <div className="space-y-2">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="h-12 rounded-xl border border-line" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
