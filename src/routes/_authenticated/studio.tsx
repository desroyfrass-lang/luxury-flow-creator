// FRASS-0401/0407 — Frass Vision Studios (FV Studios).
// UX pass 2: ONE SCREEN = ONE CURRENT JOB.
// The command centre sits at eye level, Frassy sits beside it, and every
// result, forecast, blocker or finished output is brought to the creator in
// the same place. This route is presentation only — commissioning, verified
// output and credit truth all stay server-side.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  BookOpen,
  Camera,
  ChevronRight,
  Clapperboard,
  Film,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  Library,
  Mic2,
  MonitorPlay,
  Music2,
  Plus,
  Scissors,
  Send,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Volume2,
  Wand2,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { FrassyChat } from "@/components/frassy-chat";
import { PhoneContentMode } from "@/components/studio/phone-content-mode";
import { VoiceFeedbackButton } from "@/components/feedback/voice-feedback";
import { CreationOpportunities } from "@/components/creation/opportunity-panel";
import { ExportWatermarkPanel } from "@/components/studio/export-watermark";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ControlDepthBar } from "@/components/studio/control-depth-bar";
import { A1MasterPanel } from "@/components/studio/a1-master-panel";
import studioEntry from "@/assets/studio-entry.jpg";
import type { QualityReport } from "@/lib/studio/phone-content-mode";
import { FREE_CAPABILITIES, formatDuration, unitLabel, usdFor, buildForecast } from "@/lib/studio/credits";
import { A1_CLEAN_BUCKET, processA1Clean } from "@/lib/studio/a1-clean";
import { supabase } from "@/integrations/supabase/client";
import type { A1Evidence } from "@/lib/studio/a1-standard";
import { DIRECTOR_EXAMPLES, planFromDirection, type DirectorPlan } from "@/lib/studio/director";
import {
  createStudioProject,
  getWallet,
  listLedger,
  listStudioProjects,
  runStudioOperation,
  prepareA1CleanJob,
  finalizeA1CleanJob,
  getStudioA1Evidence,
  setStudioControlDepth,
} from "@/lib/studio.functions";
import { controlDepth, depthIndex, describeDepthChange, type ControlDepthId } from "@/lib/studio/control-depths";
import { useIsAdminStatus } from "@/hooks/use-is-admin";

