import Link from "next/link";
import Logo from "./Logo";
import { buttonClass } from "./ui/button";

// Floating frosted-glass navbar, shown on every page.
export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-5xl items-center justify-between rounded-2xl border-2 border-ink bg-paper/60 pr-2.5 pl-3 shadow-hard backdrop-blur-xl backdrop-saturate-150"
      >
        <Link
          href="/"
          className="wiggle rounded-lg focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-teal"
        >
          <Logo />
        </Link>
        <Link href="/practice" className={buttonClass({ size: "sm" })}>
          Practice Test
        </Link>
      </nav>
    </header>
  );
}
