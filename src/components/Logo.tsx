import Image from "next/image";
import { APP_NAME } from "@/lib/config";

// The full logo (symbol + wordmark) from public/logo.svg.
// To change it, replace that file (and public/logo-mark.svg for the symbol).
export default function Logo({ height = 28 }: { height?: number }) {
  return (
    <Image
      src="/logo.svg"
      alt={APP_NAME}
      width={Math.round((height * 2508) / 500)}
      height={height}
      priority
      unoptimized
    />
  );
}