export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({
    meta: [
      { title: "Frass Vision Studios (FV Studios) — Frass Hill" },
      { name: "description", content: "Enter Frass Vision Studios to plan, direct, edit and finish one production with Frassy beside you." },
      { property: "og:title", content: "Frass Vision Studios (FV Studios) — Frass Hill" },
      { property: "og:description", content: "A creator-first production room for Frass Originals and every Builder story." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: StudioPage,
});

const DESTINATIONS = ["youtube", "tiktok", "instagram", "facebook", "x", "linkedin", "podcast", "for-us", "academy", "marketplace", "internal"];

const CREATION_DOORS = [
  { id: "podcast", label: "Podcast / Audio", icon: Mic2, destination: "podcast", lane: "audio", note: "Episodes, interviews, spoken work" },
  { id: "music", label: "Music", icon: Music2, destination: "internal", lane: "audio", note: "Songs, scores, sound-led work" },
  { id: "music-video", label: "Video / Music Video", icon: MonitorPlay, destination: "youtube", lane: "visual", note: "Visual stories and performances" },
  { id: "animation", label: "Animation", icon: Wand2, destination: "youtube", lane: "visual", note: "Characters, scenes, movement" },
  { id: "film", label: "Film / Documentary", icon: Clapperboard, destination: "internal", lane: "visual", note: "Long-form and real-world film" },
  { id: "photography", label: "Photography / Images", icon: Camera, destination: "internal", lane: "visual", note: "Shoots, campaigns, image sets" },
] as const;

type CreationDoor = (typeof CREATION_DOORS)[number];

const TABS = [
  { id: "create", label: "Create", icon: Sparkles },
  { id: "production", label: "Production", icon: Film },
  { id: "assets", label: "Assets", icon: FolderOpen },
  { id: "edit", label: "Edit", icon: Scissors },
  { id: "quality", label: "A1 / Quality", icon: Shield },
  { id: "export", label: "Export", icon: Upload },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Surfaced =
  | { kind: "forecast"; plan: DirectorPlan }
  | { kind: "working"; title: string; body: string }
  | { kind: "blocked"; title: string; body: string }
  | { kind: "done"; title: string; body: string };

const TIMELINE_TRACKS = [
  { name: "V2 · Titles & graphics", tone: "bg-accent/25" },
  { name: "V1 · Main footage", tone: "bg-chrome/20" },
  { name: "A1 · Voice", tone: "bg-primary/20" },
  { name: "A2 · Music", tone: "bg-muted-foreground/20" },
];

function StudioPage() {
  const wallet = useServerFn(getWallet);
  const ledgerFn = useServerFn(listLedger);
  const projectsFn = useServerFn(listStudioProjects);
  const createProject = useServerFn(createStudioProject);
  const runOp = useServerFn(runStudioOperation);
  const setDepth = useServerFn(setStudioControlDepth);
  const prepareClean = useServerFn(prepareA1CleanJob);
  const finalizeClean = useServerFn(finalizeA1CleanJob);
  const evidenceFn = useServerFn(getStudioA1Evidence);
  const qc = useQueryClient();
  const { isAdmin } = useIsAdminStatus();

  const walletQ = useQuery({ queryKey: ["ai-wallet"], queryFn: () => wallet() });
  const ledgerQ = useQuery({ queryKey: ["ai-ledger"], queryFn: () => ledgerFn() });
  const projectsQ = useQuery({ queryKey: ["studio-projects"], queryFn: () => projectsFn() });

  const [arrival, setArrival] = useState(true);
  const [tab, setTab] = useState<TabId>("create");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [destination, setDestination] = useState("podcast");
  const [task, setTask] = useState<CreationDoor | null>(null);
  const [creating, setCreating] = useState(false);
  const [direction, setDirection] = useState("");
  const [why, setWhy] = useState(false);
  const [surfaced, setSurfaced] = useState<Surfaced | null>(null);
  const [preview, setPreview] = useState<{ label: string; url: string } | null>(null);
  const [credits, setCredits] = useState(false);
  const [further, setFurther] = useState(false);

  // The cinematic entrance dissolves on its own; the working dashboard is
  // already mounted underneath at eye level.
  useEffect(() => {
    const t = setTimeout(() => setArrival(false), 2200);
    return () => clearTimeout(t);
  }, []);

  const projects = projectsQ.data ?? [];
  const active = useMemo(() => projects.find((p) => p.id === activeId) ?? projects[0] ?? null, [projects, activeId]);
  const evidenceQ = useQuery({
    queryKey: ["studio-a1-evidence", active?.production_id],
    queryFn: () => evidenceFn({ data: { productionId: active?.production_id } }),
    enabled: Boolean(active?.production_id),
  });
  const currentDepth = controlDepth(active?.control_depth).id;
  const currentDepthIndex = depthIndex(currentDepth);
  const directed = currentDepthIndex === 0;
  const w = walletQ.data;
  const projected = w ? Math.round((w.month_used / new Date().getDate()) * 30) : 0;
  const audioLane = task?.lane === "audio" || active?.destination === "podcast";

  const chooseDoor = (door: CreationDoor) => {
    setTask(door);
    setDestination(door.destination);
    setNewTitle("");
    setTab("create");
  };

  const add = useMutation({
    mutationFn: () => createProject({ data: { title: newTitle.trim() || `Untitled ${task?.label ?? "production"}`, destination } }),
    onSuccess: (p) => {
      setNewTitle("");
      setActiveId(p.id);
      setCreating(false);
      void qc.invalidateQueries({ queryKey: ["studio-projects"] });
      setSurfaced({ kind: "done", title: "Production open", body: "Nothing was charged — opening a production is always free. Your next step is waiting in the command centre." });
    },
    onError: (e: Error) => setSurfaced({ kind: "blocked", title: "Could not open the production", body: e.message }),
  });

  const run = useMutation({
    mutationFn: (plan: DirectorPlan) =>
      runOp({
        data: {
          projectId: active?.id,
          request: plan.forecast.request,
          label: plan.understanding,
          lines: plan.forecast.lines.map((l) => ({ key: l.key, label: l.label, credits: l.credits, qty: l.qty })),
          total: plan.forecast.total,
          seconds: plan.forecast.seconds,
        },
      }),
    onSuccess: (r) => {
      setDirection("");
      setSurfaced(
        r.status === "blocked"
          ? { kind: "blocked", title: "That machine is not installed", body: r.message }
          : { kind: "working", title: "Approved and queued", body: r.message },
      );
      void qc.invalidateQueries({ queryKey: ["ai-wallet"] });
      void qc.invalidateQueries({ queryKey: ["ai-ledger"] });
    },
    onError: (e: Error) => setSurfaced({ kind: "blocked", title: "That could not run", body: e.message }),
  });

  const depth = useMutation({
    mutationFn: (next: ControlDepthId) => {
      if (!active) throw new Error("Open a production first.");
      return setDepth({ data: { projectId: active.id, depth: next } });
    },
    onSuccess: (p) => {
      toast.success(describeDepthChange(controlDepth(active?.control_depth).id, controlDepth(p.control_depth).id).message);
      void qc.invalidateQueries({ queryKey: ["studio-projects"] });
    },
    onError: (e: Error) => setSurfaced({ kind: "blocked", title: "Control depth unchanged", body: e.message }),
  });

  const runPhone = useMutation({
    mutationFn: async ({ report, file }: { report: QualityReport; file: File }) => {
      if (!active) throw new Error("Open a production first.");
      const forecast = buildForecast("FRASS Native A1 Clean", [{ key: "voice-enhance", qty: report.minutes }]);
      const queued = await runOp({
        data: {
          projectId: active.id,
          request: `FRASS Native A1 Clean — ${report.preset.label} (${report.minutes} min)`,
          label: "FRASS Native A1 Clean",
          lines: forecast.lines.map((l) => ({ key: l.key, label: l.label, credits: l.credits, qty: l.qty })),
          total: forecast.total,
          seconds: forecast.seconds,
        },
      });
      if (queued.status === "blocked") throw new Error(queued.message);
      const prepared = await prepareClean({ data: { jobId: queued.jobId } });
      const output = await processA1Clean(file);
      const sourceUpload = await supabase.storage.from(A1_CLEAN_BUCKET).upload(prepared.source, file, { contentType: file.type, upsert: false });
      if (sourceUpload.error) throw new Error(`Source preservation failed: ${sourceUpload.error.message}`);
      const outputUpload = await supabase.storage.from(A1_CLEAN_BUCKET).upload(prepared.output, output, { contentType: "audio/wav", upsert: false });
      if (outputUpload.error) {
        await supabase.storage.from(A1_CLEAN_BUCKET).remove([prepared.source]);
        throw new Error(`Processed output upload failed: ${outputUpload.error.message}`);
      }
      const verified = await finalizeClean({
        data: {
          jobId: queued.jobId,
          sourcePath: prepared.source,
          outputPath: prepared.output,
          sourceMime: file.type,
          sourceBytes: file.size,
          outputBytes: output.size,
          processedAt: new Date().toISOString(),
        },
      });
      const signed = await supabase.storage.from(A1_CLEAN_BUCKET).createSignedUrl(prepared.output, 3600);
      return { verified, url: signed.data?.signedUrl ?? null };
    },
    onMutate: () => setSurfaced({ kind: "working", title: "A1 Clean is running", body: "Your recording is being cleaned on this device. The source file is kept untouched." }),
    onSuccess: ({ verified, url }) => {
      if (url) setPreview({ label: "A1 Clean — cleaned audio", url });
      setSurfaced({
        kind: "done",
        title: "Cleaned and verified",
        body: `${verified.charged.toLocaleString()} credits charged once, after the finished file was verified. This is cleaned/restored audio — it is not A1 Master approved.`,
      });
      void qc.invalidateQueries({ queryKey: ["ai-wallet"] });
      void qc.invalidateQueries({ queryKey: ["ai-ledger"] });
      void qc.invalidateQueries({ queryKey: ["studio-projects"] });
      void qc.invalidateQueries({ queryKey: ["studio-a1-evidence"] });
    },
    onError: (e: Error) => setSurfaced({ kind: "blocked", title: "A1 Clean did not finish", body: `${e.message} Nothing was charged.` }),
  });

  const needsProduction = !active || creating;
  const primary = needsProduction
    ? { label: task ? "Open this production" : "Choose what you're making", onClick: () => { setTab("create"); if (task) add.mutate(); } }
    : audioLane
      ? { label: "Upload audio for A1 Clean", onClick: () => { setTab("create"); document.getElementById("fv-workspace")?.querySelector<HTMLInputElement>('input[type="file"]')?.click(); } }
      : { label: "Ask Frassy for the next step", onClick: () => document.getElementById("director-direction")?.focus() };

  return (
    <SiteShell>
      <div className="fv-studio min-h-screen bg-background pb-24 text-foreground lg:pb-0">
        {arrival ? (
          <button
            type="button"
            onClick={() => setArrival(false)}
            aria-label="Enter the studio"
            className="fixed inset-0 z-50 animate-fade-in cursor-pointer"
          >
            <img src={studioEntry} alt="Eye-level entrance into the FV Studios production room" className="h-full w-full object-cover" fetchPriority="high" />
            <span className="absolute inset-0 bg-background/70" aria-hidden="true" />
            <span className="absolute inset-0 grid place-items-center px-6 text-center">
              <span className="block">
                <span className="block font-display text-4xl uppercase leading-none sm:text-6xl">Frass Vision Studios</span>
                <span className="mt-3 block text-sm text-muted-foreground">Entering the studio…</span>
              </span>
            </span>
          </button>
        ) : null}

        {/* Compact, persistent studio header: where I am, what I'm on, what it costs. */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2 sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-accent/40 bg-accent/10"><Film className="h-4 w-4 text-accent" /></span>
              <select
                aria-label="Current production"
                value={active?.id ?? ""}
                onChange={(e) => { setActiveId(e.target.value); setCreating(false); }}
                className="h-10 min-w-0 max-w-[15rem] flex-1 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="">No production open</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <span className="hidden shrink-0 rounded-full border border-border px-2.5 py-1 text-xs uppercase text-muted-foreground sm:inline">{controlDepth(active?.control_depth).label}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCredits(true)} className="h-10">{(w?.balance ?? 0).toLocaleString()} cr</Button>
              {isAdmin === true ? (
                <Button size="sm" asChild className="h-10 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/studios" aria-label="Founder Originals"><Shield className="h-4 w-4" /> <span className="hidden sm:inline">Founder Originals</span></Link>
                </Button>
              ) : null}
              <div className="hidden sm:block"><VoiceFeedbackButton source="studio" /></div>
            </div>
          </div>
          <nav aria-label="Studio sections" className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-3 pb-2 sm:px-5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const on = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-current={on ? "page" : undefined}
                  className={`flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm ${on ? "bg-accent/15 text-accent" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
            <button type="button" onClick={() => setFurther(true)} className="ml-auto flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-4 w-4" /> Take it further
            </button>
          </nav>
        </header>

        {/* Command centre — one screen, one current job. */}
        <main className="mx-auto grid max-w-[1600px] gap-4 px-3 py-4 sm:px-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 space-y-3" aria-label="Command centre">
            <div className="relative grid min-h-[32vh] place-items-center overflow-hidden rounded-lg border border-border bg-card/40 p-5">
              {preview ? (
                <div className="w-full max-w-xl text-center">
                  <p className="text-xs uppercase text-accent">{preview.label}</p>
                  <audio controls src={preview.url} className="mt-3 w-full" />
                  <p className="mt-2 text-xs text-muted-foreground">Cleaned and verified. Not A1 Master approved.</p>
                </div>
              ) : (
                <div className="max-w-md text-center">
                  <MonitorPlay className="mx-auto h-10 w-10 text-accent/55" />
                  <p className="mt-3 text-lg">{active ? active.title : "No production open"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{active ? `${task?.label ?? active.destination} · no verified output yet` : "Pick what you are making below."}</p>
                </div>
              )}
              <div className="absolute bottom-3 left-4 hidden gap-2 text-xs uppercase text-muted-foreground sm:flex">
                <span className="rounded-full border border-border bg-background/80 px-3 py-1">Preview</span>
                <span className="rounded-full border border-border bg-background/80 px-3 py-1">{preview ? "Cleaned output" : "No output claimed"}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-accent/30 bg-accent/[0.05] p-3">
              <Button onClick={primary.onClick} className="min-h-12 flex-1 bg-accent text-accent-foreground hover:bg-accent/90 sm:flex-none">
                {primary.label} <ArrowRight />
              </Button>
              {active ? <Button variant="outline" className="min-h-12" onClick={() => { setTask(null); setCreating(true); setTab("create"); }}><Plus /> New production</Button> : null}
              <span className="text-xs text-muted-foreground">Nothing runs and nothing is charged until you approve it.</span>
            </div>

            <div id="fv-workspace" className="rounded-lg border border-border bg-card/35 p-3 sm:p-4">
              {tab === "create" ? (
                <CreateWorkspace
                  task={task}
                  creating={creating}
                  active={active}
                  audioLane={audioLane}
                  newTitle={newTitle}
                  destination={destination}
                  adding={add.isPending}
                  balance={w?.balance ?? 0}
                  running={runPhone.isPending}
                  onTitle={setNewTitle}
                  onDestination={setDestination}
                  onChoose={chooseDoor}
                  onOpen={() => add.mutate()}
                  onRunClean={(report, file) => runPhone.mutate({ report, file })}
                  onAskFrassy={() => document.getElementById("director-direction")?.focus()}
                />
              ) : null}
              {tab === "production" ? (
                <div className="space-y-3">
                  <ControlDepthBar depth={currentDepth} productionTitle={active?.title ?? null} disabled={!active || depth.isPending} onChange={(next) => depth.mutate(next)} />
                  <p className="text-sm text-muted-foreground">{active ? `Destination: ${active.destination}.` : "Open a production in Create first."}</p>
                </div>
              ) : null}
              {tab === "assets" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button variant="outline" asChild className="min-h-12 justify-start"><Link to="/room"><Library /> Studio Library</Link></Button>
                  <Button variant="outline" asChild className="min-h-12 justify-start"><Link to="/vault"><FolderOpen /> Your Vault</Link></Button>
                  <p className="text-sm text-muted-foreground sm:col-span-2">Source files you bring in are preserved. Cleaned outputs are saved as separate, owned versions.</p>
                </div>
              ) : null}
              {tab === "edit" ? <EditWorkspace directed={directed} depth={currentDepth} audioLane={audioLane} /> : null}
              {tab === "quality" ? <A1MasterPanel evidence={(evidenceQ.data ?? {}) as A1Evidence} /> : null}
              {tab === "export" ? <ExportWatermarkPanel /> : null}
            </div>
          </section>

          {/* Frassy is always beside the work, never below it. */}
          <aside className="min-w-0 space-y-3" aria-label="Frassy, your AI director">
            <div className="rounded-lg border border-border bg-card/55 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/15"><Sparkles className="text-accent" /></span>
                <div className="min-w-0"><p className="text-xs uppercase text-accent">At the console</p><h2 className="truncate font-display text-lg uppercase">Frassy · AI Director</h2></div>
              </div>
              <form
                className="mt-3"
                onSubmit={(e) => { e.preventDefault(); if (!direction.trim()) return; setWhy(false); setSurfaced({ kind: "forecast", plan: planFromDirection(direction) }); }}
              >
                <label className="text-sm text-muted-foreground" htmlFor="director-direction">What should Frassy do?</label>
                <textarea id="director-direction" rows={3} value={direction} onChange={(e) => setDirection(e.target.value)} placeholder="Clean up this interview and cut it to 30 seconds…" className="mt-2 w-full resize-none rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-accent" />
                <Button type="submit" disabled={!direction.trim()} className="mt-2 min-h-12 w-full bg-accent text-accent-foreground hover:bg-accent/90"><Send /> Show me the plan and the cost</Button>
              </form>
              {directed ? null : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {DIRECTOR_EXAMPLES.slice(0, 3).map((ex) => (
                    <Button key={ex} variant="outline" size="sm" onClick={() => setDirection(ex)} className="h-auto whitespace-normal text-left">{ex}</Button>
                  ))}
                </div>
              )}
              <details className="mt-3 border-t border-border pt-3">
                <summary className="min-h-11 cursor-pointer text-sm font-medium">Open full conversation with Frassy</summary>
                <div className="mt-3"><FrassyChat embedded tone="dark" /></div>
              </details>
            </div>
          </aside>
        </main>

        {/* Mobile: the current job's primary action stays in reach. */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
          <Button onClick={primary.onClick} className="min-h-12 w-full bg-accent text-accent-foreground hover:bg-accent/90">{primary.label} <ArrowRight /></Button>
        </div>
      </div>

      <ResultDialog
        surfaced={surfaced}
        balance={w?.balance ?? 0}
        running={run.isPending}
        why={why}
        onWhy={() => setWhy((v) => !v)}
        onClose={() => setSurfaced(null)}
        onApprove={(plan) => run.mutate(plan)}
        onBackToTools={() => { setSurfaced(null); setTab("create"); }}
      />

      <Dialog open={credits} onOpenChange={setCredits}>
        <DialogContent>
          <DialogHeader><DialogTitle>Credits & receipts</DialogTitle><DialogDescription>{(w?.balance ?? 0).toLocaleString()} credits available.</DialogDescription></DialogHeader>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div><p className="text-xs text-muted-foreground">Today</p><p>{(w?.today_used ?? 0).toLocaleString()}</p></div>
            <div><p className="text-xs text-muted-foreground">Month</p><p>{(w?.month_used ?? 0).toLocaleString()}</p></div>
            <div><p className="text-xs text-muted-foreground">Projected</p><p>{projected.toLocaleString()}</p></div>
          </div>
          <div className="space-y-2">
            {(ledgerQ.data ?? []).slice(0, 5).map((l) => (
              <div key={l.id} className="flex justify-between gap-3 text-sm"><span className="text-muted-foreground">{l.label}</span><span>{l.direction === "debit" ? "−" : "+"}{l.amount.toLocaleString()}</span></div>
            ))}
            {(ledgerQ.data ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No AI work billed yet.</p> : null}
          </div>
          <details><summary className="min-h-11 cursor-pointer text-sm font-medium">Always free in the Studio</summary><ul className="mt-2 space-y-1 text-sm text-muted-foreground">{FREE_CAPABILITIES.map((f) => <li key={f}>· {f}</li>)}</ul></details>
          <Button variant="outline" asChild className="min-h-12 w-full"><Link to="/financial-center">Open Creator Wallet</Link></Button>
        </DialogContent>
      </Dialog>

      <Dialog open={further} onOpenChange={setFurther}>
        <DialogContent>
          <DialogHeader><DialogTitle>Take it further</DialogTitle><DialogDescription>Business and earning possibilities sit beside finished work, never in front of creation.</DialogDescription></DialogHeader>
          {active ? <CreationOpportunities kind="video" /> : <p className="text-sm text-muted-foreground">Open a production to see relevant possibilities.</p>}
          <Button variant="outline" asChild className="min-h-12 w-full"><Link to="/business-builder">Open Business Builder <ChevronRight /></Link></Button>
          {isAdmin === true ? (
            <div className="grid gap-2 border-t border-border pt-3 sm:grid-cols-2">
              <Button size="sm" variant="outline" asChild><Link to="/studios/productions"><Film /> Productions</Link></Button>
              <Button size="sm" variant="outline" asChild><Link to="/studios/series"><BookOpen /> Series Bibles</Link></Button>
              <Button size="sm" variant="outline" asChild><Link to="/studios/characters"><Layers /> Characters</Link></Button>
              <Button size="sm" variant="outline" asChild><Link to="/studios/assets"><ImageIcon /> Assets & locations</Link></Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </SiteShell>
  );
}

function CreateWorkspace({
  task, creating, active, audioLane, newTitle, destination, adding, balance, running,
  onTitle, onDestination, onChoose, onOpen, onRunClean, onAskFrassy,
}: {
  task: CreationDoor | null;
  creating: boolean;
  active: { id: string; title: string; destination: string } | null;
  audioLane: boolean;
  newTitle: string;
  destination: string;
  adding: boolean;
  balance: number;
  running: boolean;
  onTitle: (v: string) => void;
  onDestination: (v: string) => void;
  onChoose: (door: CreationDoor) => void;
  onOpen: () => void;
  onRunClean: (report: QualityReport, file: File) => void;
  onAskFrassy: () => void;
}) {
  if ((!task && !active) || (creating && !task)) {
    return (
      <div>
        <h2 className="text-sm font-medium">What are we making today?</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CREATION_DOORS.map((door) => {
            const Icon = door.icon;
            return (
              <Button key={door.id} variant="outline" onClick={() => onChoose(door)} className="h-auto min-h-16 justify-start whitespace-normal p-3 text-left">
                <Icon className="h-5 w-5 shrink-0 text-accent" />
                <span className="min-w-0"><span className="block text-sm">{door.label}</span><span className="block text-xs font-normal text-muted-foreground">{door.note}</span></span>
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!active || creating) {
    return (
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_auto]">
        <label className="grid gap-1 text-sm text-muted-foreground">Name this {task?.label}
          <input autoFocus value={newTitle} onChange={(e) => onTitle(e.target.value)} placeholder={`Untitled ${task?.label}`} className="h-12 rounded-md border border-input bg-background px-3 text-foreground outline-none focus:border-accent" />
        </label>
        <label className="grid gap-1 text-sm text-muted-foreground">Destination
          <select value={destination} onChange={(e) => onDestination(e.target.value)} className="h-12 rounded-md border border-input bg-background px-3 text-foreground">{DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
        </label>
        <Button disabled={adding} onClick={onOpen} className="mt-auto min-h-12 bg-accent text-accent-foreground hover:bg-accent/90"><Plus /> {adding ? "Opening…" : "Open production"}</Button>
      </div>
    );
  }

  if (!task) {
    return (
      <div>
        <h2 className="text-sm font-medium">What kind of work is this?</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CREATION_DOORS.map((door) => {
            const Icon = door.icon;
            return (
              <Button key={door.id} variant="outline" onClick={() => onChoose(door)} className="h-auto min-h-14 justify-start whitespace-normal p-3 text-left">
                <Icon className="h-5 w-5 shrink-0 text-accent" /> <span className="text-sm">{door.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  if (audioLane) return <PhoneContentMode balance={balance} running={running} onRun={onRunClean} />;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium">{task?.label ?? active.destination} workspace</h2>
      <p className="text-sm text-muted-foreground">
        The Frass machine for this kind of work is NOT INSTALLED yet, so nothing here can generate media or charge you.
        Planning, writing and manual editing are open now.
      </p>
      <Button variant="outline" onClick={onAskFrassy} className="min-h-12">Plan it with Frassy</Button>
    </div>
  );
}

function EditWorkspace({ directed, depth, audioLane }: { directed: boolean; depth: ControlDepthId; audioLane: boolean }) {
  const producer = depth === "producer" || depth === "pro";
  if (directed) {
    return <p className="text-sm text-muted-foreground">Directed mode keeps editing out of your way. Move to Creator depth in Production to open the timeline and inspector.</p>;
  }
  return (
    <div className="space-y-3">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-medium"><Scissors className="h-4 w-4 text-accent" /> Timeline</h2>
        <div className="mt-2 space-y-2">
          {TIMELINE_TRACKS.slice(0, producer ? 4 : 2).map((track) => (
            <div key={track.name} className="grid gap-2 sm:grid-cols-[140px_1fr]">
              <span className="truncate text-xs text-muted-foreground">{track.name}</span>
              <div className="flex h-9 gap-1 rounded-sm bg-background p-1">{[3, 5, 2, 4].map((flex, i) => <span key={i} style={{ flex }} className={`${track.tone} rounded-sm`} />)}</div>
            </div>
          ))}
        </div>
      </div>
      <details className="border-t border-border pt-3">
        <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium"><SlidersHorizontal className="h-4 w-4 text-accent" /> Inspector</summary>
        <p className="mt-2 text-sm text-muted-foreground">Select a clip to adjust transform, colour, timing and blend. Nothing is selected yet.</p>
      </details>
      {producer && audioLane ? (
        <details className="border-t border-border pt-3">
          <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium"><Volume2 className="h-4 w-4 text-accent" /> Mixer</summary>
          <p className="mt-2 text-sm text-muted-foreground">Tracks, EQ and levels appear here once audio is in the timeline.</p>
        </details>
      ) : null}
    </div>
  );
}

function ResultDialog({
  surfaced, balance, running, why, onWhy, onClose, onApprove, onBackToTools,
}: {
  surfaced: Surfaced | null;
  balance: number;
  running: boolean;
  why: boolean;
  onWhy: () => void;
  onClose: () => void;
  onApprove: (plan: DirectorPlan) => void;
  onBackToTools: () => void;
}) {
  const open = surfaced !== null;
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-h-[85vh] overflow-auto">
        {surfaced?.kind === "forecast" ? (
          <>
            <DialogHeader><DialogTitle>Here is the plan and the cost</DialogTitle><DialogDescription>{surfaced.plan.understanding}</DialogDescription></DialogHeader>
            <div className="space-y-2">
              {surfaced.plan.forecast.lines.map((l) => (
                <div key={l.key} className="flex items-start justify-between gap-3 text-sm"><span className="text-muted-foreground">{l.label} · {unitLabel(l.unit, l.qty)}</span><span>{l.credits.toLocaleString()}</span></div>
              ))}
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xl text-accent">{surfaced.plan.forecast.total.toLocaleString()} Credits</p>
              <p className="text-xs text-muted-foreground">≈ {usdFor(surfaced.plan.forecast.total)} of compute · about {formatDuration(surfaced.plan.forecast.seconds)} to process · balance after {(balance - surfaced.plan.forecast.total).toLocaleString()}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => onApprove(surfaced.plan)} disabled={running || balance < surfaced.plan.forecast.total} className="min-h-12 bg-accent text-accent-foreground hover:bg-accent/90">
                {running ? "Sending…" : balance >= surfaced.plan.forecast.total ? "Approve" : "Not enough credits"}
              </Button>
              <Button variant="outline" className="min-h-12" onClick={onClose}>Back</Button>
              <Button variant="ghost" className="min-h-12" onClick={onWhy}>Why?</Button>
            </div>
            {why ? <div className="border border-border bg-background/60 p-3 text-sm text-muted-foreground">{surfaced.plan.reasoning.map((r) => <p key={r} className="mb-2">{r}</p>)}<p>{surfaced.plan.manual}</p></div> : null}
          </>
        ) : null}

        {surfaced && surfaced.kind !== "forecast" ? (
          <>
            <DialogHeader><DialogTitle>{surfaced.title}</DialogTitle><DialogDescription>{surfaced.body}</DialogDescription></DialogHeader>
            <div className="flex flex-wrap gap-2">
              {surfaced.kind === "blocked" ? (
                <>
                  <Button variant="outline" className="min-h-12" onClick={onClose}>Back</Button>
                  <Button className="min-h-12 bg-accent text-accent-foreground hover:bg-accent/90" onClick={onBackToTools}>Continue with available tools</Button>
                </>
              ) : (
                <Button className="min-h-12 bg-accent text-accent-foreground hover:bg-accent/90" onClick={onClose}>Continue</Button>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
