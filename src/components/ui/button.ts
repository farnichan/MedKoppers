// Shared chunky "sticker" button styles. They lift on hover and squish
// down when pressed.
const base =
  "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink font-bold " +
  "shadow-hard transition-[translate,box-shadow,background-color] duration-100 " +
  "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg " +
  "active:translate-x-1 active:translate-y-1 active:shadow-none " +
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal " +
  "disabled:pointer-events-none disabled:opacity-60";

const variants = {
  primary: "bg-pink text-ink",
  yellow: "bg-yellow text-ink",
  plain: "bg-paper text-ink",
};

const sizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-base",
  lg: "h-14 px-7 text-lg",
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
