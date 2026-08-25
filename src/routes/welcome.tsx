import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * FRASS-0466 / Legacy Route Consolidation — the First Arrival ceremony now
 * lives inside the Welcome Hall as an arrival state. This address keeps
 * working for old email links and bookmarks; it lands in one hop, carrying
 * any `next` destination with it.
 */
export const Route = createFileRoute("/welcome")({
  validateSearch: (search: Record<string, unknown>): { next?: string } =>
    typeof search["next"] === "string" && search["next"].startsWith("/")
      ? { next: search["next"] }
      : {},
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/welcome-hall",
      search: { arrival: "first" as const, ...(search.next ? { next: search.next } : {}) },
      replace: true,
    });
  },
});
