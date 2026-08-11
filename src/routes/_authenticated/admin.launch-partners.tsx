// FRASS-0459 — Founder oversight for Frass Hill partners. Visibility, never control.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell } from "@/components/site-shell";
import { listPartnerLaunchStates } from "@/lib/business/accelerator.functions";
import { normalizeState, oversight } from "@/lib/business/accelerator";
import {
  foundationPct,
  launchMomentum,
  normalizeProgram,
  programDay,
  PROGRAM_DAYS,
} from "@/lib/business/launch-program";

export const Route = createFileRoute("/_authenticated/admin/launch-partners")({
  head: () => ({
    meta: [
      { title: "Partner Launch Progress — Frass Founder Desk" },
      {
        name: "description",
        content: "Founder visibility into every Frass Hill partner's launch readiness, milestones and support signals.",
      },
      { property: "og:title", content: "Partner Launch Progress" },
      { property: "og:description", content: "Mentoring visibility for Frass Hill partners — never micromanagement." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PartnerOversightPage,
});

function PartnerOversightPage() {
  const listFn = useServerFn(listPartnerLaunchStates);
  const q = useQuery({ queryKey: ["partner-launch-states"], queryFn: () => listFn({}) });

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Founder Desk</p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.06em]">Partner Launch Progress</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Read-only. You can see where each partner is and where they may be stuck — you cannot change their plan from
          here. Mentoring, not micromanagement.
        </p>

        {q.isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}
        {q.isError && (
          <p className="mt-8 text-sm text-red-300">This desk is founder-only, and this account can't open it.</p>
        )}

        <div className="mt-8 space-y-4">
          {(q.data ?? []).map((r) => {
            const s = normalizeState(r.state);
            const o = oversight(s, Number(r.hours_per_day || 2));
            return (
              <article key={r.user_id} className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-lg uppercase tracking-[0.06em]">
                    {r.display_name || r.email || "Partner"}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    Last active: {o.lastActive ?? "not yet"} · {o.daysWorkedThisWeek} days this week
                  </span>
                </div>
                {r.mission && <p className="mt-1 text-sm text-muted-foreground">Mission: {r.mission}</p>}

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <Cell label="Launch readiness" value={`${o.readinessPct}%`} />
                  <Cell label="Estimated launch" value={`${o.launchDays} days`} />
                  <Cell label="Milestones" value={`${o.movesCompleted}/${o.movesTotal}`} />
                  <Cell label="Earned" value={`$${o.earned.toLocaleString()}`} />
                </div>

                {o.supportSignals.length > 0 && (
                  <ul className="mt-4 space-y-1 text-sm">
                    {o.supportSignals.map((sig) => (
                      <li key={sig} className="rounded-2xl bg-amber-400/[0.08] px-3 py-2 text-amber-200">
                        {sig}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
          {q.isSuccess && (q.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No partner has started a launch plan yet.</p>
          )}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          <Link to="/admin/partners" className="underline">
            Partner invitations
          </Link>{" "}
          ·{" "}
          <Link to="/launch-accelerator" className="underline">
            Your own accelerator
          </Link>
        </p>
      </div>
    </SiteShell>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl">{value}</p>
    </div>
  );
}
