// FRASS-0401/0407 — Frass Vision Studios (FV Studios). Frassy creates, the creator directs.
// This route is presentation only. Commissioning, verified-output and credit truth stay server-side.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  BookOpen,
  Camera,
  ChevronRight,
  Clapperboard,
  Film,
  FolderOpen,
  Headphones,
  Image,
  Info,
  Layers,
  Library,
  Mic2,
  MonitorPlay,
  Music2,
  Plus,
  Scissors,
  Send,
  SlidersHorizontal,
  Smartphone,
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
import { ControlDepthBar } from "@/components/studio/control-depth-bar";
import { A1MasterPanel } from "@/components/studio/a1-master-panel";
import studioEntry from "@/assets/studio-entry.jpg";
import type { QualityReport } from "@/lib/studio/phone-content-mode";
import { FREE_CAPABILITIES, formatDuration, unitLabel, usdFor } from "@/lib/studio/credits";
import { buildForecast } from "@/lib/studio/credits";
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
  { id: "music", label: "Music", icon: Music2, destination: "internal", note: "Songs, scores and sound-led work" },
  { id: "music-video", label: "Video / Music Video", icon: MonitorPlay, destination: "youtube", note: "Visual stories, promos and performances" },
  { id: "animation", label: "Animation", icon: Wand2, destination: "youtube", note: "Plan characters, scenes and movement" },
  { id: "film", label: "Film / Documentary", icon: Clapperboard, destination: "internal", note: "Long-form stories and real-world films" },
  { id: "podcast", label: "Podcast / Audio", icon: Mic2, destination: "podcast", note: "Episodes, interviews and spoken work" },
  { id: "photography", label: "Photography / Images", icon: Camera, destination: "internal", note: "Shoots, campaigns and image collections" },
] as const;

