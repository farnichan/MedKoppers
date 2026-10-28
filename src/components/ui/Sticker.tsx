// A small tilted label, like a sticker slapped on a notebook.
const colors = {
  yellow: "bg-yellow",
  pink: "bg-pink",
  teal: "bg-teal",
  sky: "bg-sky",
  orange: "bg-orange",
  paper: "bg-paper",
};

export default function Sticker({
  children,
  color = "yellow",
  tilt = -3,
  className = "",
}: {
  children: React.ReactNode;
  color?: keyof typeof colors;
  tilt?: number;
  className?: string;
}) {
  return (
    <span
      style={{ rotate: `${tilt}deg` }}
      className={`inline-block rounded-lg border-2 border-ink px-3 py-1 text-sm font-bold whitespace-nowrap shadow-hard-sm ${colors[color]} ${className}`}
    >
      {children}
    </span>
  );
}
