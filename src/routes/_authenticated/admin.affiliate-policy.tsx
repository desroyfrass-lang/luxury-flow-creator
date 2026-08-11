import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { DEFAULT_POLICY, type AffiliatePolicy } from "@/lib/affiliate-intelligence";
import { getAffiliatePolicy, updateAffiliatePolicy } from "@/lib/affiliate.functions";

export const Route = createFileRoute("/_authenticated/admin/affiliate-policy")({
  head: () => ({
    meta: [
      { title: "Affiliate Governance — Frass Founder Controls" },
      {
        name: "description",
        content:
          "Founder-level governance for the Frass Affiliate Intelligence Engine: ceilings, floors, default margins, and promotional windows.",
      },
      { property: "og:title", content: "Affiliate Governance — Frass Founder Controls" },
      {
        property: "og:description",
        content: "Set the framework every Builder's affiliate commission operates inside.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AffiliatePolicyPage,
});

const NUMERIC: Array<{ key: keyof AffiliatePolicy; label: string; blurb: string }> = [
  {
    key: "min_commission_rate",
    label: "Minimum commission allowed",
    blurb: "The lowest percentage that still counts as a real incentive.",
  },
  {
    key: "max_commission_rate",
    label: "Maximum commission allowed",
    blurb: "Nobody may exceed this, regardless of margin.",
  },
  {
    key: "default_commission_rate",
    label: "Global default recommendation",
    blurb: "Where Frassy starts when a Builder has no preference.",
  },
  {
    key: "default_min_margin_pct",
    label: "Default minimum profit margin",
    blurb: "The profit Frassy protects before offering any commission.",
  },
];

const READINESS: Array<{ key: keyof AffiliatePolicy; label: string; blurb: string }> = [
  { key: "marketplace_launched", label: "Marketplace officially launched", blurb: "The Frass Marketplace is open for real customer activity." },
  { key: "approved_products_available", label: "Approved Frass products available", blurb: "Partners have real, approved Frass products they can promote." },
  { key: "approved_brand_partners_available", label: "Approved Brand Partners available", blurb: "Founder-approved Brand Partners are ready inside Frass." },
  { key: "internal_campaigns_ready", label: "Internal campaigns ready", blurb: "Complete Frass affiliate campaigns are ready to use." },
  { key: "affiliate_marketing_activated", label: "Founder activation", blurb: "The final Founder switch that moves Partners from preparation into earning." },
];

function AffiliatePolicyPage() {
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const load = useServerFn(getAffiliatePolicy);
  const save = useServerFn(updateAffiliatePolicy);

  const { data } = useQuery({
    queryKey: ["affiliate-policy"],
    queryFn: () => load(),
    enabled: isAdmin === true,
  });

  const [form, setForm] = useState<AffiliatePolicy>(DEFAULT_POLICY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  useEffect(() => {
    if (isAdmin === false) void navigate({ to: "/builder-hall", replace: true });
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-6 py-24 text-sm text-muted-foreground">
          Affiliate governance is reserved for platform administrators.
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          Founder Controls
        </div>
        <h1 className="mt-3 font-display text-4xl leading-tight">Affiliate Governance</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          These settings are the framework. Builders make their own decisions inside it. The
          constitutional Platform Allocation is a separate system and is not configured here —
          changing one must never alter the other.
        </p>

        <div className="mt-6 rounded-sm border border-border bg-background/40 p-4 text-xs text-muted-foreground">
          Platform Allocation Engine ·{" "}
          <span className="text-[color:var(--gold)]">
            {form.platform_allocation_rate}% fixed, governance controlled
          </span>
        </div>

        <section className="mt-8 rounded-sm border border-[color:var(--gold)]/35 bg-background/40 p-5">
          <h2 className="font-display text-2xl">Frass First Marketplace Rule</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Affiliate earning activates only when every switch is on. Until then, Money Moves automatically replaces affiliate work with launch preparation from Coco Vintage, Wellness, Faceless Content, Podcast, and Frass Card.
          </p>
          <div className="mt-5 space-y-3">
            {READINESS.map((item) => (
              <label key={String(item.key)} className="flex items-start justify-between gap-5 rounded-sm border border-border p-4">
                <span>
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{item.blurb}</span>
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(form[item.key])}
                  onChange={(event) => setForm((current) => ({ ...current, [item.key]: event.target.checked }))}
                  className="mt-1 h-5 w-5 accent-[color:var(--gold)]"
                />
              </label>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {NUMERIC.map((f) => (
            <label key={String(f.key)} className="block rounded-sm border border-border bg-background/40 p-4">
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {f.label}
              </span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={Number(form[f.key] ?? 0)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [f.key]: Number(e.target.value) }) as AffiliatePolicy)
                }
                className="mt-2 w-full rounded-sm border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--gold)]"
              />
              <span className="mt-2 block text-xs text-muted-foreground">{f.blurb}</span>
            </label>
          ))}
        </div>

        <section className="mt-10 rounded-sm border border-border bg-background/40 p-5">
          <h2 className="font-display text-2xl">Promotional window</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Black Friday, launch week, a marketplace festival. Even inside a promotion, Frassy still
            recalculates profitability before approving any commission change.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Label
              </span>
              <input
                value={form.promo_label ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, promo_label: e.target.value }))}
                placeholder="e.g. Black Friday"
                className="mt-1 w-full rounded-sm border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--gold)]"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Promotional ceiling (%)
              </span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={form.promo_max_commission_rate ?? ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    promo_max_commission_rate: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                className="mt-1 w-full rounded-sm border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--gold)]"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Starts
              </span>
              <input
                type="date"
                value={form.promo_starts_at?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, promo_starts_at: e.target.value || null }))
                }
                className="mt-1 w-full rounded-sm border border-border bg-background/60 px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Ends
              </span>
              <input
                type="date"
                value={form.promo_ends_at?.slice(0, 10) ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, promo_ends_at: e.target.value || null }))}
                className="mt-1 w-full rounded-sm border border-border bg-background/60 px-3 py-2 text-sm outline-none"
              />
            </label>
          </div>
        </section>

        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await save({ data: form });
              await qc.invalidateQueries({ queryKey: ["affiliate-policy"] });
              toast.success("Affiliate framework updated.");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not save.");
            } finally {
              setSaving(false);
            }
          }}
          className="lux-press mt-8 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)]"
        >
          Save framework
        </button>
      </div>
      <PageFeedback pageTitle="Affiliate Governance" />
    </SiteShell>
  );
}
