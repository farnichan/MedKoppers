import { LogOut } from "lucide-react";
import { signOut } from "@/app/(app)/actions";
import { getCurrentUser } from "@/lib/auth";
import { COPY, initialsOf } from "@/lib/copy";

/** Avatar, name, email and a Log out button. Reads the session, so render inside <Suspense>. */
export default async function UserBlock() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-xs font-semibold text-white"
      >
        {initialsOf(user.name, user.email)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name || user.email}</p>
        {user.name && <p className="truncate text-xs text-subtle">{user.email}</p>}
      </div>
      <form action={signOut}>
        <button
          type="submit"
          aria-label={COPY.home.logOut}
          title={COPY.home.logOut}
          className="grid size-8 place-items-center rounded-md text-subtle transition-colors hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
        >
          <LogOut aria-hidden size={16} strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
}

export function UserBlockSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-2 py-2">
      <span className="size-8 rounded-full bg-ink/[0.06]" />
      <span className="h-3 w-24 rounded bg-ink/[0.06]" />
    </div>
  );
}
