import { Suspense } from "react";
import MobileTopBar from "@/components/app/MobileTopBar";
import Sidebar from "@/components/app/Sidebar";
import SubjectsList from "@/components/app/SubjectsList";
import UserBlock, { UserBlockSkeleton } from "@/components/app/UserBlock";

// Signed-in pages (dashboard, history, results): a product-style shell, not
// the marketing site's look. Sidebar on large screens with the page on a
// white panel; a top bar with a menu on phones. Each page checks the session
// itself (see src/lib/auth.ts).
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-white lg:bg-canvas lg:pl-60">
      <Sidebar />
      <MobileTopBar
        subjects={<SubjectsList />}
        account={
          <Suspense fallback={<UserBlockSkeleton />}>
            <UserBlock />
          </Suspense>
        }
      />
      <div className="lg:py-2 lg:pr-2">
        <div className="min-h-[calc(100svh-3.5rem)] bg-white lg:min-h-[calc(100svh-1rem)] lg:rounded-xl lg:border lg:border-line lg:shadow-[0_1px_3px_rgb(16_18_31/0.04)]">
          {children}
        </div>
      </div>
    </div>
  );
}
