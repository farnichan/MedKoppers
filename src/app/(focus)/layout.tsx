import { X } from "lucide-react";
import Link from "next/link";
import { COPY } from "@/lib/copy";

// Focus mode for taking a test: no sidebar, just a slim bar with Exit.
export default function FocusLayout({ children }: { children: React.ReactNode }) {
  const t = COPY.app.test;
  return (
    <div className="min-h-svh bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-5">
          <Link
            href="/home"
            className="-ml-2 flex h-8 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
          >
            <X aria-hidden size={16} />
            {t.exit}
          </Link>
          <span aria-hidden className="h-4 w-px bg-line" />
          <span className="truncate text-sm font-semibold">{t.title}</span>
        </div>
      </header>
      {children}
    </div>
  );
}
