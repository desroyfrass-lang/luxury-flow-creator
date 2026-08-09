// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0401/0407 — Frass Vision Studios (FV Studios). Frassy creates, the creator directs.
// Manual editing is always free; AI work is forecast, approved, then billed.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Film,
  Sparkles,
  Wand2,
  Layers,
  SlidersHorizontal,
  Volume2,
  Upload,
  Send,
  Scissors,
  Info,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PhoneContentMode } from "@/components/studio/phone-content-mode";
import { ExportWatermarkPanel } from "@/components/studio/export-watermark";
import type { QualityReport } from "@/lib/studio/phone-content-mode";
import { FREE_CAPABILITIES, formatDuration, unitLabel, usdFor } from "@/lib/studio/credits";

import { DIRECTOR_EXAMPLES, planFromDirection, type DirectorPlan } from "@/lib/studio/director";
import {
  createStudioProject,
  getWallet,
  listLedger,
  listStudioProjects,
  runStudioOperation,
} from "@/lib/studio.functions";

export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({
    meta: [
      { title: "Frass Vision Studios (FV Studios) — Frass Hill" },
      {
        name: "description",
        content:
          "Frass Vision Studios, known throughout Frass as FV Studios: describe the edit and Frassy builds it, with a full professional timeline underneath whenever you want to take the controls.",
      },
      { property: "og:title", content: "Frass Vision Studios (FV Studios) — Frass Hill" },
      {
        property: "og:description",
        content: "Frassy creates. You direct. The flagship creative production environment of Frass Hill.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: StudioPage,
});

const DESTINATIONS = [
  "youtube",
  "tiktok",
  "instagram",
  "facebook",
  "x",
  "linkedin",
  "podcast",
  "for-us",
  "academy",
  "marketplace",
  "internal",
];

const TIMELINE_TOOLS = [
  "Trim",
  "Split",
  "Ripple",
  "Slip",
  "Slide",
  "Keyframes",
  "Speed ramp",
  "Markers",
  "Multicam",
  "Nested timeline",
];

function StudioPage() {
  const wallet = useServerFn(getWallet);
  const ledgerFn = useServerFn(listLedger);
  const projectsFn = useServerFn(listStudioProjects);
  const createProject = useServerFn(createStudioProject);
  const runOp = useServerFn(runStudioOperation);
  const qc = useQueryClient();

  const walletQ = useQuery({ queryKey: ["ai-wallet"], queryFn: () => wallet() });
  const ledgerQ = useQuery({ queryKey: ["ai-ledger"], queryFn: () => ledgerFn() });
  const projectsQ = useQuery({ queryKey: ["studio-projects"], queryFn: () => projectsFn() });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [destination, setDestination] = useState("youtube");
  const [direction, setDirection] = useState("");
  const [plan, setPlan] = useState<DirectorPlan | null>(null);
  const [why, setWhy] = useState(false);

  const projects = projectsQ.data ?? [];
  const active = useMemo(
    () => projects.find((p) => p.id === activeId) ?? projects[0] ?? null,
    [projects, activeId],
  );

  const add = useMutation({
    mutationFn: () => createProject({ data: { title: newTitle, destination } }),
    onSuccess: (p) => {
      setNewTitle("");
      setActiveId(p.id);
      toast.success("Production created. Nothing charged — the Studio is always free to open.");
      void qc.invalidateQueries({ queryKey: ["studio-projects"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const run = useMutation({
    mutationFn: () => {
      if (!plan) throw new Error("Nothing approved.");
      return runOp({
        data: {
          projectId: active?.id,
          request: plan.forecast.request,
          label: plan.understanding,
          lines: plan.forecast.lines.map((l) => ({
            key: l.key,
            label: l.label,
            credits: l.credits,
            qty: l.qty,
          })),
          total: plan.forecast.total,
          seconds: plan.forecast.seconds,
        },
      });
    },
    onSuccess: (r) => {
      setPlan(null);
      setDirection("");
      toast.success(
        `Done — ${r.charged.toLocaleString()} AI Credits used. ${r.balance.toLocaleString()} remaining.`,
      );
      void qc.invalidateQueries({ queryKey: ["ai-wallet"] });
      void qc.invalidateQueries({ queryKey: ["ai-ledger"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // FRASS-0406 — Phone Content Mode™ runs through the same credit pipeline.
  const runPhone = useMutation({
    mutationFn: (report: QualityReport) =>
      runOp({
        data: {
          projectId: active?.id,
          request: `Phone Content Mode™ — ${report.preset.label} (${report.minutes} min)`,
          label: `Phone Content Mode™ · ${report.preset.label}`,
          lines: report.forecast.lines.map((l) => ({
            key: l.key,
            label: l.label,
            credits: l.credits,
            qty: l.qty,
          })),
          total: report.forecast.total,
          seconds: report.forecast.seconds,
        },
      }),
    onSuccess: (r) => {
      toast.success(
        `Enhanced — ${r.charged.toLocaleString()} AI Credits used. ${r.balance.toLocaleString()} remaining.`,
      );
      void qc.invalidateQueries({ queryKey: ["ai-wallet"] });
      void qc.invalidateQueries({ queryKey: ["ai-ledger"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });



  const w = walletQ.data;
  const projected = w ? Math.round((w.month_used / new Date().getDate()) * 30) : 0;

  return (
    <SiteShell>
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-10 sm:px-6">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-amber-300/70">FRASS-0401</p>
              <h1 className="mt-2 flex items-center gap-3 text-3xl font-light tracking-wide sm:text-4xl">
                <Film className="h-7 w-7 text-amber-300" /> Frass Vision Studios
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/60">
                Known throughout Frass as FV Studios. Frassy creates. You direct. Describe the edit
                and she builds it — the full professional timeline is underneath whenever you
                want to take the controls.
              </p>
            </div>
            <CreditMeter
              balance={w?.balance ?? 0}
              today={w?.today_used ?? 0}
              month={w?.month_used ?? 0}
              projected={projected}
            />
          </header>

          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
            {/* Media Library */}
            <aside className="space-y-4">
              <Panel title="Media Library" icon={Upload}>
                <p className="text-xs text-white/50">
                  Everything you drop into the Frassy Composer lands here — uploads, captures,
                  Vault assets and brand files. Organising media is always free.
                </p>
                <Link
                  to="/room"
                  className="mt-3 block rounded-lg border border-white/15 px-3 py-2 text-center text-xs uppercase tracking-widest text-white/70 hover:border-amber-300/50"
                >
                  Open Composer to add media
                </Link>
              </Panel>

              <Panel title="Productions" icon={Layers}>
                <div className="space-y-1">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setActiveId(p.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                        active?.id === p.id
                          ? "bg-amber-300/10 text-amber-200"
                          : "text-white/60 hover:bg-white/5"
                      }`}
                    >
                      <span className="block truncate">{p.title}</span>
                      <span className="text-[10px] uppercase tracking-widest text-white/35">
                        {p.destination} · {p.status}
                      </span>
                    </button>
                  ))}
                  {projects.length === 0 && !projectsQ.isLoading && (
                    <p className="text-xs text-white/40">No productions yet.</p>
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="New production name"
                    className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-xs outline-none focus:border-amber-300/50"
                  />
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-xs capitalize outline-none"
                  >
                    {DESTINATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => add.mutate()}
                    disabled={add.isPending || !newTitle.trim()}
                    className="w-full rounded-lg bg-amber-300/90 px-3 py-2 text-xs font-medium uppercase tracking-widest text-black disabled:opacity-40"
                  >
                    Create production
                  </button>
                </div>
              </Panel>
            </aside>

            {/* Monitor + Director + Timeline */}
            <main className="space-y-5">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="flex aspect-video items-center justify-center bg-gradient-to-b from-white/[0.04] to-black">
                  <div className="text-center">
                    <Film className="mx-auto h-10 w-10 text-white/20" />
                    <p className="mt-3 text-sm text-white/60">
                      {active ? active.title : "Preview Monitor"}
                    </p>
                    <p className="mt-1 text-xs text-white/35">
                      {active
                        ? `Directing for ${active.destination}`
                        : "Create a production to start directing."}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Director */}
              <Panel title="AI Director" icon={Sparkles}>
                <div className="flex flex-wrap gap-1.5">
                  {DIRECTOR_EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setDirection(ex)}
                      className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/60 hover:border-amber-300/50 hover:text-amber-200"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
                <form
                  className="mt-3 flex items-end gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!direction.trim()) return;
                    setPlan(planFromDirection(direction));
                    setWhy(false);
                  }}
                >
                  <textarea
                    rows={2}
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    placeholder="Tell Frassy what you want — “make this cinematic and cut it to 30 seconds”"
                    className="flex-1 resize-none rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm outline-none focus:border-amber-300/50"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-300/90 p-3 text-black"
                    aria-label="Forecast this edit"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

                {plan && (
                  <ForecastCard
                    plan={plan}
                    balance={w?.balance ?? 0}
                    running={run.isPending}
                    why={why}
                    onWhy={() => setWhy((v) => !v)}
                    onApprove={() => run.mutate()}
                    onCancel={() => setPlan(null)}
                    onLighter={() => {
                      if (!plan.forecast.saving) return;
                      toast("Swapped generated shots for Vault footage — forecast updated.");
                      setPlan({
                        ...plan,
                        forecast: {
                          ...plan.forecast,
                          total: plan.forecast.total - plan.forecast.saving.credits,
                          lines: plan.forecast.lines.map((l) =>
                            l.key === "ai-video-generation" || l.key === "ai-broll"
                              ? { ...l, credits: Math.round(l.credits * 0.4) }
                              : l,
                          ),
                          saving: undefined,
                        },
                      });
                    }}
                  />
                )}
              </Panel>

              {/* FRASS-0406 — Phone Content Mode™ */}
              <PhoneContentMode
                balance={w?.balance ?? 0}
                running={runPhone.isPending}
                onRun={(report) => runPhone.mutate(report)}
              />


              {/* Professional timeline */}
              <Panel title="Timeline — manual editing, always free" icon={Scissors}>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {TIMELINE_TOOLS.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-white/45"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {[
                    { name: "V2 · Titles & graphics", tone: "bg-amber-300/25" },
                    { name: "V1 · Main footage", tone: "bg-white/20" },
                    { name: "A1 · Voice", tone: "bg-emerald-300/25" },
                    { name: "A2 · Music", tone: "bg-sky-300/25" },
                  ].map((track) => (
                    <div key={track.name} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 truncate text-[11px] text-white/45">
                        {track.name}
                      </span>
                      <div className="flex h-8 flex-1 gap-1 rounded-md bg-white/[0.03] p-1">
                        {[3, 5, 2, 4, 6].map((flex, i) => (
                          <div
                            key={i}
                            style={{ flex }}
                            className={`rounded-sm ${track.tone} transition hover:brightness-125`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-white/40">
                  Every AI edit lands here as normal clips. Nothing Frassy does is locked — you can
                  trim, replace or undo any of it without spending a credit.
                </p>
              </Panel>
            </main>

            {/* Inspector / Effects / Mixer / Export */}
            <aside className="space-y-4">
              <ExportWatermarkPanel />
              <Panel title="Inspector" icon={SlidersHorizontal}>


                <ul className="space-y-1.5 text-xs text-white/55">
                  <li>Transform · Scale · Position · Rotation</li>
                  <li>Colour · Exposure · Contrast · Balance</li>
                  <li>Speed ramps and time remap</li>
                  <li>Opacity and blend modes</li>
                </ul>
              </Panel>
              <Panel title="Audio Mixer" icon={Volume2}>
                <ul className="space-y-1.5 text-xs text-white/55">
                  <li>Multitrack · EQ · Compressor · Limiter</li>
                  <li>Noise reduction · Music ducking</li>
                  <li>AI mastering (charged per minute)</li>
                </ul>
              </Panel>
              <Panel title="Free in the Studio" icon={Wand2}>
                <ul className="space-y-1 text-[11px] text-white/50">
                  {FREE_CAPABILITIES.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
              </Panel>
              <Panel title="Recent AI receipts" icon={Info}>
                <div className="space-y-2">
                  {(ledgerQ.data ?? []).slice(0, 8).map((l) => (
                    <div key={l.id} className="flex items-start justify-between gap-2 text-[11px]">
                      <span className="text-white/60">{l.label}</span>
                      <span
                        className={l.direction === "debit" ? "text-amber-200" : "text-emerald-300"}
                      >
                        {l.direction === "debit" ? "−" : "+"}
                        {l.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {(ledgerQ.data ?? []).length === 0 && (
                    <p className="text-[11px] text-white/40">
                      No AI work billed yet. Manual editing never appears here.
                    </p>
                  )}
                </div>
                <Link
                  to="/financial-center"
                  className="mt-3 block text-[11px] uppercase tracking-widest text-amber-300/80 hover:text-amber-200"
                >
                  Open Creator Wallet →
                </Link>
              </Panel>
            </aside>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Film;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <h2 className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/45">
        <Icon className="h-3.5 w-3.5" /> {title}
      </h2>
      {children}
    </section>
  );
}

function CreditMeter({
  balance,
  today,
  month,
  projected,
}: {
  balance: number;
  today: number;
  month: number;
  projected: number;
}) {
  const cells = [
    { label: "AI Credits available", value: balance, accent: true },
    { label: "Today", value: today },
    { label: "This month", value: month },
    { label: "Projected month", value: projected },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {cells.map((c) => (
        <div
          key={c.label}
          className={`rounded-xl border px-4 py-3 ${
            c.accent ? "border-amber-300/40 bg-amber-300/5" : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{c.label}</p>
          <p
            className={`mt-1 text-lg font-light ${c.accent ? "text-amber-200" : "text-white/80"}`}
          >
            {c.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

function ForecastCard({
  plan,
  balance,
  running,
  why,
  onWhy,
  onApprove,
  onCancel,
  onLighter,
}: {
  plan: DirectorPlan;
  balance: number;
  running: boolean;
  why: boolean;
  onWhy: () => void;
  onApprove: () => void;
  onCancel: () => void;
  onLighter: () => void;
}) {
  const f = plan.forecast;
  const affordable = balance >= f.total;
  return (
    <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/[0.04] p-4">
      <p className="text-[11px] uppercase tracking-[0.25em] text-amber-300/80">Credit forecast</p>
      <p className="mt-2 text-sm text-white/85">{plan.understanding}</p>

      <div className="mt-3 space-y-1.5">
        {f.lines.map((l) => (
          <div key={l.key} className="flex items-start justify-between gap-3 text-xs">
            <span className="text-white/60">
              {l.label} <span className="text-white/35">· {unitLabel(l.unit, l.qty)}</span>
            </span>
            <span className="shrink-0 text-white/80">{l.credits.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Estimated total</p>
          <p className="text-2xl font-light text-amber-200">{f.total.toLocaleString()} Credits</p>
          <p className="text-[11px] text-white/40">
            ≈ {usdFor(f.total)} of compute · about {formatDuration(f.seconds)} to process
          </p>
        </div>
        <p className="text-[11px] text-white/40">
          Balance after: {(balance - f.total).toLocaleString()}
        </p>
      </div>

      {f.saving && (
        <button
          onClick={onLighter}
          className="mt-3 w-full rounded-lg border border-emerald-300/30 bg-emerald-300/5 px-3 py-2 text-left text-[11px] text-emerald-200/90"
        >
          Credit Intelligence · {f.saving.note} Saves about{" "}
          {f.saving.credits.toLocaleString()} Credits.
        </button>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={onApprove}
          disabled={running || !affordable}
          className="rounded-lg bg-amber-300/90 px-4 py-2 text-xs font-medium uppercase tracking-widest text-black disabled:opacity-40"
        >
          {running ? "Working…" : affordable ? "Approve & run" : "Not enough credits"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-white/15 px-4 py-2 text-xs uppercase tracking-widest text-white/60"
        >
          Cancel
        </button>
        <button onClick={onWhy} className="text-[11px] text-white/45 underline underline-offset-4">
          Why?
        </button>
      </div>

      {why && (
        <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-3 text-[11px] text-white/60">
          {plan.reasoning.map((r) => (
            <p key={r} className="mb-1.5">
              {r}
            </p>
          ))}
          <p className="text-white/45">{plan.manual}</p>
        </div>
      )}
    </div>
  );
}
