import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { AGREEMENTS, AGREEMENT_RULE, FRASS_PROMISE } from "@/lib/legal/agreements";

export const Route = createFileRoute("/legal/")({
  head: () => ({
    meta: [
      { title: "Agreements, Privacy & Security — Frass" },
      {
        name: "description",
        content:
          "The two agreements that govern Frass: the FrassKicks Visitor Agreement for shoppers, and the Frass Hill Builder Agreement for Builders and Partners. everyday language first.",
      },
      { property: "og:title", content: "Agreements, Privacy & Security — Frass" },
      { property: "og:description", content: "Plain-English privacy, security and community agreements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LegalIndex,
});

function LegalIndex() {
  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Trust begins before the first step</p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.06em]">Agreements, privacy & security</h1>
        <p className="mt-4 rounded-3xl border border-[color:var(--gold,#d4af37)]/30 bg-[color:var(--gold,#d4af37)]/[0.05] p-5 text-sm leading-relaxed">
          {FRASS_PROMISE}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">{AGREEMENT_RULE}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Object.values(AGREEMENTS).map((a) => (
            <Link
              key={a.level}
              to={a.href}
              className="rounded-3xl border border-white/12 bg-white/[0.03] p-5 hover:border-[color:var(--gold,#d4af37)]/50"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">v{a.version}</p>
              <h2 className="mt-1 font-display text-lg uppercase tracking-[0.05em]">{a.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{a.who}</p>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
