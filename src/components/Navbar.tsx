import Link from "next/link";
import { COPY } from "@/lib/copy";
import Logo from "./Logo";
import { buttonClass } from "./ui/button";

// Floating, rounded, frosted-glass navbar, shown on every page. It's fixed
// (doesn't take up space), so pages need top padding to clear it (~7rem).
export default function Navbar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4">
      <nav
        aria-label="Main"
        className="pointer-events-auto mx-auto flex h-16 max-w-5xl items-center justify-between rounded-2xl border-2 border-line bg-white/60 pr-3 pl-4 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_10px_30px_-10px_rgb(12_24_146/0.25)] backdrop-blur-xl backdrop-saturate-150"
      >
        <Link
          href="/"
          className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <Logo />
        </Link>
        <Link href="/practice" className={buttonClass({ size: "sm" })}>
          {COPY.nav.cta}
        </Link>
      </nav>
    </header>
  );
}