type CreationDoor = (typeof CREATION_DOORS)[number];

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
  const workbenchRef = useRef<HTMLDivElement>(null);
  const creationRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useIsAdminStatus();

  const walletQ = useQuery({ queryKey: ["ai-wallet"], queryFn: () => wallet() });
  const ledgerQ = useQuery({ queryKey: ["ai-ledger"], queryFn: () => ledgerFn() });
  const projectsQ = useQuery({ queryKey: ["studio-projects"], queryFn: () => projectsFn() });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [destination, setDestination] = useState("youtube");
  const [creationDoor, setCreationDoor] = useState<CreationDoor | null>(null);
  const [direction, setDirection] = useState("");
  const [plan, setPlan] = useState<DirectorPlan | null>(null);
  const [why, setWhy] = useState(false);

  const projects = projectsQ.data ?? [];
  const active = useMemo(() => projects.find((p) => p.id === activeId) ?? projects[0] ?? null, [projects, activeId]);
  const evidenceQ = useQuery({ queryKey: ["studio-a1-evidence", active?.production_id], queryFn: () => evidenceFn({ data: { productionId: active?.production_id } }), enabled: Boolean(active?.production_id) });
  const currentDepth = controlDepth(active?.control_depth).id;
  const currentDepthIndex = depthIndex(currentDepth);
  const w = walletQ.data;
  const projected = w ? Math.round((w.month_used / new Date().getDate()) * 30) : 0;

  const chooseDoor = (door: CreationDoor) => {
    setCreationDoor(door);
    setDestination(door.destination);
    setNewTitle("");
    requestAnimationFrame(() => creationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  const add = useMutation({
    mutationFn: () => createProject({ data: { title: newTitle, destination } }),
    onSuccess: (p) => {
      setNewTitle("");
      setCreationDoor(null);
      setActiveId(p.id);
      toast.success("Production created. Nothing charged — the Studio is always free to open.");
      void qc.invalidateQueries({ queryKey: ["studio-projects"] });
      requestAnimationFrame(() => workbenchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const run = useMutation({
    mutationFn: () => {
      if (!plan) throw new Error("Nothing approved.");
      return runOp({ data: { projectId: active?.id, request: plan.forecast.request, label: plan.understanding, lines: plan.forecast.lines.map((l) => ({ key: l.key, label: l.label, credits: l.credits, qty: l.qty })), total: plan.forecast.total, seconds: plan.forecast.seconds } });
    },
    onSuccess: (r) => {
      setPlan(null);
      setDirection("");
      if (r.status === "blocked") toast.warning(r.message);
      else toast.success(r.message);
      void qc.invalidateQueries({ queryKey: ["ai-wallet"] });
      void qc.invalidateQueries({ queryKey: ["ai-ledger"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const depth = useMutation({
    mutationFn: (next: ControlDepthId) => {
      if (!active) throw new Error("Create a production first.");
      return setDepth({ data: { projectId: active.id, depth: next } });
    },
    onSuccess: (p) => {
      toast.success(describeDepthChange(controlDepth(active?.control_depth).id, controlDepth(p.control_depth).id).message);
      void qc.invalidateQueries({ queryKey: ["studio-projects"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const runPhone = useMutation({
    mutationFn: async ({ report, file }: { report: QualityReport; file: File }) => {
      if (!active) throw new Error("Open a production first.");
      const forecast = buildForecast("FRASS Native A1 Clean", [{ key: "voice-enhance", qty: report.minutes }]);
      const queued = await runOp({ data: { projectId: active.id, request: `FRASS Native A1 Clean — ${report.preset.label} (${report.minutes} min)`, label: "FRASS Native A1 Clean", lines: forecast.lines.map((l) => ({ key: l.key, label: l.label, credits: l.credits, qty: l.qty })), total: forecast.total, seconds: forecast.seconds } });
      if (queued.status === "blocked") throw new Error(queued.message);
      const prepared = await prepareClean({ data: { jobId: queued.jobId } });
      const output = await processA1Clean(file);
      const sourceUpload = await supabase.storage.from(A1_CLEAN_BUCKET).upload(prepared.source, file, { contentType: file.type, upsert: false });
      if (sourceUpload.error) throw new Error(`Source preservation failed: ${sourceUpload.error.message}`);
      const outputUpload = await supabase.storage.from(A1_CLEAN_BUCKET).upload(prepared.output, output, { contentType: "audio/wav", upsert: false });
      if (outputUpload.error) { await supabase.storage.from(A1_CLEAN_BUCKET).remove([prepared.source]); throw new Error(`Processed output upload failed: ${outputUpload.error.message}`); }
      return finalizeClean({ data: { jobId: queued.jobId, sourcePath: prepared.source, outputPath: prepared.output, sourceMime: file.type, sourceBytes: file.size, outputBytes: output.size, processedAt: new Date().toISOString() } });
    },
    onSuccess: (r) => {
      toast.success(`A1 Clean verified. ${r.charged.toLocaleString()} credits charged once.`);
      void qc.invalidateQueries({ queryKey: ["ai-wallet"] });
      void qc.invalidateQueries({ queryKey: ["ai-ledger"] });
      void qc.invalidateQueries({ queryKey: ["studio-projects"] });
      void qc.invalidateQueries({ queryKey: ["studio-a1-evidence"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <SiteShell>
      <div className="fv-studio min-h-screen bg-background text-foreground">
        <section className="fv-arrival" aria-labelledby="fv-arrival-title">
          <img src={studioEntry} alt="Eye-level entrance into the FV Studios production room" className="fv-arrival-image" fetchPriority="high" />
          <div className="fv-arrival-shade" aria-hidden="true" />
          <div className="fv-arrival-copy">
            <p className="text-xs font-bold uppercase text-gold-soft">Studio District · Frass Hill</p>
            <h1 id="fv-arrival-title" className="mt-3 max-w-4xl font-display text-5xl uppercase leading-none sm:text-7xl lg:text-8xl">Frass Vision Studios</h1>
            <p className="mt-4 max-w-xl text-base text-foreground/75 sm:text-lg">Step inside. Frassy is at the console, your production stays yours, and every important action waits for your approval.</p>
            <Button size="lg" onClick={() => workbenchRef.current?.scrollIntoView({ behavior: "smooth" })} className="mt-7 min-h-12 bg-accent text-accent-foreground hover:bg-accent/90">
              Enter the studio <ArrowDown />
            </Button>
          </div>
        </section>

        <div ref={workbenchRef} className="fv-workbench relative z-10 mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-8">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-md border border-accent/40 bg-accent/10"><Film className="text-accent" /></span>
              <div><p className="text-xs uppercase text-accent">FV Studios</p><p className="text-sm text-muted-foreground">One production. Four control depths.</p></div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" asChild><Link to="/room"><Library /> Studio Library</Link></Button>
              <VoiceFeedbackButton source="studio" />
            </div>
          </header>

          <section className="py-9" aria-labelledby="making-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-xs uppercase text-accent">Start at the door</p><h2 id="making-title" className="mt-2 font-display text-4xl uppercase sm:text-5xl">What are we making today?</h2></div>
              <p className="max-w-md text-sm text-muted-foreground">Every door opens a real production workspace. Planning is available now; a missing native machine will always say so before generation.</p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CREATION_DOORS.map((door) => {
                const Icon = door.icon;
                return <Button key={door.id} variant="outline" onClick={() => chooseDoor(door)} className="group h-auto min-h-28 justify-between whitespace-normal border-border bg-card/55 p-5 text-left hover:border-accent hover:bg-card">
                  <span><Icon className="mb-4 h-6 w-6 text-accent" /><span className="block text-base text-foreground">{door.label}</span><span className="mt-1 block text-sm font-normal text-muted-foreground">{door.note}</span><span className="mt-3 block text-xs font-normal uppercase text-accent/80">Workspace ready · native generation not installed</span></span>
                  <ChevronRight className="text-muted-foreground transition group-hover:text-accent" />
                </Button>;
              })}
            </div>

            {creationDoor ? <div ref={creationRef} className="mt-5 border-l-2 border-accent bg-card/65 p-5 animate-fade-in">
              <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase text-accent">New {creationDoor.label} production</p><h3 className="mt-2 font-display text-2xl uppercase">Name the work</h3><p className="mt-2 text-sm text-muted-foreground">This creates the production workspace only. It does not run a machine or charge credits.</p></div><Button variant="ghost" onClick={() => setCreationDoor(null)}>Cancel</Button></div>
              <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
                <label className="grid gap-2 text-sm text-muted-foreground">Production name<input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder={`Untitled ${creationDoor.label}`} className="h-12 rounded-md border border-input bg-background px-4 text-foreground outline-none focus:border-accent" /></label>
                <label className="grid gap-2 text-sm text-muted-foreground">First destination<select value={destination} onChange={(e) => setDestination(e.target.value)} className="h-12 rounded-md border border-input bg-background px-4 text-foreground outline-none focus:border-accent">{DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}</select></label>
                <Button disabled={add.isPending || !newTitle.trim()} onClick={() => add.mutate()} className="mt-auto h-12 bg-accent text-accent-foreground hover:bg-accent/90"><Plus /> {add.isPending ? "Opening…" : "Open production"}</Button>
              </div>
            </div> : null}
          </section>

          {isAdmin === true ? <FounderOriginalsRoom /> : null}

          <section className="overflow-hidden border border-border bg-card/35" aria-labelledby="console-title">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/70 px-4 py-3 sm:px-5">
              <div><p className="text-xs uppercase text-muted-foreground">Current production</p><h2 id="console-title" className="mt-1 font-display text-2xl uppercase">{active?.title ?? "Studio console"}</h2></div>
              <div className="flex flex-wrap items-center gap-2">
                <select aria-label="Choose production" value={active?.id ?? ""} onChange={(e) => setActiveId(e.target.value)} className="h-11 min-w-52 rounded-md border border-input bg-background px-3 text-sm text-foreground"><option value="">No production selected</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select>
                <Button variant="outline" onClick={() => creationRef.current?.scrollIntoView({ behavior: "smooth" })} disabled={!creationDoor}><Plus /> New production</Button>
              </div>
            </div>

            <div className="grid min-h-[520px] xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="min-w-0 border-b border-border xl:border-b-0 xl:border-r">
                <div className="fv-preview-monitor relative grid min-h-[280px] place-items-center overflow-hidden bg-background sm:aspect-video sm:min-h-[320px]">
                  <div className="absolute inset-5 border border-border/70" aria-hidden="true" />
                  <div className="relative z-10 max-w-lg px-6 text-center"><MonitorPlay className="mx-auto h-12 w-12 text-accent/55" /><p className="mt-4 text-lg">{active ? active.title : "No production on the monitor"}</p><p className="mt-2 text-sm text-muted-foreground">{active ? `Workspace open for ${active.destination}. No verified media output yet.` : "Choose a creation door or select an existing production."}</p></div>
                  <div className="absolute bottom-3 left-4 flex gap-2 text-xs uppercase text-muted-foreground"><span className="rounded-full border border-border bg-background/80 px-3 py-1">Preview</span><span className="rounded-full border border-border bg-background/80 px-3 py-1">No output claimed</span></div>
                </div>
                <ControlDepthBar depth={currentDepth} productionTitle={active?.title ?? null} disabled={!active || depth.isPending} onChange={(next) => depth.mutate(next)} />
              </div>

              <aside className="flex min-h-[520px] flex-col bg-card/55" aria-label="Frassy production director">
                <div className="border-b border-border p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-accent/15"><Sparkles className="text-accent" /></span><div><p className="text-xs uppercase text-accent">At the console</p><h3 className="font-display text-xl uppercase">Frassy · AI Director</h3></div></div><p className="mt-3 text-sm text-muted-foreground">Tell me the result you want. I’ll plan it, show the cost first, and wait for your approval.</p></div>
                <div className="flex-1 overflow-auto p-5"><div className="flex flex-wrap gap-2">{DIRECTOR_EXAMPLES.slice(0, 4).map((ex) => <Button key={ex} variant="outline" size="sm" onClick={() => setDirection(ex)} className="h-auto whitespace-normal text-left">{ex}</Button>)}</div>
                  <form className="mt-4" onSubmit={(e) => { e.preventDefault(); if (!direction.trim()) return; setPlan(planFromDirection(direction)); setWhy(false); }}><label className="text-sm text-muted-foreground" htmlFor="director-direction">What should Frassy do?</label><textarea id="director-direction" rows={4} value={direction} onChange={(e) => setDirection(e.target.value)} placeholder="Make this cinematic and cut it to 30 seconds…" className="mt-2 w-full resize-none rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-accent" /><Button type="submit" disabled={!direction.trim()} className="mt-3 w-full bg-accent text-accent-foreground hover:bg-accent/90"><Send /> Build the plan</Button></form>
                  {plan ? <ForecastCard plan={plan} balance={w?.balance ?? 0} running={run.isPending} why={why} onWhy={() => setWhy((v) => !v)} onApprove={() => run.mutate()} onCancel={() => setPlan(null)} onLighter={() => { if (!plan.forecast.saving) return; toast("Swapped generated shots for Vault footage — forecast updated."); setPlan({ ...plan, forecast: { ...plan.forecast, total: plan.forecast.total - plan.forecast.saving.credits, lines: plan.forecast.lines.map((l) => l.key === "ai-video-generation" || l.key === "ai-broll" ? { ...l, credits: Math.round(l.credits * 0.4) } : l), saving: undefined } }); }} /> : null}
                </div>
                <details className="border-t border-border p-4"><summary className="cursor-pointer text-sm font-medium">Open full conversation with Frassy</summary><div className="mt-4"><FrassyChat embedded tone="dark" /></div></details>
              </aside>
            </div>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <StudioTimeline simple={currentDepthIndex === 0} />
               <details className="border border-border bg-card/40" open={currentDepthIndex > 0}><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-5"><span className="flex items-center gap-2 text-sm font-medium"><Smartphone className="text-accent" /> Input & A1 Clean</span><span className="text-xs text-muted-foreground">Real audio restoration runs on this device</span></summary><div className="border-t border-border p-4"><PhoneContentMode balance={w?.balance ?? 0} running={runPhone.isPending} onRun={(report, file) => runPhone.mutate({ report, file })} /></div></details>
              {currentDepthIndex >= 1 ? <ManualWorkspace depth={currentDepth} /> : null}
              <details className="border border-border bg-card/40"><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-5"><span className="flex items-center gap-2 text-sm font-medium"><Upload className="text-accent" /> Export & Deliver</span><span className="text-xs text-muted-foreground">Watermark and delivery choices</span></summary><div className="border-t border-border p-4"><ExportWatermarkPanel /></div></details>
            </div>

            <aside className="space-y-4">
               <A1MasterPanel evidence={(evidenceQ.data ?? {}) as A1Evidence} />
              <InfoDrawer balance={w?.balance ?? 0} today={w?.today_used ?? 0} month={w?.month_used ?? 0} projected={projected} ledger={ledgerQ.data ?? []} />
              <details className="border border-border bg-card/40"><summary className="flex min-h-14 cursor-pointer list-none items-center gap-2 px-4 text-sm font-medium"><Wand2 className="text-accent" /> Free in the Studio</summary><ul className="space-y-2 border-t border-border p-4 text-sm text-muted-foreground">{FREE_CAPABILITIES.map((f) => <li key={f}>· {f}</li>)}</ul></details>
              <details className="border border-border bg-card/40"><summary className="flex min-h-14 cursor-pointer list-none items-center gap-2 px-4 text-sm font-medium"><Sparkles className="text-accent" /> Take it further</summary><div className="space-y-3 border-t border-border p-4"><p className="text-sm text-muted-foreground">Business and earning possibilities belong beside finished work, not in front of creation.</p>{active ? <CreationOpportunities kind="video" /> : <p className="text-sm text-muted-foreground">Open a production to see relevant possibilities.</p>}<Button variant="outline" asChild className="w-full"><Link to="/business-builder">Open Business Builder <ChevronRight /></Link></Button></div></details>
            </aside>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}

function FounderOriginalsRoom() {
  const originals = [
    { name: "FRASS Chronicles", note: "A separate Frass Original" },
    { name: "Frassy Street", note: "Children’s educational entertainment" },
    { name: "Frass Street", note: "Adult Jamaican street, dancehall and social entertainment" },
    { name: "I Am Not My Hair", note: "A separate mixed-format Original" },
  ];
  return <section className="mb-9 border border-accent/30 bg-accent/[0.04] p-5 sm:p-6" aria-labelledby="founder-room-title"><div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-2xl"><p className="text-xs uppercase text-accent">Private room · Founder/Admin only</p><h2 id="founder-room-title" className="mt-2 font-display text-3xl uppercase">Frassy + Founder Originals</h2><p className="mt-3 text-sm text-muted-foreground">Continue the Founder’s personal work with Frassy in the existing protected production house. The same canonical productions, Series Bibles, canon and memory stay in use.</p></div><Button asChild className="min-h-11 bg-accent text-accent-foreground hover:bg-accent/90"><Link to="/studios">Enter private room <ChevronRight /></Link></Button></div><div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-4">{originals.map((original) => <div key={original.name} className="border border-border bg-background/55 p-3"><p className="font-medium">{original.name}</p><p className="mt-1 text-xs text-muted-foreground">{original.note}</p></div>)}</div><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="outline" asChild><Link to="/studios/productions"><Film /> Productions</Link></Button><Button size="sm" variant="outline" asChild><Link to="/studios/series"><BookOpen /> Series Bibles</Link></Button><Button size="sm" variant="outline" asChild><Link to="/studios/characters"><Layers /> Characters</Link></Button><Button size="sm" variant="outline" asChild><Link to="/studios/assets"><FolderOpen /> Assets & locations</Link></Button></div></section>;
}

function StudioTimeline({ simple }: { simple: boolean }) {
  return <section className="border border-border bg-card/40"><div className="flex min-h-14 flex-wrap items-center justify-between gap-2 px-5"><h2 className="flex items-center gap-2 text-sm font-medium"><Scissors className="text-accent" /> Timeline</h2><span className="text-xs text-muted-foreground">Manual editing stays free · {simple ? "simple view" : "expanded controls"}</span></div><div className="space-y-2 border-t border-border p-4 sm:p-5">{TIMELINE_TRACKS.slice(0, simple ? 2 : 4).map((track) => <div key={track.name} className="grid gap-2 sm:grid-cols-[150px_1fr]"><span className="truncate text-xs text-muted-foreground">{track.name}</span><div className="flex h-10 gap-1 rounded-sm bg-background p-1">{[3, 5, 2, 4].map((flex, i) => <span key={i} style={{ flex }} className={`${track.tone} rounded-sm`} />)}</div></div>)}<p className="pt-2 text-xs text-muted-foreground">No generated clip is shown here until a verified output exists. Manual trim, replace and undo remain available at every depth.</p></div></section>;
}

function ManualWorkspace({ depth }: { depth: ControlDepthId }) {
  const producer = depth === "producer" || depth === "pro";
  return <section className={`grid gap-4 ${producer ? "lg:grid-cols-2" : ""}`}><div className="border border-border bg-card/40 p-5"><h2 className="flex items-center gap-2 text-sm font-medium"><SlidersHorizontal className="text-accent" /> Inspector</h2><p className="mt-2 text-sm text-muted-foreground">Select media to adjust transform, colour, timing, opacity and blend. No media is selected yet.</p></div>{producer ? <div className="border border-border bg-card/40 p-5"><h2 className="flex items-center gap-2 text-sm font-medium"><Volume2 className="text-accent" /> Audio Mixer</h2><p className="mt-2 text-sm text-muted-foreground">Tracks, EQ, compression, limiting, noise reduction and automation appear here when audio is present.</p>{depth === "pro" ? <p className="mt-3 text-xs uppercase text-accent">Pro depth · full signal controls visible when media is selected</p> : null}</div> : null}</section>;
}

function InfoDrawer({ balance, today, month, projected, ledger }: { balance: number; today: number; month: number; projected: number; ledger: Array<{ id: string; label: string; direction: string; amount: number }> }) {
  return <details className="border border-border bg-card/40"><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4"><span className="flex items-center gap-2 text-sm font-medium"><Info className="text-accent" /> Credits & receipts</span><span className="text-sm text-accent">{balance.toLocaleString()} available</span></summary><div className="border-t border-border p-4"><div className="grid grid-cols-3 gap-2 text-center"><div><p className="text-xs text-muted-foreground">Today</p><p>{today.toLocaleString()}</p></div><div><p className="text-xs text-muted-foreground">Month</p><p>{month.toLocaleString()}</p></div><div><p className="text-xs text-muted-foreground">Projected</p><p>{projected.toLocaleString()}</p></div></div><div className="mt-4 space-y-2">{ledger.slice(0, 5).map((l) => <div key={l.id} className="flex justify-between gap-3 text-sm"><span className="text-muted-foreground">{l.label}</span><span>{l.direction === "debit" ? "−" : "+"}{l.amount.toLocaleString()}</span></div>)}{ledger.length === 0 ? <p className="text-sm text-muted-foreground">No AI work billed yet.</p> : null}</div><Button variant="outline" asChild className="mt-4 w-full"><Link to="/financial-center">Open Creator Wallet</Link></Button></div></details>;
}

function ForecastCard({ plan, balance, running, why, onWhy, onApprove, onCancel, onLighter }: { plan: DirectorPlan; balance: number; running: boolean; why: boolean; onWhy: () => void; onApprove: () => void; onCancel: () => void; onLighter: () => void }) {
  const f = plan.forecast;
  const affordable = balance >= f.total;
  return <div className="mt-4 border border-accent/30 bg-accent/[0.04] p-4"><p className="text-xs uppercase text-accent">Credit forecast</p><p className="mt-2 text-sm">{plan.understanding}</p><div className="mt-3 space-y-2">{f.lines.map((l) => <div key={l.key} className="flex items-start justify-between gap-3 text-sm"><span className="text-muted-foreground">{l.label} · {unitLabel(l.unit, l.qty)}</span><span>{l.credits.toLocaleString()}</span></div>)}</div><div className="mt-3 border-t border-border pt-3"><p className="text-xs uppercase text-muted-foreground">Estimated total</p><p className="text-xl text-accent">{f.total.toLocaleString()} Credits</p><p className="text-xs text-muted-foreground">≈ {usdFor(f.total)} of compute · about {formatDuration(f.seconds)} to process · balance after {(balance - f.total).toLocaleString()}</p></div>{f.saving ? <Button onClick={onLighter} variant="outline" className="mt-3 h-auto w-full whitespace-normal py-2 text-left">Credit Intelligence · {f.saving.note} Saves about {f.saving.credits.toLocaleString()} Credits.</Button> : null}<div className="mt-4 flex flex-wrap gap-2"><Button onClick={onApprove} disabled={running || !affordable} className="bg-accent text-accent-foreground hover:bg-accent/90">{running ? "Sending…" : affordable ? "Approve plan" : "Not enough credits"}</Button><Button onClick={onCancel} variant="outline">Cancel</Button><Button onClick={onWhy} variant="ghost">Why?</Button></div>{why ? <div className="mt-3 border border-border bg-background/60 p-3 text-sm text-muted-foreground">{plan.reasoning.map((r) => <p key={r} className="mb-2">{r}</p>)}<p>{plan.manual}</p></div> : null}</div>;
}
