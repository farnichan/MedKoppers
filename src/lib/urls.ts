// The public site (landing page + demo test) and the app (sign up, log in,
// everything for logged-in students) live on different addresses in
// production, e.g. medkoppers.com and app.medkoppers.com. Both are served by
// this one project; src/proxy.ts sends each page to the right address.
//
// Set both env vars to switch this on. When they're unset (local development)
// everything stays on one address, e.g. localhost:3000.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

/** Pages that belong to the app address. Everything else belongs to the public site. */
const APP_PATHS = ["/login", "/signup", "/forgot-password", "/home", "/test", "/results", "/history", "/lectures"];

export function isAppPath(pathname: string) {
  return APP_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Link to an app page, e.g. appUrl("/signup"). */
export function appUrl(path: string) {
  return `${APP_URL}${path}`;
}

/** Link to a public-site page, e.g. siteUrl("/practice"). */
export function siteUrl(path: string) {
  return `${SITE_URL}${path}`;
}

/**
 * `host` is the address the browser asked for (the Host header).
 * If this request is on the wrong address, returns where it should go
 * instead; otherwise null. Only active when both addresses are configured.
 */
export function addressRedirect(host: string | null, url: URL): string | null {
  if (!SITE_URL || !APP_URL || !host) return null;
  const { pathname, search } = url;

  if (host === new URL(APP_URL).host) {
    if (pathname === "/") return `${APP_URL}/home`;
    if (!isAppPath(pathname)) return `${SITE_URL}${pathname}${search}`;
  }
  if (host === new URL(SITE_URL).host && isAppPath(pathname)) {
    return `${APP_URL}${pathname}${search}`;
  }
  return null;
}
