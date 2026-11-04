// Pixel art drawings. Each string is one row; each letter one pixel
// (colours in PixelArt.tsx PALETTE, "." = transparent).

export const ANSWER_SHEET = [
  ".KKKKKKKK...",
  ".KWWWWWWKK..",
  ".KWWWWWWKWK.",
  ".KWNNNNWKKK.",
  ".KWWWWWWWWK.",
  ".KWLLLLLLWK.",
  ".KWWWWWWWWK.",
  ".KWLLLLWWWK.",
  ".KWWWWWWGWK.",
  ".KWLLLWWGGK.",
  ".KWWWWWWWWK.",
  ".KKKKKKKKKK.",
] as const;

export const LIGHTNING = [
  "......KKKK..",
  ".....KYYYK..",
  "....KYYYK...",
  "...KYYYK....",
  "..KYYYYKKK..",
  ".KYYYYYYYK..",
  ".KKKKYYyK...",
  "....KYyK....",
  "...KYyK.....",
  "...KyK......",
  "..KyK.......",
  "..KK........",
] as const;

export const PHONE = [
  "..KKKKKKKK..",
  "..KNNNNNNK..",
  "..KNLLLLNK..",
  "..KNLWlLNK..",
  "..KNlLLLNK..",
  "..KNLLLlNK..",
  "..KNLlLLNK..",
  "..KNLLLLNK..",
  "..KNNNNNNK..",
  "..KNNGGNNK..",
  "..KKKKKKKK..",
  "............",
] as const;

export const TROPHY = [
  "..KKKKKKKK..",
  "KKKYYWYYyKKK",
  "KYKYWYYYyKYK",
  "KYKYYYYYyKYK",
  ".KKYYYYYyKK.",
  "..KYYYYYyK..",
  "...KYYYyK...",
  "....KyyK....",
  "....KYyK....",
  "...KKKKKK...",
  "..KNNNNNNK..",
  "..KKKKKKKK..",
] as const;

export const STAR = [
  ".....KK.....",
  "....KYYK....",
  "....KYYK....",
  ".KKKYYYYKKK.",
  ".KYYYWYYYyK.",
  "..KYYYYYyK..",
  "...KYYYyK...",
  "..KYYYYYyK..",
  "..KYYKKYyK..",
  ".KYKK..KKyK.",
  ".KK......KK.",
  "............",
] as const;

export const TEA = [
  "...S..S.....",
  "....S..S....",
  "...S..S.....",
  "............",
  "KKKKKKKKK...",
  "KWWWWWWWKKK.",
  "KWTTTTTTWK.K",
  "KWTTTTTTWK.K",
  "KWWWWWWWKKK.",
  ".KWWWWWK....",
  "..KKKKK.....",
  "KKKKKKKKKK..",
] as const;

/**
 * A diagonal pill capsule, generated so it can be drawn at any pixel
 * resolution. Soft colours by default, for the hero background.
 */
export function capsule(
  n = 28,
  colors = { outline: "L", topLight: "h", top: "G", topShade: "g", bottomLight: "l", bottom: "L", bottomShade: "B", shine: "W" },
): string[] {
  const ax = n * 0.27, ay = n * 0.73, bx = n * 0.73, by = n * 0.27, r = n * 0.2;
  const vx = bx - ax, vy = by - ay;
  const len2 = vx * vx + vy * vy;
  const len = Math.sqrt(len2);
  const rows: string[] = [];
  for (let y = 0; y < n; y++) {
    let row = "";
    for (let x = 0; x < n; x++) {
      const px = x + 0.5, py = y + 0.5;
      const t = Math.min(1, Math.max(0, ((px - ax) * vx + (py - ay) * vy) / len2));
      const cx = ax + t * vx, cy = ay + t * vy;
      const d = Math.hypot(px - cx, py - cy);
      if (d > r) { row += "."; continue; }
      if (d > r - 1.1 || Math.abs(t - 0.5) * len < 0.6) { row += colors.outline; continue; }
      // How far towards the upper-left edge (lit side) this pixel is.
      const lit = ((px - cx) * -0.707 + (py - cy) * -0.707) / r;
      const top = t > 0.5;
      if (lit > 0.5 && t > 0.25 && t < 0.75) row += colors.shine;
      else if (lit > 0.2) row += top ? colors.topLight : colors.bottomLight;
      else if (lit < -0.4) row += top ? colors.topShade : colors.bottomShade;
      else row += top ? colors.top : colors.bottom;
    }
    rows.push(row);
  }
  return rows;
}

/** Colours for a bold (outlined, navy + lime) capsule. */
export const BOLD_CAPSULE = {
  outline: "K",
  topLight: "h",
  top: "G",
  topShade: "g",
  bottomLight: "L",
  bottom: "B",
  bottomShade: "N",
  shine: "W",
};

/** Four-point twinkle. */
export const SPARKLE = [
  "..K..",
  "..K..",
  "KKWKK",
  "..K..",
  "..K..",
] as const;

/** Lime twinkle, for variety. */
export const SPARKLE_LIME = SPARKLE.map((r) => r.replace(/K/g, "G")) as readonly string[];

/** Soft pixel shadow that sits under floating art. */
export const FLOAT_SHADOW = [
  "...SSSSSSSSSS...",
  ".SSSSSSSSSSSSSS.",
  "...SSSSSSSSSS...",
] as const;

/** A greyed-out star, for stars not earned on the results screen. */
export const STAR_EMPTY = STAR.map((r) => r.replace(/[YyW]/g, "S").replace(/K/g, "s")) as readonly string[];
