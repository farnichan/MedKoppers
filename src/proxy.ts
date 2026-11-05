import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { addressRedirect, isAppPath } from "@/lib/urls";

// Next.js 16 renamed "middleware" to "proxy" (same mechanism, new name).
// It does two things:
// 1. Sends pages to the right address (public site vs app, see src/lib/urls.ts).
// 2. Keeps Supabase sessions refreshed on app pages. Actual access control
//    happens in each page/action, close to the data (see src/lib/auth.ts).
export function proxy(request: NextRequest) {
  const redirectTo = addressRedirect(request.headers.get("host"), request.nextUrl);
  if (redirectTo) return NextResponse.redirect(redirectTo);

  // Public pages don't use accounts, so skip the session check there.
  if (!isAppPath(request.nextUrl.pathname)) return NextResponse.next();
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
