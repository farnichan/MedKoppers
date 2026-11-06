/** A row of number tiles in one bordered panel (2 per row on phones, 4 on desktop). */
export default function StatGrid({
  stats,
}: {
  stats: { label: string; value: string; note?: string }[];
}) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white px-5 py-4">
          <dt className="text-[13px] font-medium text-muted">{s.label}</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{s.value}</dd>
          {s.note && <p className="mt-0.5 truncate text-xs text-subtle">{s.note}</p>}
        </div>
      ))}
    </dl>
  );
}
