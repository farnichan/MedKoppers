import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { AttemptSummary } from "@/lib/attempts";
import { COPY, formatTestDate, percentOf, testLabel } from "@/lib/copy";

const COLS = "grid-cols-[1fr_auto_3rem_1rem] sm:grid-cols-[1fr_11rem_4rem_9rem_1rem]";

/** A list of tests: name, date, score and an accuracy meter. Each row opens the review. */
export default function TestsTable({ attempts }: { attempts: AttemptSummary[] }) {
  const t = COPY.app.table;
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div
        className={`hidden h-9 items-center gap-4 border-b border-line bg-soft px-5 text-xs font-medium text-subtle sm:grid ${COLS}`}
      >
        <span>{t.test}</span>
        <span>{t.date}</span>
        <span className="text-right">{t.score}</span>
        <span>{t.accuracy}</span>
        <span />
      </div>
      <ul className="divide-y divide-line">
        {attempts.map((a) => {
          const pct = percentOf(a.score, a.total);
          return (
            <li key={a.id}>
              <Link
                href={`/results/${a.id}`}
                className={`grid min-h-12 items-center gap-4 px-5 py-3 text-sm transition-colors hover:bg-soft focus-visible:bg-soft focus-visible:outline-none ${COLS}`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{testLabel(a.number)}</span>
                  <span className="block truncate text-xs text-subtle sm:hidden">
                    {formatTestDate(a.createdAt)}
                  </span>
                </span>
                <span className="hidden truncate text-muted sm:block">{formatTestDate(a.createdAt)}</span>
                <span className="text-right font-medium tabular-nums">
                  {a.score}
                  <span className="text-subtle">/{a.total}</span>
                </span>
                <span className="flex items-center gap-2.5">
                  <span aria-hidden className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.07] sm:block">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="w-9 text-right text-muted tabular-nums">{pct}%</span>
                </span>
                <ChevronRight aria-hidden size={16} className="text-subtle" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
