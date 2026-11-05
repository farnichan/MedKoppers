import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import Logo from "@/components/Logo";
import { buttonClass } from "@/components/ui/button";
import { COPY } from "@/lib/copy";
import NavLinks, { NavLinksFallback } from "./NavLinks";
import SubjectsList from "./SubjectsList";
import UserBlock, { UserBlockSkeleton } from "./UserBlock";

/** Desktop sidebar (large screens only). Phones get MobileTopBar instead. */
export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col px-3 py-4 lg:flex">
      <Link
        href="/home"
        className="self-start rounded-md px-2 py-1 focus-visible:outline-2 focus-visible:outline-brand"
      >
        <Logo height={22} />
      </Link>

      <Link href="/test" className={buttonClass({ size: "sm", className: "mt-5 w-full" })}>
        <Plus aria-hidden size={16} strokeWidth={2} />
        {COPY.app.nav.newTest}
      </Link>

      <div className="mt-5">
        <Suspense fallback={<NavLinksFallback />}>
          <NavLinks />
        </Suspense>
      </div>
      <div className="mt-7">
        <SubjectsList />
      </div>

      <div className="mt-auto border-t border-line pt-3">
        <Suspense fallback={<UserBlockSkeleton />}>
          <UserBlock />
        </Suspense>
      </div>
    </aside>
  );
}
