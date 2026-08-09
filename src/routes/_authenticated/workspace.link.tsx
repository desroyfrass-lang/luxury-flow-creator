import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users } from "lucide-react";
import { PageFeedback } from "@/components/page-feedback";
import { FrassLinkWidget } from "@/components/link/frass-link-widget";
import { MemberIdentity } from "@/components/card/member-identity";
import { getMyIntroducer, getMyLinkDashboard } from "@/lib/link.functions";
import {
  BONUS_RULES,
  CONNECTION_PRINCIPLE,
  REFERRAL_STAGES,
  bonusLabel,
  stageLabel,
} from "@/lib/frass-link";

export const Route = createFileRoute("/_authenticated/workspace/link")({
  head: () => ({
    meta: [
      { title: "My Frass Link — Identity, Recruitment & Rewards" },
      {
        name: "description",
        content:
          "One permanent Frass Link: link analytics, recruitment progress, qualified members and recruitment bonuses in a single dashboard.",
      },
      { property: "og:title", content: "My Frass Link — Identity, Recruitment & Rewards" },
      {
        property: "og:description",
        content: "Every meaningful connection on Frass begins with a Link.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LinkDashboard,
});

const panel = "rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur";
const heading = "text-xs uppercase tracking-[0.25em] text-muted-foreground";

function LinkDashboard() {
  const dashFn = useServerFn(getMyLinkDashboard);
  const introFn = useServerFn(getMyIntroducer);
  const { data: dash } = useQuery({ queryKey: ["my-link-dashboard"], queryFn: () => dashFn() });
  const { data: introducer } = useQuery({ queryKey: ["my-introducer"], queryFn: () => introFn() });

  const t = dash?.totals;

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      <header className="space-y-3">
        <p className={heading}>FRASS-0428 · Unified Identity, Recruitment & Rewards</p>
        <h1 className="text-3xl font-black uppercase tracking-tight">My Frass Link</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{CONNECTION_PRINCIPLE}</p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          <strong>What this means in plain English:</strong> one address for life. Like a street address
          — the house can be repainted or turned into a shop, but anyone who ever wrote the address down
          can still find you.
        </p>
      </header>

      <FrassLinkWidget context="Link dashboard" />

      <section className={panel}>
        <h2 className={heading}>Link analytics</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Metric label="Link opens" value={t?.opens ?? 0} />
          <Metric label="QR scans" value={t?.qrScans ?? 0} />
          <Metric label="Card views" value={t?.cardViews ?? 0} />
          <Metric label="Shares" value={t?.shares ?? 0} />
          <Metric label="Website visits" value={t?.websiteClicks ?? 0} />
          <Metric label="Marketplace visits" value={t?.marketplaceClicks ?? 0} />
          <Metric label="Affiliate clicks" value={t?.affiliateClicks ?? 0} />
          <Metric label="Sales generated" value={t?.sales ?? 0} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Zeros stay honest — nothing here is estimated or invented.
        </p>
      </section>

      <section className={panel}>
        <h2 className={heading}>
          <Users className="mr-2 inline h-3.5 w-3.5" /> Recruitment progress
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          {REFERRAL_STAGES.map((s) => (
            <div key={s.id} className="rounded-xl border border-border/60 p-4">
              <span className="text-2xl font-black">{dash?.stageCounts?.[s.id] ?? 0}</span>
              <p className="mt-1 text-xs font-medium">{s.label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{s.plain}</p>
            </div>
          ))}
        </div>

        {(dash?.referrals ?? []).length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Nobody has joined through your link yet. Share it once and this fills itself in.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {(dash?.referrals ?? []).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3 text-sm"
              >
                <MemberIdentity
                  handle={r.handle}
                  name={r.display_name}
                  avatarUrl={r.avatar_url}
                  role={`${stageLabel(r.stage)} · arrived by ${r.source}`}
                />
                {r.handle && (
                  <Link className="ws-chip text-xs" to="/card/$handle" params={{ handle: r.handle }}>
                    Their Frass Card
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Privacy: you see recruitment status and bonus progress only. Never another member's vault,
          finances or personal information.
        </p>
      </section>

      <section className={panel}>
        <h2 className={heading}>Recruitment bonuses</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Milestone bonuses — earned once, for one qualifying event. Never endless lifetime commissions.
          Each one flows into the Financial Center as its own earnings category.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Metric label="Earned" value={`$${(t?.bonusesEarned ?? 0).toFixed(2)}`} />
          <Metric label="Paid" value={`$${(t?.bonusesPaid ?? 0).toFixed(2)}`} />
          <Metric label="People introduced" value={t?.introduced ?? 0} />
        </div>

        <div className="mt-4 space-y-2">
          {(dash?.bonuses ?? []).length === 0
            ? BONUS_RULES.map((r) => (
                <div key={r.kind} className="rounded-xl border border-dashed border-border/60 p-3 text-sm">
                  <p className="font-medium">
                    {r.label} — ${r.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{r.plain}</p>
                </div>
              ))
            : (dash?.bonuses ?? []).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{bonusLabel(b.kind)}</p>
                    <p className="text-xs text-muted-foreground">{b.note}</p>
                  </div>
                  <span className="text-sm font-semibold">
                    ${Number(b.amount).toFixed(2)}{" "}
                    <em className="text-xs font-normal text-muted-foreground">{b.status}</em>
                  </span>
                </div>
              ))}
        </div>
        <Link className="ws-chip mt-4 inline-flex" to="/financial-center">
          Open the Financial Center
        </Link>
      </section>

      {introducer && (
        <section className={panel}>
          <h2 className={heading}>My Human Link</h2>
          <div className="mt-2">
            <MemberIdentity
              handle={introducer.handle}
              name={introducer.display_name}
              avatarUrl={introducer.avatar_url}
              size="md"
            />
          </div>
          <p className="mt-2 text-sm">
            {introducer.display_name} introduced you to Frass — arrived by {introducer.source}. That
            connection is permanent.
          </p>
          {introducer.handle && (
            <Link className="ws-chip mt-3 inline-flex" to="/card/$handle" params={{ handle: introducer.handle }}>
              Their Frass Card
            </Link>
          )}
        </section>
      )}

      <PageFeedback pageTitle="My Frass Link" />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border/60 p-4">
      <span className="text-2xl font-black">{value}</span>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
