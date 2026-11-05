"use client";

import { Menu, Plus, X } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import Logo from "@/components/Logo";
import { buttonClass } from "@/components/ui/button";
import { COPY } from "@/lib/copy";
import NavLinks, { NavLinksFallback } from "./NavLinks";

/**
 * Top bar for phones and tablets (the sidebar takes over on large screens).
 * The menu holds the nav links, subjects and account; tapping any link in it
 * closes it.
 */
export default function MobileTopBar({
  subjects,
  account,
}: {
  subjects: React.ReactNode;
  account: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const t = COPY.app.nav;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-xl lg:hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <Link href="/home" onClick={() => setOpen(false)} className="rounded-md focus-visible:outline-2 focus-visible:outline-brand">
          <Logo height={22} />
        </Link>
        <div className="flex items-center gap-1.5">
          <Link href="/test" onClick={() => setOpen(false)} className={buttonClass({ size: "sm" })}>
            <Plus aria-hidden size={16} strokeWidth={2} />
            {t.newTest}
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="app-menu"
            aria-label={open ? t.closeMenu : t.menu}
            onClick={() => setOpen(!open)}
            className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
          >
            {open ? <X aria-hidden size={18} /> : <Menu aria-hidden size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="app-menu"
          className="space-y-5 border-t border-line bg-canvas px-3 pt-3 pb-4"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          <Suspense fallback={<NavLinksFallback />}>
            <NavLinks />
          </Suspense>
          {subjects}
          <div className="border-t border-line pt-2">{account}</div>
        </div>
      )}
    </header>
  );
}
