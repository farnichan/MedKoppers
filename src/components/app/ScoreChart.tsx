import Link from "next/link";
import type { AttemptSummary } from "@/lib/attempts";
import { formatTestDate, percentOf, testLabel } from "@/lib/copy";

const TICKS = [100, 50, 0];

/**
 * Column chart of recent test scores (%), oldest on the left. One series, so
 * no legend: the card title says what's plotted. Each column links to that
 * test's review and shows a tooltip on hover/focus. The tests table on the
 * same page is the table view of this data.
 */
export default function ScoreChart({ attempts }: { attempts: AttemptSummary[] }) {
  const ordered = [...attempts].reverse();
  return (
    <div className="flex gap-2">
      {/* Y axis */}
      <div aria-hidden className="relative h-40 w-8 shrink-0 text-right text-[11px] text-subtle tabular-nums">
        {TICKS.map((t) => (
          <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - t}%` }}>
            {t}%
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative h-40">
          {/* Gridlines: hairline, solid, recessive. */}
          {TICKS.map((t) => (
            <div
              key={t}
              aria-hidden
              className={`absolute inset-x-0 h-px ${t === 0 ? "bg-line" : "bg-line/70"}`}
              style={{ top: `${100 - t}%` }}
            />
          ))}

          <ol className="absolute inset-0 flex items-end gap-0.5">
            {ordered.map((a) => {
              const pct = percentOf(a.score, a.total);
              return (
                <li key={a.id} className="relative flex h-full flex-1 justify-center">
                  <Link
                    href={`/results/${a.id}`}
                    aria-label={`${testLabel(a.number)}: ${pct}%, ${formatTestDate(a.createdAt)}`}
                    className="group flex h-full w-full items-end justify-center rounded-md outline-none hover:bg-ink/[0.03] focus-visible:bg-ink/[0.04]"
                  >
                    <span
                      className={`w-full max-w-6 rounded-t-[4px] transition-colors group-hover:bg-brand-hover ${
                        pct === 0 ? "h-0.5 bg-subtle/50" : "bg-brand"
                      }`}
                      style={pct === 0 ? undefined : { height: `${pct}%` }}
                    />
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-left text-xs whitespace-nowrap text-white shadow-lg group-hover:block group-focus-visible:block"
                    >
                      <span className="font-semibold tabular-nums">
                        {testLabel(a.number)} · {pct}%
                      </span>
                      <span className="block text-white/70">{formatTestDate(a.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>

        {/* X axis */}
        <ol aria-hidden className="mt-1.5 flex gap-0.5 text-[11px] text-subtle tabular-nums">
          {ordered.map((a) => (
            <li key={a.id} className="flex-1 truncate text-center">
              #{a.number}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
