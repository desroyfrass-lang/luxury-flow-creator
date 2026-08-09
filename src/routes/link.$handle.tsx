import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { getPublicCard, recordCardEvent } from "@/lib/card.functions";
import { rememberRef, linkLabel, type LinkSource } from "@/lib/frass-link";

/**
 * FRASS-0428 — the permanent Frass Link.
 * Arriving here does two things at once: it remembers who introduced you (the
 * Human Link) and how you arrived (the Digital Link), then opens the member's
 * Living Business Card.
 */
export const Route = createFileRoute("/link/$handle")({
  loader: async ({ params }) => {
    const handle = params.handle.replace(/^@/, "").toLowerCase();
    const data = await getPublicCard({ data: { handle } });
    return { handle, exists: Boolean(data), name: data?.profile.display_name ?? handle };
  },
  head: ({ loaderData }) => {
    const title = `${loaderData?.name ?? "A Frass member"} — Frass Link`;
    const description =
      "One permanent Frass Link: business card, storefront, story and introduction, all at one address.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: FrassLinkArrival,
});

function FrassLinkArrival() {
  const { handle, exists, name } = Route.useLoaderData();
  const navigate = Route.useNavigate();

  useEffect(() => {
    if (!exists) return;
    const params = new URLSearchParams(window.location.search);
    const source = (params.get("s") as LinkSource) ?? (params.has("qr") ? "qr" : "link");
    rememberRef({ handle, source, path: window.location.pathname, at: Date.now() });
    void recordCardEvent({
      data: { handle, kind: source === "qr" ? "qr_scan" : "view", detail: "frass-link" },
    }).catch(() => {});
    const t = window.setTimeout(() => {
      void navigate({ to: "/card/$handle", params: { handle }, replace: true });
    }, 900);
    return () => window.clearTimeout(t);
  }, [handle, exists, navigate]);

  if (!exists) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tight">No one lives at this link yet</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Frass Links are permanent — this one has not been claimed.
        </p>
        <Link to="/" className="daily-enter mt-6 inline-flex">
          Enter Frass
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">You were introduced by</p>
      <h1 className="mt-3 text-3xl font-black uppercase tracking-tight">{name}</h1>
      <code className="mt-3 text-xs text-muted-foreground">{linkLabel(handle)}</code>
      <p className="mt-6 text-sm text-muted-foreground">Opening their Frass Card…</p>
    </main>
  );
}
