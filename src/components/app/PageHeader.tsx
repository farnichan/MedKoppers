import Link from "next/link";
import { Fragment } from "react";

/**
 * The bar at the top of each app page: a breadcrumb trail on the left,
 * actions on the right (desktop only). The last crumb is the current page.
 */
export default function PageHeader({
  crumbs,
  actions,
}: {
  crumbs: { label: string; href?: string }[];
  actions?: React.ReactNode;
}) {
  return (
    // On phones the top bar already has "New test", and a lone title would
    // just repeat the page heading, so the bar only shows for breadcrumbs.
    <div
      className={`h-12 items-center justify-between gap-3 border-b border-line px-5 sm:px-6 ${
        crumbs.length > 1 ? "flex" : "hidden lg:flex"
      }`}
    >
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
        {crumbs.map((c, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <span aria-hidden className="text-subtle">
                /
              </span>
            )}
            {c.href ? (
              <Link href={c.href} className="truncate text-muted hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate text-ink">
                {c.label}
              </span>
            )}
          </Fragment>
        ))}
      </nav>
      {actions && <div className="hidden shrink-0 items-center gap-2 lg:flex">{actions}</div>}
    </div>
  );
}
