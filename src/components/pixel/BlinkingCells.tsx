"use client";

import { useEffect, useRef, useState } from "react";

const TINTS = ["bg-tint-blue", "bg-tint-lime", "bg-tint-peach", "bg-tint-pink", "bg-tint-cyan", "bg-lime/50"];
const CELL = 32; // must match .graph-paper background-size
const LIFETIME_MS = 2600; // must match --animate-blink duration

type Cell = { id: number; col: number; row: number; tint: string };

/**
 * Pastel squares that light up in random cells of the graph-paper grid,
 * then fade away. Cells overlapping any `keepOutIds` element (e.g. the
 * headline) are skipped so content stays readable. Does nothing if the visitor prefers
 * reduced motion.
 */
export default function BlinkingCells({
  keepOutIds = [],
  everyMs = 280,
}: {
  /** ids of elements whose areas should stay clear. */
  keepOutIds?: string[];
  everyMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [cells, setCells] = useState<Cell[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let nextId = 0;

    const timer = setInterval(() => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      const keepOuts = keepOutIds
        .map((id) => document.getElementById(id)?.getBoundingClientRect())
        .filter((r): r is DOMRect => !!r);
      const cols = Math.floor(box.width / CELL);
      const rows = Math.floor(box.height / CELL);

      for (let attempt = 0; attempt < 8; attempt++) {
        const col = Math.floor(Math.random() * cols);
        const row = Math.floor(Math.random() * rows);
        const x = box.left + col * CELL;
        const y = box.top + row * CELL;
        const blocked = keepOuts.some(
          (k) => x + CELL > k.left - 8 && x < k.right + 8 && y + CELL > k.top - 8 && y < k.bottom + 8,
        );
        if (blocked) continue;

        const cell = { id: nextId++, col, row, tint: TINTS[Math.floor(Math.random() * TINTS.length)] };
        setCells((prev) => [...prev, cell]);
        setTimeout(() => setCells((prev) => prev.filter((c) => c.id !== cell.id)), LIFETIME_MS);
        break;
      }
    }, everyMs);

    return () => clearInterval(timer);
    // keepOutIds is compared by value so a new array each render is fine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keepOutIds.join(","), everyMs]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0">
      {cells.map((c) => (
        <span
          key={c.id}
          className={`animate-blink absolute size-[31px] ${c.tint}`}
          style={{ left: c.col * CELL + 1, top: c.row * CELL + 1 }}
        />
      ))}
    </div>
  );
}
