// Vendor brands inside the existing private Workspace.
// One member identity (same account, profile handle/bio, Frass Card); a member
// may run several vendor brands. Offers and costs are owner-only. Verification
// and product approval are Founder-only and enforced by the database.
// Nothing here publishes anything.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { IdentityGate } from "@/components/security/identity-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthUserId } from "@/lib/auth/identity-watch";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { CjPilotPanel } from "@/components/vendors/cj-pilot-panel";
import { PILOT_CJ_PID } from "@/lib/vendors/cj-pilot";
import { classificationBreadcrumb } from "@/lib/taxonomy/hierarchy";
import {
  FULFILLMENT_MODES,
  VENDOR_KINDS,
  createProductDraft,
  createVendorProfile,
  founderDecideProduct,
  founderListReviewQueue,
  founderListVendors,
  founderSetVendorVerification,
  listMyVendorWorkspace,
  setMyDraftStatus,
} from "@/lib/vendors/products.functions";

export const Route = createFileRoute("/_authenticated/workspace/vendors")({
  head: () => ({
    meta: [
      { title: "Vendor Brands — Frass Workspace" },
      { name: "description", content: "Your private vendor brands, product drafts and verification status in Frass." },
      { property: "og:title", content: "Vendor Brands — Frass Workspace" },
      { property: "og:description", content: "Private vendor brands and product drafts in your Frass Workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <IdentityGate action="workspace">
      <VendorWorkspace />
    </IdentityGate>
  ),
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Waiting for Founder verification",
  verified: "Verified by the Founder",
  suspended: "Suspended",
  draft: "Draft",
  prepared: "Prepared",
  founder_review: "With the Founder for review",
  approved: "Approved (not published)",
  rejected: "Returned — edit and resubmit",
};

function Badge({ status }: { status: string }) {
  return (
    <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function VendorWorkspace() {
  const { userId } = useAuthUserId();
  const isFounder = useIsAdmin();
  const qc = useQueryClient();
  const listFn = useServerFn(listMyVendorWorkspace);
  const createVendorFn = useServerFn(createVendorProfile);
  const createDraftFn = useServerFn(createProductDraft);
  const statusFn = useServerFn(setMyDraftStatus);

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-workspace", userId],
    queryFn: () => listFn(),
    enabled: Boolean(userId),
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["vendor-workspace", userId] });

  const [brandName, setBrandName] = useState("");
  const [brandKind, setBrandKind] = useState<(typeof VENDOR_KINDS)[number]>("artisan");
  const addBrand = useMutation({
    mutationFn: () => createVendorFn({ data: { displayName: brandName, vendorKind: brandKind } }),
    onSuccess: () => { setBrandName(""); toast.success("Brand added — waiting for Founder verification."); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const moveDraft = useMutation({
    mutationFn: (v: { productId: string; status: "draft" | "prepared" | "founder_review" }) => statusFn({ data: v }),
    onSuccess: () => refresh(),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/workspace" className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">← Workspace</Link>
        <h1 className="mt-4 font-display text-4xl">Vendor Brands</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your brands use the identity you already have. Nothing here is public, and nothing is published.
        </p>

        {isLoading || !data ? (
          <p className="mt-10 text-sm text-muted-foreground">Opening your brands…</p>
        ) : (
          <>
            <section className="mt-8 rounded-xl border border-border p-5">
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Your member identity</div>
              <div className="mt-2 font-display text-xl">{data.identity.displayName ?? "Unnamed member"}</div>
              <div className="text-xs text-muted-foreground">
                {data.identity.handle ? `@${data.identity.handle}` : "No handle yet"} · Frass Card{" "}
                {data.identity.cardPublished ? "published" : "not published"}
              </div>
              {data.identity.bio ? <p className="mt-2 text-sm">{data.identity.bio}</p> : null}
              <Link to="/workspace/profile" className="mt-2 inline-block text-xs underline">Edit identity and bio</Link>
            </section>

            <section className="mt-8 space-y-6">
              {data.vendors.length === 0 ? (
                <p className="text-sm text-muted-foreground">You have no vendor brands yet.</p>
              ) : (
                data.vendors.map((v) => (
                  <BrandCard
                    key={v.id}
                    vendor={v}
                    products={data.products.filter((p) => p.vendor_id === v.id)}
                    onMove={(productId, status) => moveDraft.mutate({ productId, status })}
                    onCreate={async (input) => {
                      try {
                        await createDraftFn({ data: { vendorId: v.id, ...input } });
                        toast.success("Draft saved privately.");
                        refresh();
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Could not save the draft.");
                      }
                    }}
                  />
                ))
              )}
            </section>

            <section className="mt-8 rounded-xl border border-dashed border-border p-5">
              <div className="text-sm font-medium">Add a vendor brand</div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Brand name" maxLength={160} />
                <select
                  value={brandKind}
                  onChange={(e) => setBrandKind(e.target.value as (typeof VENDOR_KINDS)[number])}
                  className="rounded-md border border-input bg-background px-3 text-sm"
                  aria-label="Brand type"
                >
                  {VENDOR_KINDS.map((k) => <option key={k} value={k}>{k.replace("_", " ")}</option>)}
                </select>
                <Button disabled={!brandName.trim() || addBrand.isPending} onClick={() => addBrand.mutate()}>Add</Button>
              </div>
            </section>
          </>
        )}

        {isFounder && data ? (
          <CjPilotPanel
            supplierBrands={data.vendors.filter((v) => v.vendor_kind === "supplier")}
            existingDraft={(() => {
              const p = data.products.find((x) => x.product_sources?.some((src) => src.source_type === "cj" && src.source_ref === PILOT_CJ_PID));
              return p ? { id: p.id, title: p.title, category_key: (p as { category_key?: string | null }).category_key ?? null } : null;
            })()}
            onCreated={refresh}
          />
        ) : null}
        {isFounder ? <FounderReview /> : null}
      </div>
    </SiteShell>
  );
}

type Vendor = { id: string; display_name: string; vendor_kind: string; verification_status: string };
type Product = {
  id: string;
  title: string;
  category_key?: string | null;
  draft_status: string;
  vendor_offers: { id: string; sku: string | null; unit_cost: number | null; currency: string; fulfillment_mode: string; lead_time_min_days: number | null; lead_time_max_days: number | null }[];
  product_sources: { source_type: string; source_ref: string }[];
};

function BrandCard(props: {
  vendor: Vendor;
  products: Product[];
  onMove: (id: string, s: "draft" | "prepared" | "founder_review") => void;
  onCreate: (input: { title: string; description: string; source: { type: "artisan" | "manual"; ref: string }; offer: { fulfillmentMode: (typeof FULFILLMENT_MODES)[number]; currency: string; ipProtectionLevel: string; sku?: string; unitCost?: number; leadTimeMinDays?: number; leadTimeMaxDays?: number } }) => Promise<void>;
}) {
  const { vendor, products } = props;
  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [cost, setCost] = useState("");
  const [mode, setMode] = useState<(typeof FULFILLMENT_MODES)[number]>("made_to_order");
  const [lead, setLead] = useState({ min: "", max: "" });
  const verified = vendor.verification_status === "verified";

  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-display text-xl">{vendor.display_name}</div>
        <Badge status={vendor.verification_status} />
      </div>
      <div className="text-xs text-muted-foreground">{vendor.vendor_kind.replace("_", " ")}</div>

      <ul className="mt-4 space-y-3">
        {products.map((p) => (
          <li key={p.id} className="rounded-lg bg-muted/30 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{p.title}</span>
              <Badge status={p.draft_status} />
            </div>
            {p.category_key && <div className="mt-1 text-xs text-muted-foreground">{classificationBreadcrumb(p.category_key)}</div>}
            {p.vendor_offers.map((o) => (
              <div key={o.id} className="mt-1 text-xs text-muted-foreground">
                Private offer: {o.sku ?? "no SKU"} · {o.unit_cost != null ? `${o.currency} ${o.unit_cost} cost` : "cost not set"} · {o.fulfillment_mode.replaceAll("_", " ")}
                {o.lead_time_min_days != null ? ` · ${o.lead_time_min_days}–${o.lead_time_max_days ?? o.lead_time_min_days} days` : ""}
              </div>
            ))}
            {(p.draft_status === "draft" || p.draft_status === "prepared" || p.draft_status === "rejected") && (
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" disabled={!verified} onClick={() => props.onMove(p.id, "founder_review")}>
                  Send to Founder
                </Button>
                {!verified && <span className="self-center text-xs text-muted-foreground">Brand must be verified first.</span>}
              </div>
            )}
          </li>
        ))}
      </ul>

      <details className="mt-5 border-t border-border pt-4">
        <summary className="cursor-pointer text-sm font-medium">Manual product entry (not connected to CJ Pilot P1)</summary>
        <p className="mt-2 text-xs text-muted-foreground">A separate product entered by hand. These blank fields do not edit or save the CJ blouse. Use Founder · Pilot P1 below for that item.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Input placeholder="Product name" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        <Input placeholder="Your SKU (optional)" value={sku} onChange={(e) => setSku(e.target.value)} maxLength={120} />
        <Input placeholder="Your cost (private)" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />
        <select value={mode} onChange={(e) => setMode(e.target.value as (typeof FULFILLMENT_MODES)[number])} className="rounded-md border border-input bg-background px-3 text-sm" aria-label="How it is made">
          {FULFILLMENT_MODES.map((m) => <option key={m} value={m}>{m.replaceAll("_", " ")}</option>)}
        </select>
        <Input placeholder="Lead time from (days)" inputMode="numeric" value={lead.min} onChange={(e) => setLead({ ...lead, min: e.target.value })} />
        <Input placeholder="Lead time to (days)" inputMode="numeric" value={lead.max} onChange={(e) => setLead({ ...lead, max: e.target.value })} />
      </div>
      <Button
        className="mt-3"
        size="sm"
        disabled={!title.trim()}
        onClick={async () => {
          await props.onCreate({
            title,
            description: "",
            source: { type: "artisan", ref: `${vendor.id}:${crypto.randomUUID()}` },
            offer: {
              fulfillmentMode: mode,
              currency: "USD",
              ipProtectionLevel: "standard",
              sku: sku || undefined,
              unitCost: cost ? Number(cost) : undefined,
              leadTimeMinDays: lead.min ? Number(lead.min) : undefined,
              leadTimeMaxDays: lead.max ? Number(lead.max) : undefined,
            },
          });
          setTitle(""); setSku(""); setCost(""); setLead({ min: "", max: "" });
        }}
      >
        Save separate manual draft
      </Button>
      </details>
    </div>
  );
}

function FounderReview() {
  const { userId } = useAuthUserId();
  const qc = useQueryClient();
  const vendorsFn = useServerFn(founderListVendors);
  const queueFn = useServerFn(founderListReviewQueue);
  const verifyFn = useServerFn(founderSetVendorVerification);
  const decideFn = useServerFn(founderDecideProduct);
  const vendors = useQuery({ queryKey: ["founder-vendors", userId], queryFn: () => vendorsFn(), enabled: Boolean(userId) });
  const queue = useQuery({ queryKey: ["founder-product-queue", userId], queryFn: () => queueFn(), enabled: Boolean(userId) });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["founder-vendors", userId] });
    qc.invalidateQueries({ queryKey: ["founder-product-queue", userId] });
    qc.invalidateQueries({ queryKey: ["vendor-workspace", userId] });
  };
  const act = async (p: Promise<unknown>, ok: string) => {
    try { await p; toast.success(ok); refresh(); } catch (e) { toast.error(e instanceof Error ? e.message : "Not saved."); }
  };

  return (
    <section className="mt-12 rounded-xl border border-[color:var(--gold)]/50 p-5">
      <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Founder review</div>
      <h2 className="mt-2 font-display text-2xl">Vendor verification</h2>
      <ul className="mt-3 space-y-2">
        {(vendors.data ?? []).map((v) => (
          <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>{v.display_name} <span className="text-muted-foreground">({v.vendor_kind})</span></span>
            <span className="flex items-center gap-2">
              <Badge status={v.verification_status} />
              {v.verification_status !== "verified" && (
                <Button size="sm" variant="outline" onClick={() => act(verifyFn({ data: { vendorId: v.id, status: "verified", note: "" } }), "Vendor verified.")}>Verify</Button>
              )}
              {v.verification_status !== "suspended" && (
                <Button size="sm" variant="ghost" onClick={() => act(verifyFn({ data: { vendorId: v.id, status: "suspended", note: "" } }), "Vendor suspended.")}>Suspend</Button>
              )}
            </span>
          </li>
        ))}
        {(vendors.data ?? []).length === 0 && <li className="text-sm text-muted-foreground">No vendors yet.</li>}
      </ul>

      <h2 className="mt-8 font-display text-2xl">Products waiting for you</h2>
      <ul className="mt-3 space-y-2">
        {(queue.data ?? []).map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>{p.title}</span>
            <span className="flex gap-2">
              <Button size="sm" onClick={() => act(decideFn({ data: { productId: p.id, decision: "approved", note: "" } }), "Approved — not published.")}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => act(decideFn({ data: { productId: p.id, decision: "rejected", note: "" } }), "Returned to vendor.")}>Return</Button>
            </span>
          </li>
        ))}
        {(queue.data ?? []).length === 0 && <li className="text-sm text-muted-foreground">Nothing waiting.</li>}
      </ul>
    </section>
  );
}
