// Draws pixel art from a grid of letters, one letter per pixel (see
// PALETTE for the colours; "." is transparent). Rendered as a tiny SVG, so
// it stays crisp at any size and costs almost nothing to download.

export const PALETTE: Record<string, string> = {
  K: "#1b1f3b", // outline
  N: "#0c1892", // brand navy
  B: "#4255d6", // mid blue
  L: "#a9b4ff", // lavender
  l: "#d6dbff", // pale lavender
  G: "#c0ff00", // lime (logo)
  g: "#93c400", // dark lime
  h: "#e6ff9e", // pale lime
  W: "#ffffff",
  S: "#c9ced8", // grey
  s: "#9aa1b0", // dark grey
  Y: "#ffd84d", // yellow
  y: "#e0a800", // dark yellow
  O: "#ffb38a", // peach
  P: "#ffb3d1", // pink
  C: "#8fe3ff", // cyan
  T: "#c8834a", // tea
};

export default function PixelArt({
  rows,
  size,
  title,
  className = "",
}: {
  rows: readonly string[];
  /** Rendered width in pixels; height follows the grid's proportions. */
  size: number;
  /** Accessible description. Omit for purely decorative art. */
  title?: string;
  className?: string;
}) {
  const height = rows.length;
  const width = Math.max(...rows.map((r) => r.length));

  // Merge runs of same-coloured pixels in a row into one rectangle.
  const rects: React.ReactNode[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const fill = PALETTE[row[x]];
      if (!fill) {
        x++;
        continue;
      }
      let run = 1;
      while (row[x + run] === row[x]) run++;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={run} height={1} fill={fill} />);
      x += run;
    }
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={(size * height) / width}
      shapeRendering="crispEdges"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      className={className}
    >
      {title && <title>{title}</title>}
      {rects}
    </svg>
  );
}
