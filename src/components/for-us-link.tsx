import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * FRASS-0921 — the permanent "For Us" navigation item.
 * Always carries where the member came from, so Back returns them exactly there.
 */
export function ForUsLink({
  className,
  activeClassName,
  children = "For Us",
}: {
  className?: string;
  activeClassName?: string;
  children?: ReactNode;
}) {
  const from = useRouterState({
    select: (r) => r.location.pathname + r.location.searchStr,
  });
  return (
    <Link
      to="/for-us"
      search={{ from: from.startsWith("/for-us") ? "" : from } as never}
      className={className}
      activeProps={activeClassName ? { className: activeClassName } : undefined}
    >
      {children}
    </Link>
  );
}
