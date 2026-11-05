import PixelArt from "@/components/pixel/PixelArt";
import { STAR, STAR_EMPTY } from "@/components/pixel/art";
import { starsFor } from "@/lib/copy";

/** A small row of 0–3 pixel stars for a score, e.g. in lists. */
export default function Stars({ score, total, size = 16 }: { score: number; total: number; size?: number }) {
  const stars = starsFor(score, total);
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${stars} out of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <PixelArt key={i} rows={i < stars ? STAR : STAR_EMPTY} size={size} />
      ))}
    </span>
  );
}
