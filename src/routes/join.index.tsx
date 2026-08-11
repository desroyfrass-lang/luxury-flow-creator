import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { DOORS } from "@/lib/partners";

/**
 * FRASS-0456 — Two Welcome Halls, one identity.
 *
 * Founder ruling: a shopper should never be handed a business system, and a
 * builder should never have to pretend to be a shopper first. Two doors. One
 * account behind both — a shopper can walk up the Hill any day they choose.
 */
export const Route = createFileRoute("/join/")({
  head: () => ({
    meta: [
      { title: "Choose your entrance — Frass" },
      {
        name: "description",
        content:
          "Two ways into Frass: shop Frass Kicks, or build on Frass Hill with your own Frass Card, Builder Vault and Daily. One account behind both doors.",
      },
      { property: "og:title", content: "Choose your entrance — Frass" },
      {
        property: "og:description",
        content: "Shop Frass Kicks, or build on Frass Hill. One identity, two doors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JoinChooser,
});

function JoinChooser() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
            Welcome Hall
          </div>
          <h1 className="mt-4 font-display text-5xl md:text-6xl">Which door is yours?</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Both doors give you the same account. Pick the one that matches why you came today —
            you can walk through the other one whenever you're ready. Nothing gets locked behind you.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {(["frasskicks", "frass-hill"] as const).map((key) => {
            const door = DOORS[key];
            return (
              <Link
                key={key}
                to={door.to}
                className="group relative overflow-hidden rounded-sm border border-border bg-background/40 p-8 transition hover:border-[color:var(--gold)]"
              >
                <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                  {door.kicker}
                </div>
                <h2 className="mt-3 font-display text-4xl">{door.title}</h2>
                <p className="mt-4 text-sm text-foreground/85">{door.line}</p>
                <p className="mt-5 border-l border-[color:var(--gold)]/40 pl-4 text-xs leading-relaxed text-muted-foreground">
                  <span className="text-[color:var(--gold)]">What this means in plain English: </span>
                  {door.plainEnglish}
                </p>
                <div className="mt-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)]">
                  Enter <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth" className="underline hover:text-[color:var(--gold)]">
            Sign in
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
