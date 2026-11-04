import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { COPY } from "@/lib/copy";
import { buttonClass } from "./ui/button";

// Thick navy footer that plays on the logo: the footer is the logo's navy
// square, and the logo's tilted lime and black cards (with the tick) sweep
// in from the bottom-right corner.
export default function Footer() {
  const f = COPY.footer;
  return (
    <footer className="relative mt-auto overflow-hidden rounded-t-[2.5rem] bg-brand text-white">
      {/* Positioned so the tick stays fully visible; text sits clear on the left/top. */}
      <LogoCards className="pointer-events-none absolute top-[350px] -right-[6%] w-[360px] sm:top-[-132px] sm:-right-[4%] sm:w-[600px]" />

      <div className="relative mx-auto flex min-h-[650px] max-w-5xl flex-col px-6 pt-14 pb-10 sm:min-h-[440px] sm:pt-16">
        <Image
          src="/logo-mark.svg"
          alt={APP_NAME}
          width={72}
          height={72}
          unoptimized
          className="rounded-[18px] ring-2 ring-white/25"
        />
        <h2 className="font-heading mt-6 max-w-xs text-3xl font-bold tracking-[-0.01em] sm:text-4xl">
          {f.title}
        </h2>
        <p className="mt-2 max-w-xs text-white/75">{f.tagline}</p>
        <Link href="/practice" className={buttonClass({ variant: "lime", className: "mt-6 self-start" })}>
          <span aria-hidden>▶</span> {f.cta}
        </Link>
        <p className="mt-6 text-sm text-white/60 sm:mt-auto sm:pt-10">© {APP_NAME}</p>
      </div>
    </footer>
  );
}

/** The lime and black cards (and tick) from public/logo-mark.svg, unclipped. */
function LogoCards({ className }: { className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 500 500" className={className} overflow="visible">
      <rect x="84" y="75" width="500" height="400" rx="100" transform="rotate(20 84 75)" fill="#C0FF00" />
      <rect
        x="-53"
        y="353.01"
        width="500"
        height="400"
        rx="100"
        transform="rotate(-20 -53 353.01)"
        fill="#000"
      />
      <path
        d="M339.578 399.5L297.327 364.047C294.789 361.917 294.458 358.133 296.588 355.594L304.301 346.401C306.431 343.863 310.216 343.532 312.754 345.662L341.216 369.544L392.37 308.582C394.5 306.044 398.285 305.712 400.823 307.842L410.015 315.556C412.554 317.686 412.885 321.47 410.755 324.009L348.031 398.76C345.901 401.299 342.116 401.63 339.578 399.5Z"
        fill="#fff"
      />
    </svg>
  );
}
