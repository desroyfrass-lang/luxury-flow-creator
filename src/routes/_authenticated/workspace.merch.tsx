// Spec 041 — Phase 1 workspace surface at /workspace/merch.
// Tabs: Daily Queue · Slogans · Logo Treatments · Providers · Audit.
// No publishing in Phase 1 — this is review + approval infrastructure.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { useWorkspaceRoles } from "@/hooks/use-workspace-roles";
import {
  listSlogans, createSlogan, setSloganStatus,
  listLogoTreatments, createLogoTreatment, setLogoTreatmentStatus,
  listProviders,
  listProposals, createProposal, reviewProposal,
  listMerchAudit,
  SLOGAN_STATUSES, SLOGAN_SOURCES, LOGO_PLACEMENTS, PROPOSAL_STATUSES, QUALITY_TIERS,
  type SloganStatus, type SloganSource, type LogoPlacement, type QualityTier,
} from "@/lib/merch.functions";

export const Route = createFileRoute("/_authenticated/workspace/merch")({
  component: MerchWorkspace,
});

type Tab = "queue" | "slogans" | "logos" | "providers" | "audit";

function MerchWorkspace() {
  const roles = useWorkspaceRoles();
  const canReview = roles.includes("admin") || roles.includes("staff");
  const canAccess = canReview || roles.includes("designer");
  const [tab, setTab] = useState<Tab>("queue");

  if (roles.length === 0) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-6 py-24 text-center text-sm text-muted-foreground">
          Checking access…
        </div>
      </SiteShell>
    );
  }
  if (!canAccess) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="font-display text-3xl">Not available</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The merchandise studio is limited to admin, staff, and designers.
          </p>
          <Link
            to="/workspace"
            className="mt-6 inline-block text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]"
          >
            ← Back to workspace
          </Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
              Merchandise Studio · Phase 1
            </div>
            <h1 className="mt-2 font-display text-5xl">Merch</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Review, refine, and approve. Nothing publishes to the store from Phase 1 — this is your control room for the creative pipeline.
            </p>
          </div>
          <Link
            to="/workspace"
            className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
          >
            ← Workspace
          </Link>
        </div>

        <nav className="mt-10 flex flex-wrap gap-2 border-b border-border/60">
          {(["queue", "slogans", "logos", "providers", "audit"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-[11px] uppercase tracking-[0.28em] transition ${
                tab === t
                  ? "border-b-2 border-[color:var(--gold)] text-[color:var(--gold)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "queue" ? "Daily Queue"
                : t === "slogans" ? "Slogans"
                : t === "logos" ? "Logo Treatments"
                : t === "providers" ? "Providers"
                : "Audit"}
            </button>
          ))}
        </nav>

        <div className="mt-8">
          {tab === "queue" && <QueueTab canReview={canReview} />}
          {tab === "slogans" && <SloganTab canReview={canReview} />}
          {tab === "logos" && <LogoTab canReview={canReview} />}
          {tab === "providers" && <ProvidersTab />}
          {tab === "audit" && <AuditTab />}
        </div>
      </div>
    </SiteShell>
  );
}

