// Shared button styles: slim, 8px corners, with a subtle conventional bevel:
// a thin white highlight on the top inner edge, a faint darker bottom inner
// edge and a small drop shadow. Pressing removes the highlight.
const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-sans font-semibold " +
  "transition-[translate,box-shadow,filter] duration-100 active:translate-y-px " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand " +
  "disabled:pointer-events-none disabled:opacity-60";

const BEVEL =
  "shadow-[inset_0_1px_0_rgb(255_255_255/0.25),inset_0_-1px_0_rgb(0_0_0/0.15),0_1px_2px_rgb(0_0_0/0.15)] " +
  "active:shadow-[inset_0_1px_2px_rgb(0_0_0/0.2)]";

const variants = {
  primary: `bg-brand text-white hover:bg-brand-hover ${BEVEL}`,
  lime: `bg-lime text-ink hover:brightness-95 ${BEVEL}`,
  secondary:
    "bg-white text-ink ring-1 ring-ink/15 hover:bg-soft " +
    "shadow-[inset_0_-1px_0_rgb(16_18_31/0.06),0_1px_2px_rgb(16_18_31/0.08)] " +
    "active:shadow-[inset_0_1px_2px_rgb(16_18_31/0.1)]",
};

const sizes = {
  sm: "h-8 px-3.5 text-sm",
  md: "h-10 px-5 text-[15px]",
  lg: "h-11 px-6 text-base",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
} = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}
