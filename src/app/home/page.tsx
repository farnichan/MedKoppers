import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "./actions";
import { buttonClass } from "@/components/ui/button";
import { COPY, welcomeMessage } from "@/lib/copy";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Home",
};

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pt-28 pb-20">
      <Suspense fallback={<p className="font-medium text-muted">{COPY.home.loading}</p>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}

// Reads the session, so it has to sit behind the <Suspense> boundary above
// (see "Authentication with Cache Components" in the Next.js docs).
async function HomeContent() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="font-heading text-2xl font-bold tracking-[-0.01em]">{welcomeMessage(user.name)}</h1>
      <form action={signOut}>
        <button type="submit" className={buttonClass({ variant: "secondary", size: "sm" })}>
          {COPY.home.logOut}
        </button>
      </form>
    </div>
  );
}
