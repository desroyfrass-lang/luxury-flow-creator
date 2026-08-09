// Founder AI Credit Center — FRASS-0402 platform economy controls.
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { creditOverview, grantCredits } from "@/lib/studio.functions";
import { CREDITS_PER_USD, STUDIO_OPERATIONS, usdFor } from "@/lib/studio/credits";

export const Route = createFileRoute("/_authenticated/admin/ai-credits")({
  head: () => ({
    meta: [
      { title: "AI Credit Center — Frass Founder Controls" },
      {
        name: "description",
        content:
          "Platform-wide Frass AI Credit economy: balances, usage, pricing and promotional grants.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CreditCenter,
});

function CreditCenter() {
  const overview = useServerFn(creditOverview);
  const grant = useServerFn(grantCredits);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["ai-credit-overview"],
    queryFn: () => overview(),
    retry: false,
  });

  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(1000);
  const [reason, setReason] = useState("");

  const give = useMutation({
    mutationFn: () => grant({ data: { email, amount, reason } }),
    onSuccess: (r) => {
      toast.success(`${r.granted.toLocaleString()} Credits granted to ${r.email}.`);
      setEmail("");
      setReason("");
      void qc.invalidateQueries({ queryKey: ["ai-credit-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <SiteShell>
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl space-y-8 px-6 py-12">
          <header>
            <p className="text-[11px] uppercase tracking-[0.4em] text-amber-300/70">FRASS-0402</p>
            <h1 className="mt-2 text-3xl font-light tracking-wide">AI Credit Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              One credit economy for every AI service on the platform. Credits are an accounting
              unit for real compute — {CREDITS_PER_USD.toLocaleString()} Credits ≈ $1.00 of
              member-facing AI processing.
            </p>
          </header>

          {error && (
            <p className="rounded-xl border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-200">
              {(error as Error).message}
            </p>
          )}

          {data && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: "Members with wallets", value: data.members },
                  { label: "Credits outstanding", value: data.outstanding },
                  { label: "Lifetime used", value: data.lifetimeUsed },
                  { label: "Lifetime purchased", value: data.lifetimePurchased },
                  { label: "Recent spend", value: data.recentSpend },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      {c.label}
                    </p>
                    <p className="mt-1 text-xl font-light text-amber-200">
                      {c.value.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-white/35">≈ {usdFor(c.value)}</p>
                  </div>
                ))}
              </div>

              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h2 className="text-[11px] uppercase tracking-[0.25em] text-white/45">
                  Where the credits go
                </h2>
                <div className="mt-3 space-y-2">
                  {data.topOperations.map((o) => (
                    <div key={o.label} className="flex items-center justify-between text-xs">
                      <span className="text-white/60">{o.label}</span>
                      <span className="text-white/80">{o.credits.toLocaleString()}</span>
                    </div>
                  ))}
                  {data.topOperations.length === 0 && (
                    <p className="text-xs text-white/40">No AI operations billed yet.</p>
                  )}
                </div>
              </section>
            </>
          )}

          <section className="rounded-2xl border border-amber-300/25 bg-amber-300/[0.04] p-5">
            <h2 className="text-[11px] uppercase tracking-[0.25em] text-amber-300/80">
              Grant promotional credits
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px_minmax(0,1fr)_auto]">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@email.com"
                className="rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-xs outline-none focus:border-amber-300/50"
              />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-xs outline-none"
              />
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (appears on their receipt)"
                className="rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-xs outline-none"
              />
              <button
                onClick={() => give.mutate()}
                disabled={give.isPending}
                className="rounded-lg bg-amber-300/90 px-4 py-2 text-xs font-medium uppercase tracking-widest text-black disabled:opacity-40"
              >
                Grant
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h2 className="text-[11px] uppercase tracking-[0.25em] text-white/45">
              Rate card — credits per unit of AI work
            </h2>
            <div className="mt-3 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
              {STUDIO_OPERATIONS.map((o) => (
                <div key={o.key} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-white/60">{o.label}</span>
                  <span className="shrink-0 text-white/45">
                    {o.rate.toLocaleString()} / {o.unit}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-white/40">
              Manual editing, uploads, previews, drafts and the brand library never consume credits.
            </p>
          </section>

          {isLoading && <p className="text-sm text-white/40">Loading the economy…</p>}
        </div>
      </div>
    </SiteShell>
  );
}
