const base =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] font-medium text-ink " +
  "placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 " +
  "disabled:pointer-events-none disabled:opacity-60";

export function inputClass(className = "") {
  return `${base} ${className}`;
}