// ============================================================
// Daily Queue
// ============================================================
function QueueTab({ canReview }: { canReview: boolean }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listProposals);
  const reviewFn = useServerFn(reviewProposal);
  const createFn = useServerFn(createProposal);
  const [filter, setFilter] = useState<"queue" | "all">("queue");

  const { data, isLoading } = useQuery({
    queryKey: ["merch-proposals", filter],
    queryFn: () => listFn({ data: { status: filter } }),
    staleTime: 30_000,
  });

  const review = useMutation({
    mutationFn: (input: { id: string; decision: "approve" | "adjust" | "skip" | "reject"; reviewerNotes?: string }) =>
      reviewFn({ data: input }),
    onSuccess: (_, v) => {
      toast.success(`Marked as ${v.decision}`);
      qc.invalidateQueries({ queryKey: ["merch-proposals"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const seed = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          title: "Untitled concept",
          concept: "Blank concept — attach a slogan, logo treatment, and blank.",
          qualityTier: "experimental",
        },
      }),
    onSuccess: () => {
      toast.success("Draft proposal created");
      qc.invalidateQueries({ queryKey: ["merch-proposals"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex gap-2 text-[10px] uppercase tracking-[0.28em]">
          <button
            onClick={() => setFilter("queue")}
            className={filter === "queue" ? "text-[color:var(--gold)]" : "text-muted-foreground hover:text-foreground"}
          >
            Live queue
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            onClick={() => setFilter("all")}
            className={filter === "all" ? "text-[color:var(--gold)]" : "text-muted-foreground hover:text-foreground"}
          >
            All
          </button>
        </div>
        <button
          onClick={() => seed.mutate()}
          disabled={seed.isPending}
          className="rounded-sm border border-border px-3 py-2 text-[10px] uppercase tracking-[0.28em] hover:border-[color:var(--gold)] disabled:opacity-50"
        >
          + New draft proposal
        </button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading proposals…</div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title="No proposals yet"
          body="The daily proposal engine lands in Phase 3. For now, staff can create drafts manually."
        />
      ) : (
        <ul className="space-y-3">
          {(data ?? []).map((p: {
            id: string; title: string; concept: string | null; status: string; quality_tier: string;
            reviewer_notes: string | null; created_at: string;
            slogan: { text: string } | null;
            provider: { name: string } | null;
            logo_treatment: { name: string; placement: string } | null;
          }) => (
            <li
              key={p.id}
              className="rounded-lg border border-border/70 bg-background/40 p-5 backdrop-blur"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-display text-xl">{p.title}</div>
                    <StatusPill value={p.status} />
                    <TierPill value={p.quality_tier} />
                  </div>
                  {p.concept && <p className="mt-2 text-sm text-muted-foreground">{p.concept}</p>}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {p.slogan?.text && <span>Slogan · &ldquo;{p.slogan.text}&rdquo;</span>}
                    {p.logo_treatment?.name && <span>Logo · {p.logo_treatment.name} ({p.logo_treatment.placement})</span>}
                    {p.provider?.name && <span>Provider · {p.provider.name}</span>}
                  </div>
                  {p.reviewer_notes && (
                    <div className="mt-3 rounded-sm border-l-2 border-[color:var(--gold)] bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                      Reviewer: {p.reviewer_notes}
                    </div>
                  )}
                </div>
                {canReview && (p.status === "proposed" || p.status === "under_review" || p.status === "adjusted") && (
                  <div className="flex flex-col gap-2">
                    <ActionButton
                      label="Approve"
                      variant="gold"
                      onClick={() => {
                        const n = window.prompt("Approval note (optional)") ?? undefined;
                        review.mutate({ id: p.id, decision: "approve", reviewerNotes: n || undefined });
                      }}
                    />
                    <ActionButton
                      label="Adjust"
                      onClick={() => {
                        const n = window.prompt("What should the designer change?");
                        if (!n) return;
                        review.mutate({ id: p.id, decision: "adjust", reviewerNotes: n });
                      }}
                    />
                    <ActionButton
                      label="Skip"
                      onClick={() => review.mutate({ id: p.id, decision: "skip" })}
                    />
                    <ActionButton
                      label="Reject"
                      variant="danger"
                      onClick={() => {
                        const n = window.prompt("Reason for rejection");
                        if (!n) return;
                        review.mutate({ id: p.id, decision: "reject", reviewerNotes: n });
                      }}
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================================
// Slogans
// ============================================================
function SloganTab({ canReview }: { canReview: boolean }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listSlogans);
  const createFn = useServerFn(createSlogan);
  const setStatusFn = useServerFn(setSloganStatus);
  const [statusFilter, setStatusFilter] = useState<SloganStatus | "all">("under_review");
  const [sourceFilter, setSourceFilter] = useState<SloganSource | "all">("all");
  const [search, setSearch] = useState("");
  const [newText, setNewText] = useState("");
  const [newSource, setNewSource] = useState<SloganSource>("founder");
  const [newNotes, setNewNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["merch-slogans", statusFilter, sourceFilter, search],
    queryFn: () => listFn({ data: { status: statusFilter, source: sourceFilter, search } }),
    staleTime: 30_000,
  });

  const create = useMutation({
    mutationFn: () => createFn({ data: { text: newText, source: newSource, notes: newNotes || undefined } }),
    onSuccess: () => {
      toast.success("Submitted for review");
      setNewText("");
      setNewNotes("");
      qc.invalidateQueries({ queryKey: ["merch-slogans"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: SloganStatus }) => setStatusFn({ data: v }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["merch-slogans"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (data ?? []).forEach((s: { status: string }) => { c[s.status] = (c[s.status] ?? 0) + 1; });
    return c;
  }, [data]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SloganStatus | "all")}
            className="rounded-sm border border-border bg-background px-3 py-2 text-xs uppercase tracking-[0.2em]"
          >
            <option value="all">All statuses</option>
            {SLOGAN_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as SloganSource | "all")}
            className="rounded-sm border border-border bg-background px-3 py-2 text-xs uppercase tracking-[0.2em]"
          >
            <option value="all">All sources</option>
            {SLOGAN_SOURCES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search text…"
            className="min-w-[220px] flex-1 rounded-sm border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="mb-5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {(data ?? []).length} shown · draft {counts.draft ?? 0} · review {counts.under_review ?? 0} · approved {counts.approved ?? 0} · rejected {counts.rejected ?? 0} · retired {counts.retired ?? 0}
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (data ?? []).length === 0 ? (
          <EmptyState title="No slogans match" body="Adjust filters or add one from the right." />
        ) : (
          <ul className="space-y-2">
            {(data ?? []).map((s: {
              id: string; text: string; status: string; source: string;
              tags: string[]; brand_voice_notes: string | null;
            }) => (
              <li key={s.id} className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-background/30 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg leading-tight">&ldquo;{s.text}&rdquo;</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                    <StatusPill value={s.status} />
                    <span>· {s.source.replace("_", " ")}</span>
                    {s.tags.length > 0 && <span>· {s.tags.slice(0, 3).join(" · ")}</span>}
                  </div>
                  {s.brand_voice_notes && (
                    <div className="mt-1 text-xs text-muted-foreground">{s.brand_voice_notes}</div>
                  )}
                </div>
                {canReview && (
                  <div className="flex shrink-0 flex-col gap-1.5">
                    {s.status !== "approved" && (
                      <ActionButton size="xs" variant="gold" label="Approve"
                        onClick={() => setStatus.mutate({ id: s.id, status: "approved" })} />
                    )}
                    {s.status !== "under_review" && s.status !== "approved" && (
                      <ActionButton size="xs" label="Send to review"
                        onClick={() => setStatus.mutate({ id: s.id, status: "under_review" })} />
                    )}
                    {s.status !== "rejected" && (
                      <ActionButton size="xs" variant="danger" label="Reject"
                        onClick={() => setStatus.mutate({ id: s.id, status: "rejected" })} />
                    )}
                    {s.status === "approved" && (
                      <ActionButton size="xs" label="Retire"
                        onClick={() => setStatus.mutate({ id: s.id, status: "retired" })} />
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="h-fit rounded-lg border border-[color:var(--gold)]/30 bg-background/40 p-5 backdrop-blur">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Add slogan</div>
        <p className="mt-2 text-xs text-muted-foreground">
          Founder additions land in <strong>Under review</strong> — nothing auto-approves.
        </p>
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          rows={2}
          maxLength={240}
          placeholder="Slogan text…"
          className="mt-3 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
        <select
          value={newSource}
          onChange={(e) => setNewSource(e.target.value as SloganSource)}
          className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-xs uppercase tracking-[0.2em]"
        >
          <option value="founder">Founder</option>
          <option value="site_import">Site import</option>
          <option value="partner_submitted">Partner</option>
        </select>
        <input
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          maxLength={600}
          placeholder="Brand-voice note (optional)"
          className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={() => create.mutate()}
          disabled={!newText.trim() || create.isPending}
          className="mt-3 w-full rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--ink)] disabled:opacity-50"
        >
          {create.isPending ? "Submitting…" : "Submit for review"}
        </button>
      </aside>
    </div>
  );
}

// ============================================================
// Logo Treatments
// ============================================================
function LogoTab({ canReview }: { canReview: boolean }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listLogoTreatments);
  const createFn = useServerFn(createLogoTreatment);
  const setStatusFn = useServerFn(setLogoTreatmentStatus);
  const [form, setForm] = useState({
    name: "", placement: "chest_left" as LogoPlacement, assetUrl: "",
    colorTreatment: "", printMethod: "", notes: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["logo-treatments"],
    queryFn: () => listFn(),
    staleTime: 30_000,
  });

  const create = useMutation({
    mutationFn: () => createFn({
      data: {
        name: form.name,
        placement: form.placement,
        assetUrl: form.assetUrl,
        colorTreatment: form.colorTreatment || undefined,
        printMethod: form.printMethod || undefined,
        notes: form.notes || undefined,
      },
    }),
    onSuccess: () => {
      toast.success("Submitted");
      setForm({ name: "", placement: "chest_left", assetUrl: "", colorTreatment: "", printMethod: "", notes: "" });
      qc.invalidateQueries({ queryKey: ["logo-treatments"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: SloganStatus }) => setStatusFn({ data: v }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["logo-treatments"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (data ?? []).length === 0 ? (
          <EmptyState title="No logo treatments" body="Add your first treatment on the right — chest mark, sleeve embroidery, all-over, etc." />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {(data ?? []).map((t: {
              id: string; name: string; placement: string; asset_url: string;
              color_treatment: string | null; print_method: string | null; status: string;
              notes: string | null;
            }) => (
              <li key={t.id} className="rounded-lg border border-border/60 bg-background/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm border border-border bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.asset_url} alt="" className="h-full w-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display">{t.name}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {t.placement.replace("_", " ")}
                      {t.color_treatment ? ` · ${t.color_treatment}` : ""}
                      {t.print_method ? ` · ${t.print_method}` : ""}
                    </div>
                    <div className="mt-1"><StatusPill value={t.status} /></div>
                  </div>
                </div>
                {t.notes && <div className="mt-3 text-xs text-muted-foreground">{t.notes}</div>}
                {canReview && (
                  <div className="mt-3 flex gap-2">
                    {t.status !== "approved" && (
                      <ActionButton size="xs" variant="gold" label="Approve"
                        onClick={() => setStatus.mutate({ id: t.id, status: "approved" })} />
                    )}
                    {t.status !== "rejected" && (
                      <ActionButton size="xs" variant="danger" label="Reject"
                        onClick={() => setStatus.mutate({ id: t.id, status: "rejected" })} />
                    )}
                    {t.status === "approved" && (
                      <ActionButton size="xs" label="Retire"
                        onClick={() => setStatus.mutate({ id: t.id, status: "retired" })} />
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="h-fit rounded-lg border border-[color:var(--gold)]/30 bg-background/40 p-5 backdrop-blur">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Add logo treatment</div>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name (e.g. Chrome Chest Mark)"
          className="mt-3 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
        <select
          value={form.placement}
          onChange={(e) => setForm({ ...form, placement: e.target.value as LogoPlacement })}
          className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-xs uppercase tracking-[0.2em]"
        >
          {LOGO_PLACEMENTS.map((p) => <option key={p} value={p}>{p.replace("_", " ")}</option>)}
        </select>
        <input
          value={form.assetUrl}
          onChange={(e) => setForm({ ...form, assetUrl: e.target.value })}
          placeholder="Asset URL (PNG/SVG)"
          className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          value={form.colorTreatment}
          onChange={(e) => setForm({ ...form, colorTreatment: e.target.value })}
          placeholder="Color treatment (e.g. chrome on black)"
          className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          value={form.printMethod}
          onChange={(e) => setForm({ ...form, printMethod: e.target.value })}
          placeholder="Print method (DTG, embroidery, screen…)"
          className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          placeholder="Notes (optional)"
          className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={() => create.mutate()}
          disabled={!form.name || !form.assetUrl || create.isPending}
          className="mt-3 w-full rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--ink)] disabled:opacity-50"
        >
          {create.isPending ? "Submitting…" : "Submit for review"}
        </button>
      </aside>
    </div>
  );
}

// ============================================================
// Providers
// ============================================================
function ProvidersTab() {
  const listFn = useServerFn(listProviders);
  const { data, isLoading } = useQuery({
    queryKey: ["pod-providers"],
    queryFn: () => listFn(),
    staleTime: 60_000,
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Frass is provider-agnostic. Printful is set as the default target for Phase 2 integration, but new providers can be added without rebuilding the merchandise system.
      </p>
      <ul className="space-y-3">
        {(data ?? []).map((p: { id: string; name: string; slug: string; status: string; is_default: boolean; notes: string | null }) => (
          <li key={p.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="font-display text-lg">{p.name}</div>
                {p.is_default && (
                  <span className="rounded-sm border border-[color:var(--gold)]/50 px-2 py-0.5 text-[9px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
                    Default
                  </span>
                )}
              </div>
              {p.notes && <div className="mt-1 text-xs text-muted-foreground">{p.notes}</div>}
            </div>
            <StatusPill value={p.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================
// Audit
// ============================================================
function AuditTab() {
  const listFn = useServerFn(listMerchAudit);
  const { data, isLoading } = useQuery({
    queryKey: ["merch-audit"],
    queryFn: () => listFn({ data: { limit: 100 } }),
    staleTime: 30_000,
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading audit…</div>;
  if ((data ?? []).length === 0) return <EmptyState title="Audit is empty" body="Every submission, approval, adjustment, and rejection is recorded here as it happens." />;

  return (
    <ul className="space-y-1 font-mono text-xs">
      {(data ?? []).map((e: {
        id: number | string; event_type: string; entity_type: string | null; entity_id: string | null;
        payload: unknown; created_at: string;
      }) => (
        <li key={e.id} className="grid grid-cols-[160px_1fr] gap-4 border-b border-border/40 py-2">
          <span className="text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
          <span>
            <span className="text-[color:var(--gold)]">{e.event_type}</span>
            {e.entity_type && <span className="ml-2 text-muted-foreground">{e.entity_type}:{(e.entity_id ?? "").slice(0, 8)}</span>}
            {e.payload && typeof e.payload === "object" && Object.keys(e.payload as object).length > 0 ? (
              <span className="ml-2 text-muted-foreground">{JSON.stringify(e.payload)}</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ============================================================
// Shared bits
// ============================================================
function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 px-6 py-16 text-center">
      <div className="font-display text-xl">{title}</div>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const cls =
    value === "approved" || value === "connected" ? "border-[color:var(--gold)]/60 text-[color:var(--gold)]"
      : value === "rejected" || value === "disabled" ? "border-red-500/40 text-red-400"
      : value === "retired" ? "border-border text-muted-foreground"
      : "border-border/60 text-muted-foreground";
  return (
    <span className={`inline-block rounded-sm border px-2 py-0.5 text-[9px] uppercase tracking-[0.24em] ${cls}`}>
      {value.replace("_", " ")}
    </span>
  );
}

function TierPill({ value }: { value: string }) {
  return (
    <span className="inline-block rounded-sm border border-border/60 px-2 py-0.5 text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
      {value}
    </span>
  );
}

function ActionButton({
  label, onClick, variant, size,
}: {
  label: string;
  onClick: () => void;
  variant?: "gold" | "danger";
  size?: "xs";
}) {
  const base = size === "xs"
    ? "px-2.5 py-1 text-[10px]"
    : "px-3 py-1.5 text-[11px]";
  const color =
    variant === "gold"
      ? "border-[color:var(--gold)] bg-[color:var(--gold)] text-[color:var(--ink)]"
      : variant === "danger"
        ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
        : "border-border hover:border-[color:var(--gold)]";
  return (
    <button
      onClick={onClick}
      className={`${base} rounded-sm border font-semibold uppercase tracking-[0.24em] transition ${color}`}
    >
      {label}
    </button>
  );
}

// Silence unused re-exports we might use in Phase 2.
void PROPOSAL_STATUSES;
void QUALITY_TIERS;
type _Unused = QualityTier;
