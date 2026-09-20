// FRASS-0401/0407 — Frass Vision Studios (FV Studios).
// UX pass 2: ONE SCREEN = ONE CURRENT JOB.
// The command centre sits at eye level, Frassy sits beside it, and every
// result, forecast, blocker or finished output is brought to the creator in
// the same place. This route is presentation only — commissioning, verified
// output and credit truth all stay server-side.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
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
  MessageCircle,
  Pause,
  Play,
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
import { FV_STUDIOS_FRASSY_LOOK } from "@/lib/frassy/room-looks";
import type { QualityReport } from "@/lib/studio/phone-content-mode";
import { FREE_CAPABILITIES, formatDuration, unitLabel, usdFor, buildForecast } from "@/lib/studio/credits";
import { A1_CLEAN_BUCKET, processA1Clean } from "@/lib/studio/a1-clean";
import { supabase } from "@/integrations/supabase/client";
import type { A1Evidence } from "@/lib/studio/a1-standard";
import { DIRECTOR_EXAMPLES, planFromDirection, type DirectorPlan } from "@/lib/studio/director";
import { studioPlaybackState } from "@/lib/studio/studio-ui";
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
  const [frassyOpenSignal, setFrassyOpenSignal] = useState(0);
  const [frassyOpen, setFrassyOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [why, setWhy] = useState(false);
  const [surfaced, setSurfaced] = useState<Surfaced | null>(null);
  const [preview, setPreview] = useState<{ label: string; url: string } | null>(null);
  const [credits, setCredits] = useState(false);
  const [further, setFurther] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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
  const playback = studioPlaybackState(preview?.url);

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
      const forecast = buildForecast("Enhance Phone Recording", [{ key: "voice-enhance", qty: report.minutes }]);
      const queued = await runOp({
        data: {
          projectId: active.id,
          request: `Enhance Phone Recording — ${report.preset.label} (${report.minutes} min)`,
          label: "Enhance Phone Recording",
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
    onMutate: () => setSurfaced({ kind: "working", title: "Enhance Phone Recording is running", body: "Your recording is being cleaned on this device. The source file is kept untouched." }),
    onSuccess: ({ verified, url }) => {
      if (url) setPreview({ label: "Enhance Phone Recording — cleaned audio", url });
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
    onError: (e: Error) => setSurfaced({ kind: "blocked", title: "Enhance Phone Recording did not finish", body: `${e.message} Nothing was charged.` }),
  });

  const needsProduction = !active || creating;
  const primary = needsProduction
    ? { label: task ? "Open this production" : "Choose what you're making", onClick: () => { setTab("create"); if (task) add.mutate(); } }
    : audioLane
      ? { label: "Enhance Phone Recording", onClick: () => { setTab("create"); document.getElementById("fv-workspace")?.querySelector<HTMLInputElement>('input[type="file"]')?.click(); } }
      : { label: "Ask Frassy for the next step", onClick: summonFrassy };

  const studioContext = [
    "FV Studios",
    `Current production: ${active?.title ?? "none open"}`,
    `Creation type: ${task?.label ?? active?.destination ?? "not chosen"}`,
    `Current workspace: ${tab}`,
    `Control depth: ${controlDepth(active?.control_depth).label}`,
    `Output status: ${preview ? "a cleaned and verified output is in preview; it is not mastered" : "no verified output yet"}`,
    "Installed machine: Enhance Phone Recording for audio restoration.",
    "Mastering, music generation, image generation, video generation, animation and voice generation are not installed.",
    `Best next action: ${primary.label}`,
  ].join("\n");
  function summonFrassy() {
    setFrassyOpenSignal((signal) => signal + 1);
  }

  async function togglePreviewPlayback() {
    const audio = audioRef.current;
    if (!preview || !audio) {
      setSurfaced({ kind: "blocked", title: "No playable output yet", body: "Finish a verified audio output first. Nothing was played or charged." });
      return;
    }
    if (audio.paused) await audio.play();
    else audio.pause();
  }

  return (
    <SiteShell>
      <div className={`fv-studio min-h-screen overflow-x-clip pb-24 text-foreground lg:pb-0 ${arrival ? "" : "fv-lights-up"}`}>
        {arrival ? (
          <button
            type="button"
            onClick={() => setArrival(false)}
            aria-label="Enter the studio"
            className="fixed inset-0 z-50 animate-fade-in cursor-pointer"
          >
            <img src={studioEntry} alt="Eye-level entrance into the FV Studios production room" className="h-full w-full object-cover" fetchPriority="high" />
            <span className="absolute inset-0 bg-[color:var(--ink)]/75" aria-hidden="true" />
            <span className="fv-arrival-light absolute inset-0" aria-hidden="true" />
            <span className="absolute inset-0 grid place-items-center px-6 text-center">
              <span className="block">
                <span className="block font-display text-4xl uppercase leading-none sm:text-6xl">Frass Vision Studios</span>
                <span className="mt-3 block text-sm text-accent">Bringing the lights up…</span>
              </span>
            </span>
          </button>
        ) : null}

        {/* Compact, persistent studio header: where I am, what I'm on, what it costs. */}
        <header className="fv-studio-header sticky top-0 z-30 backdrop-blur-xl">
          <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 pb-2 pt-11 sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="fv-console-icon grid h-9 w-9 shrink-0 place-items-center rounded-full"><Film className="h-4 w-4 text-accent" /></span>
              <select
                aria-label="Current production"
                value={active?.id ?? ""}
                onChange={(e) => { setActiveId(e.target.value); setCreating(false); }}
                className="fv-production-select h-10 min-w-0 max-w-[19rem] flex-1 rounded-full px-4 text-sm"
              >
                <option value="">No production open</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <span className="hidden shrink-0 rounded-full border border-border px-2.5 py-1 text-xs uppercase text-muted-foreground sm:inline">{controlDepth(active?.control_depth).label}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCredits(true)} className="h-10">{(w?.balance ?? 0).toLocaleString()} cr</Button>
              {isAdmin === true ? (
                <Button size="sm" asChild className="fv-secondary-control h-10 rounded-full">
                  <Link to="/studios" aria-label="Founder Originals"><Shield className="h-4 w-4" /> <span className="hidden sm:inline">Founder Originals</span></Link>
                </Button>
              ) : null}
              <div className="hidden sm:block"><VoiceFeedbackButton source="studio" /></div>
            </div>
          </div>
          <nav aria-label="Studio sections" className="fv-studio-nav mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-3 pb-2 sm:px-5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const on = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-current={on ? "page" : undefined}
                  className={`fv-studio-tab flex min-h-11 shrink-0 items-center gap-2 px-3 text-sm ${on ? "is-active" : "text-muted-foreground"}`}
                >
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
            <button type="button" onClick={() => setFurther(true)} className="fv-studio-tab ml-auto flex min-h-11 shrink-0 items-center gap-2 px-3 text-sm text-muted-foreground">
              <ChevronRight className="h-4 w-4" /> Take it further
            </button>
          </nav>
          <span className="fv-studio-lightline block h-px w-full" aria-hidden="true" />
        </header>

        {/* Command centre — one screen, one current job. */}
        <main className="fv-studio-stage relative mx-auto grid max-w-[1600px] gap-5 px-3 py-5 sm:px-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="fv-ceiling-light" aria-hidden="true" />
          <section className="relative z-10 min-w-0 space-y-3" aria-label="Command centre">
            <div className="fv-control-room relative min-h-[34vh] overflow-hidden sm:min-h-[38vh]">
              <div className="fv-acoustic-wall fv-acoustic-wall-left" aria-hidden="true" />
              <div className="fv-acoustic-wall fv-acoustic-wall-right" aria-hidden="true" />
              <div className="fv-studio-speaker fv-speaker-left" aria-hidden="true"><span /><span /></div>
              <div className="fv-studio-speaker fv-speaker-right" aria-hidden="true"><span /><span /></div>
              <div className="fv-main-monitor absolute inset-x-[12%] top-5 bottom-[4.6rem] grid place-items-center overflow-hidden p-5 sm:inset-x-[14%] sm:top-6">
              {preview ? (
                <div className="fv-monitor-content relative z-10 w-full max-w-xl text-center">
                  <p className="text-xs font-semibold text-accent">{preview.label}</p>
                  <audio ref={audioRef} controls src={preview.url} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} className="mt-3 w-full" />
                  <p className="mt-2 text-xs text-muted-foreground">Cleaned and verified. Not A1 Master approved.</p>
                </div>
              ) : (
                <div className="fv-monitor-content relative z-10 max-w-md text-center">
                  <Button type="button" variant="ghost" disabled aria-label="No playable output yet" title="No playable output yet" className="fv-monitor-orbit mx-auto grid h-20 w-20 place-items-center rounded-full disabled:opacity-70"><Play className="h-8 w-8 text-accent" /></Button>
                  <p className="mt-5 font-display text-3xl normal-case leading-none sm:text-5xl">{active ? active.title : "Your next production"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{active ? `${task?.label ?? active.destination} · no verified output yet` : "Pick what you are making below."}</p>
                </div>
              )}
                <span className="fv-monitor-sheen pointer-events-none absolute inset-0" aria-hidden="true" />
              <div className="absolute bottom-3 left-4 hidden gap-2 text-xs uppercase text-muted-foreground sm:flex">
                <span className="rounded-full border border-border bg-background/80 px-3 py-1">Preview</span>
                <span className="rounded-full border border-border bg-background/80 px-3 py-1">{preview ? "Cleaned output" : "No output claimed"}</span>
              </div>
              </div>
              <div className="fv-console-bridge absolute inset-x-[5%] bottom-0 h-[5.7rem] sm:inset-x-[8%]">
                <div className="fv-transport-strip">
                  <span className="fv-transport-dot" aria-hidden="true" /><span className="fv-transport-dot" aria-hidden="true" />
                  <Button type="button" variant="ghost" onClick={() => void togglePreviewPlayback()} disabled={!playback.playable} aria-label={playing ? "Pause current output" : playback.label} title={playing ? "Pause current output" : playback.label} className="fv-transport-play h-9 w-9 rounded-full p-0">{playing ? <Pause /> : <Play />}</Button>
                  <span className="fv-mini-wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
                  <span className="fv-level-meter" aria-hidden="true"><i /><i /><i /><i /><i /></span>
                </div>
              </div>
            </div>

            <div className="fv-action-deck grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 sm:flex">
              <Button onClick={primary.onClick} className="fv-primary-action min-h-14 min-w-0 text-base sm:min-w-72">
                {primary.label} <ArrowRight />
              </Button>
              {active ? <Button variant="ghost" className="fv-quiet-action min-h-12 shrink-0" onClick={() => { setTask(null); setCreating(true); setTab("create"); }}><Plus /> <span className="hidden sm:inline">New production</span></Button> : null}
              <span className="col-span-2 text-xs text-muted-foreground sm:ml-auto">Nothing runs or charges before approval.</span>
            </div>

            <div id="fv-workspace" className="fv-tool-drawer p-4 sm:p-5">
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
                   onAskFrassy={summonFrassy}
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
          <aside className={`fv-frassy-station relative z-10 min-w-0 ${frassyOpen ? "is-summoned" : ""}`} aria-label="Frassy, your AI director">
            <button type="button" onClick={summonFrassy} className="fv-frassy-portrait group relative mx-auto block w-full max-w-[19rem] overflow-hidden text-left" aria-label="Talk to Frassy in the studio">
              <span className="fv-frassy-halo absolute inset-x-[8%] bottom-[4%] h-[62%]" aria-hidden="true" />
               <img src={FV_STUDIOS_FRASSY_LOOK.image} alt={FV_STUDIOS_FRASSY_LOOK.alt} className="relative z-10 aspect-[3/4] w-full object-cover object-top transition duration-500 group-hover:scale-[1.015]" />
              <span className="fv-frassy-call absolute inset-x-4 bottom-4 z-20 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-full px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_var(--gold)]" />
                <span className="min-w-0"><span className="block text-xs font-semibold text-foreground">Frassy · Studio Director</span><span className="block truncate text-[11px] text-muted-foreground">Tap to talk — I know this production</span></span>
                <MessageCircle className="h-4 w-4 text-accent" />
              </span>
            </button>
            <div className="fv-director-console mt-[-1rem] p-4 pt-7">
              <form
                className=""
                onSubmit={(e) => { e.preventDefault(); if (!direction.trim()) return; setWhy(false); setSurfaced({ kind: "forecast", plan: planFromDirection(direction) }); }}
              >
                <label className="text-sm text-muted-foreground" htmlFor="director-direction">Direct this production</label>
                <textarea id="director-direction" rows={3} value={direction} onChange={(e) => setDirection(e.target.value)} placeholder="Tell Frassy what you want to make…" className="fv-director-input mt-2 w-full resize-none rounded-lg p-3 text-sm outline-none" />
                <Button type="submit" disabled={!direction.trim()} className="fv-secondary-control mt-2 min-h-12 w-full"><Send /> Show my plan and cost</Button>
              </form>
              {directed ? null : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {DIRECTOR_EXAMPLES.slice(0, 3).map((ex) => (
                    <Button key={ex} variant="outline" size="sm" onClick={() => setDirection(ex)} className="h-auto whitespace-normal text-left">{ex}</Button>
                  ))}
                </div>
              )}
              <Button variant="ghost" className="mt-2 min-h-11 w-full text-muted-foreground" onClick={summonFrassy}><MessageCircle /> Open full conversation</Button>
            </div>
          </aside>
        </main>

        {/* Mobile: the current job's primary action stays in reach. */}
        <button type="button" onClick={summonFrassy} className="fv-frassy-mobile fixed bottom-[5.35rem] right-3 z-40 h-16 w-16 overflow-hidden rounded-full lg:hidden" aria-label="Talk to Frassy in the studio">
           <img src={FV_STUDIOS_FRASSY_LOOK.image} alt="Frassy" className="h-full w-full object-cover object-top" />
        </button>
        <div className="fv-studio-surface fixed inset-x-0 bottom-0 z-30 bg-card/95 p-3 backdrop-blur lg:hidden">
          <Button onClick={primary.onClick} className="fv-primary-action min-h-12 w-full">{primary.label} <ArrowRight /></Button>
        </div>
      </div>

      <FrassyChat hideBeacon tone="dark" workspaceContext={studioContext} openSignal={frassyOpenSignal} presentation="studio" onOpenChange={setFrassyOpen} />

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
        <DialogContent className="fv-studio-surface">
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
        <DialogContent className="fv-studio-surface">
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
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CREATION_DOORS.map((door) => {
            const Icon = door.icon;
            return (
              <Button key={door.id} variant="ghost" onClick={() => onChoose(door)} className="fv-studio-door h-auto min-h-24 justify-start whitespace-normal p-4 text-left">
                <span className="fv-door-icon grid h-11 w-11 shrink-0 place-items-center rounded-full"><Icon className="h-5 w-5 text-accent" /></span>
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
              <Button key={door.id} variant="ghost" onClick={() => onChoose(door)} className="fv-studio-door h-auto min-h-20 justify-start whitespace-normal p-3 text-left">
                <span className="fv-door-icon grid h-10 w-10 shrink-0 place-items-center rounded-full"><Icon className="h-5 w-5 text-accent" /></span> <span className="text-sm">{door.label}</span>
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
    <div className="fv-edit-console space-y-3">
      <div className="fv-edit-transport flex items-center gap-3 rounded-full px-4 py-2">
        <span className="fv-transport-button" aria-hidden="true">▶</span>
        <span className="font-mono text-xs text-foreground">00:00:00</span>
        <span className="min-w-0 flex-1 text-right text-xs text-muted-foreground">Timeline · {producer ? "Producer controls" : "Creator controls"}</span>
      </div>
      <div className="fv-track-bed rounded-2xl p-3">
        <h2 className="flex items-center gap-2 text-sm font-medium"><Scissors className="h-4 w-4 text-accent" /> Timeline</h2>
        <div className="mt-3 space-y-2">
          {TIMELINE_TRACKS.slice(0, producer ? 4 : 2).map((track) => (
            <div key={track.name} className="fv-track-row grid gap-2 rounded-xl p-2 sm:grid-cols-[140px_1fr]">
              <span className="truncate text-xs text-muted-foreground">{track.name}</span>
              <div className="fv-waveform-lane flex h-9 items-center gap-1 rounded-lg px-2">{["h-2", "h-3.5", "h-5", "h-3", "h-6", "h-4", "h-2.5", "h-5", "h-3.5", "h-5.5", "h-2.5", "h-4", "h-2", "h-4", "h-5", "h-3"].map((height, i) => <span key={i} className={`${track.tone} fv-wave-bar ${height}`} />)}</div>
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
      <DialogContent className="fv-studio-surface max-h-[85vh] overflow-auto">
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
