import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { COLLAB_ROUNDS, TRY_ON_WORKFLOW } from "@/lib/bridal";
import { useBridalVault } from "@/hooks/use-bridal-vault";

export const Route = createFileRoute("/bridal/collections")({
  head: () => ({
    meta: [
      { title: "Dress Collaboration — Frass Bridal" },
      {
        name: "description",
        content:
          "Save forty dresses, send one secure link, let the wedding party try on virtually, vote and narrow to the final one. Every round stays saved.",
      },
      { property: "og:title", content: "Dress Collaboration — Frass Bridal" },
      {
        property: "og:description",
        content: "Virtual try-on, voting and elimination rounds for the whole wedding party.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const { vault, update } = useBridalVault();
  const [copied, setCopied] = useState(false);

  const shareLink = () => {
    const url = `${window.location.origin}/bridal/collections?invite=${Math.random().toString(36).slice(2, 10)}`;
    navigator.clipboard?.writeText(url).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <SiteShell>
      <div className="min-h-screen bg-[oklch(0.14_0.01_75)] px-6 py-12 text-[oklch(0.96_0.01_80)]">
        <div className="mx-auto max-w-[1100px]">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--hill-gold)]">
            Frass Bridal · the fitting rooms
          </span>
          <h1 className="mt-3 font-display text-3xl uppercase md:text-5xl">Dress Collaboration</h1>
          <p className="mt-3 max-w-2xl text-sm text-[oklch(0.8_0.01_80)]">
            Save the dresses you love. Send one secure link. Everyone tries on virtually, votes and
            comments — and you narrow down together. Nothing is ever lost between rounds.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-5">
              <div className="text-[10px] uppercase tracking-[0.24em] text-[oklch(0.66_0.01_80)]">
                Dresses saved
              </div>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => update({ saved: Math.max(0, vault.saved - 1) })}
                  className="h-9 w-9 rounded-full border border-white/20 text-lg leading-none"
                  aria-label="Remove a saved dress"
                >
                  −
                </button>
                <span className="font-display text-4xl">{vault.saved}</span>
                <button
                  type="button"
                  onClick={() => update({ saved: vault.saved + 1 })}
                  className="h-9 w-9 rounded-full border border-white/20 text-lg leading-none"
                  aria-label="Save another dress"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={shareLink}
                className="mt-5 rounded-full bg-[color:var(--hill-gold)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-black"
              >
                {copied ? "Link copied" : "Send the secure link"}
              </button>
              <p className="mt-2 text-xs text-[oklch(0.62_0.01_80)]">
                Bridesmaids, groomsmen, parents — anyone you invite, in any country.
              </p>
            </div>

            <div className="rounded-2xl border border-[color:var(--hill-gold)]/25 bg-white/[0.03] p-5">
              <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--hill-gold)]">
                Narrowing rounds
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {COLLAB_ROUNDS.map((n, i) => (
                  <span key={n} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => update({ round: i })}
                      className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                        i <= vault.round
                          ? "bg-[color:var(--hill-gold)] text-black"
                          : "border border-white/20 text-[oklch(0.78_0.01_80)]"
                      }`}
                    >
                      {n === 1 ? "Final" : n}
                    </button>
                    {i < COLLAB_ROUNDS.length - 1 && (
                      <span className="text-[color:var(--hill-gold)]">→</span>
                    )}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-[oklch(0.7_0.01_80)]">
                Currently in round {vault.round + 1}. Every earlier round stays saved — you can
                always walk a dress back in.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-white/12 bg-white/[0.02] p-6">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--hill-gold)]">
              From screen to aisle
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {TRY_ON_WORKFLOW.map((s, i) => (
                <span key={s} className="flex items-center gap-2">
                  <span className="rounded-full border border-white/20 px-3 py-1 text-xs">{s}</span>
                  {i < TRY_ON_WORKFLOW.length - 1 && (
                    <span className="text-[color:var(--hill-gold)]">→</span>
                  )}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-[oklch(0.78_0.01_80)]">
              Every bridal product offers three ways forward: try on virtually, try on in person at
              an authorised boutique near you, or order online with the bridal return policy.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/bridal/sourcing"
              className="rounded-full border border-[color:var(--hill-gold)]/40 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em]"
            >
              Can't find the dress? Source it
            </Link>
            <Link
              to="/bridal"
              className="rounded-full border border-white/25 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em]"
            >
              Back to the village
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
