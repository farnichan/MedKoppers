"use client";

import { History, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COPY } from "@/lib/copy";

const ITEMS = [
  { href: "/home", label: COPY.app.nav.dashboard, icon: LayoutDashboard },
  { href: "/history", label: COPY.app.nav.history, icon: History },
];

function isActive(href: string, pathname: string) {
  if (href === "/history") return pathname === "/history" || pathname.startsWith("/results/");
  return pathname === href;
}

/**
 * The app's main navigation links, highlighting the current page. Reading the
 * current address needs a <Suspense> boundary on dynamic pages, so wrap it in
 * one with <NavLinksFallback /> (same links, nothing highlighted).
 */
export default function NavLinks() {
  return <NavList pathname={usePathname()} />;
}

export function NavLinksFallback() {
  return <NavList pathname="" />;
}

function NavList({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Main" className="space-y-0.5">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex h-8 items-center gap-2.5 rounded-md px-2 text-sm font-medium transition-colors ${
              active
                ? "bg-white text-ink shadow-[0_1px_2px_rgb(16_18_31/0.06)] ring-1 ring-line"
                : "text-muted hover:bg-ink/[0.04] hover:text-ink"
            }`}
          >
            <Icon aria-hidden size={16} strokeWidth={1.75} className={active ? "text-brand" : ""} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
