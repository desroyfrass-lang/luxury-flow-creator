import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { FrassyComposer } from "@/components/workspace/frassy-composer";
import {
  getBuilderJourney,
  journeyTurn,
  setJourneyStage,
  startJourneyTrack,
  journeyOpening,
  type ConversationDiagnostics,
  type JourneyMessage,
} from "@/lib/journey.functions";
import { stageById, stageIndex, stagesFor, trackMinutes, trackOf } from "@/lib/journey";
import { useIsAdminStatus } from "@/hooks/use-is-admin";
import { LaunchReadiness } from "@/components/launch-readiness";
import { FounderWalkthrough } from "@/components/founder/founder-walkthrough";
import { COMMISSIONING_PHASES } from "@/lib/commissioning";
import { usePushToTalk } from "@/hooks/use-push-to-talk";
import { Volume2, VolumeX } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Founder Commissioning | Frass OS" },
      {
        name: "description",
        content:
          "Commission Frass OS with Frassy across identity, commerce, Builder experience, operations, and launch readiness.",
      },
      { property: "og:title", content: "Founder Commissioning | Frass OS" },
      {
        property: "og:description",
        content:
          "Commission Frass OS with Frassy across identity, commerce, Builder experience, operations, and launch readiness.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OnboardingPage,
});

type LocalMessage = { role: "user" | "assistant"; content: string; pending?: boolean };

function OnboardingPage() {
  const loadJourney = useServerFn(getBuilderJourney);
  const jumpStage = useServerFn(setJourneyStage);
  const takeTurn = useServerFn(journeyTurn);
  const switchTrack = useServerFn(startJourneyTrack);
  const openConversation = useServerFn(journeyOpening);
  const { isAdmin, loading: roleLoading } = useIsAdminStatus();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["builder-journey"],
    queryFn: () => loadJourney(),
  });

  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState<LocalMessage[]>([]);
  const [diagnostics, setDiagnostics] = useState<ConversationDiagnostics | null>(null);
  const [draft, setDraft] = useState("");
  // Frassy speaks her replies aloud unless the Founder mutes her.
  const [speakReplies, setSpeakReplies] = useState(true);
  const voice = usePushToTalk();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const founderRef = useRef(false);
  const openedRef = useRef(false);

  const stage = stageById(data?.currentStage ?? "mission");
  const idx = stageIndex(stage.id);
  const track = trackOf(stage.id);
  const isOwnerTrack = track === "owner";
  const stages = stagesFor(stage.id);
  const completedCount = Object.keys(data?.stageProgress ?? {}).filter(
    (id) => trackOf(id) === track,
  ).length;
  const pct = Math.round((completedCount / stages.length) * 100);
  const finished = data?.status === "complete";

  // Only this track's conversation belongs on screen.
  const messages: LocalMessage[] = useMemo(() => {
    const saved = (data?.messages ?? [])
      .filter((m: JourneyMessage) => trackOf(m.stage) === track)
      .map((m: JourneyMessage) => ({ role: m.role, content: m.content }));
    return [...saved, ...local];
  }, [data?.messages, local, track]);

  const messagesRef = useRef<LocalMessage[]>(messages);
  messagesRef.current = messages;

  // Founder decisions are Platform Memory, kept separate from Builder memory.
  const platformMemory = useMemo(
    () => (data?.memory ?? []).filter((m) => m.category.startsWith("platform:")),
    [data?.memory],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, [busy, stage.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, busy]);

  // Founders land in the Commissioning Journey, not the Builder Journey.
  useEffect(() => {
    if (isLoading || roleLoading || !data || founderRef.current || isAdmin !== true) return;
    if (trackOf(data.currentStage) === "owner") {
      founderRef.current = true;
      return;
    }
    founderRef.current = true;
    void (async () => {
      await switchTrack({ data: { track: "owner" } });
      await refetch();
    })();
  }, [isLoading, roleLoading, data, isAdmin, switchTrack, refetch]);

  // FRASS-0563 — Frassy always speaks first. If this conversation has no
  // messages yet, she opens it herself (aloud when voice is permitted) rather
  // than leaving a new member staring at an empty box.
  useEffect(() => {
    if (isLoading || roleLoading || !data || openedRef.current) return;
    if (messages.length > 0) return;
    openedRef.current = true;
    setBusy(true);
    void openConversation()
      .then(async (res) => {
        if (!res?.reply) return;
        setLocal([{ role: "assistant", content: res.reply }]);
        if (speakReplies && voice.voiceAvailable) void voice.speak(res.reply);
        await refetch();
        setLocal([]);
      })
      .catch(() => {
        openedRef.current = false;
      })
      .finally(() => setBusy(false));
  }, [isLoading, roleLoading, data, messages.length, openConversation, refetch, speakReplies, voice]);



  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setDraft("");
    setLocal((prev) => [...prev, { role: "user", content: message }]);
    setBusy(true);
    try {
      const result = await takeTurn({ data: { message } });
      setLocal((prev) => [...prev, { role: "assistant", content: result.reply }]);
      setDiagnostics(result.diagnostics);
      if (speakReplies && voice.voiceAvailable) void voice.speak(result.reply);
      await refetch();
      setLocal([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Frassy could not answer just now.");
      setLocal((prev) => prev.slice(0, -1));
      setDraft(message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleMic() {
    if (voice.phase === "speaking") {
      voice.stopSpeaking();
      return;
    }
    if (voice.phase === "recording") {
      const transcript = await voice.stopRecording();
      if (transcript?.trim()) await send(transcript);
      return;
    }
    if (voice.phase === "idle" && !busy) await voice.startRecording();
  }

  return (
    <SiteShell>
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[300px_1fr]">
        {/* Journey map */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
            Frass Operating System
          </div>
          <h1 className="mt-3 font-display text-3xl leading-tight">
            {isOwnerTrack ? "The Control Room" : "Your Builder Journey"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {isOwnerTrack
              ? "This is the commissioning of Frass Operating System. Frassy prepares the platform with you — identity, commerce, the Builder experience, operations, and launch — before your first Builder arrives."
              : "Frassy walks you through who you are and what you're building, one chapter at a time."}{" "}
            About {Math.round(trackMinutes(track) / 60)} hours at your pace, across as many sessions
            as you like. Everything is saved — leave whenever you want and Frassy picks up exactly
            where you left off.
          </p>

          {isAdmin && isOwnerTrack && (
            <div className="mt-5 rounded-sm border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[color:var(--gold)]">
                Founder identity verified
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Dedicated Platform Commissioning engine · Platform Memory only
              </p>
            </div>
          )}

          {isAdmin && (
            <a
              href="/admin/images"
              className="mt-4 inline-block rounded-sm border border-border px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
            >
              Admin console →
            </a>
          )}

          <div className="mt-6">
            <div className="h-px w-full bg-border">
              <div
                className="h-px bg-[color:var(--gold)] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              {completedCount} of {stages.length}{" "}
              {isOwnerTrack ? "commissioning steps" : "chapters"}
            </div>
          </div>

          <ol className="mt-8 space-y-1">
            {stages.map((s, i) => {
              const done = Boolean(data?.stageProgress?.[s.id]);
              const active = s.id === stage.id;
              const phase = isOwnerTrack
                ? COMMISSIONING_PHASES.find((ph) => ph.chapter === s.chapter)
                : null;
              const firstOfPhase = phase && phase.stages[0]?.id === s.id;
              return (
                <li key={s.id}>
                  {firstOfPhase && phase && (
                    <div className="mt-5 mb-1 px-3 text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
                      Phase {phase.number} · {phase.name}
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={busy || (!done && i > idx)}
                    onClick={async () => {
                      await jumpStage({ data: { stageId: s.id } });
                      await refetch();
                    }}
                    className={`flex w-full items-baseline gap-3 rounded-sm px-3 py-2 text-left text-sm transition ${
                      active
                        ? "bg-[color:var(--gold)]/10 text-foreground"
                        : done
                          ? "text-muted-foreground hover:text-foreground"
                          : "text-muted-foreground/50"
                    } disabled:cursor-default`}
                  >
                    <span className="w-5 shrink-0 text-[11px] tabular-nums text-[color:var(--gold)]">
                      {done ? "✓" : String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{s.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          {isOwnerTrack && platformMemory.length > 0 && (
            <div className="mt-8 rounded-sm border border-border px-4 py-4">
              <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
                Platform Memory
              </div>
              <ul className="mt-3 space-y-2">
                {platformMemory.slice(-8).map((m) => (
                  <li key={`${m.category}:${m.key}`} className="text-xs text-muted-foreground">
                    <span className="text-foreground">{m.key.replace(/_/g, " ")}</span> — {m.value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isOwnerTrack && (
            <Link
              to="/founder"
              className="mt-8 block rounded-sm border border-border px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
            >
              Founder Mode
            </Link>
          )}

          {finished && (
            <Link
              to="/builder-hall"
              className="mt-8 block rounded-sm border border-[color:var(--gold)] px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--gold)]"
            >
              Enter the Builder Hall
            </Link>
          )}
        </aside>

        <div className="space-y-8">
          {/* FRASS-0519 — the Founder walks the same front door, with validation attached. */}
          {isAdmin && isOwnerTrack && (
            <FounderWalkthrough stepId={stage.id} stepLabel={stage.title} />
          )}

          {isOwnerTrack && (
            <LaunchReadiness
              eyebrow="Commissioning Dashboard"
              heading="Platform Readiness"
              completedStageIds={Object.keys(data?.stageProgress ?? {}).filter(
                (id) => trackOf(id) === "owner",
              )}
              onSelectStage={async (stageId) => {
                await jumpStage({ data: { stageId } });
                await refetch();
              }}
            />
          )}

          {/* Conversation */}
          <section className="min-h-[70vh] rounded-sm border border-border bg-background/40">
            {isOwnerTrack && diagnostics && (
              <details
                className="border-b border-[color:var(--gold)]/30 bg-[color:var(--gold)]/5 px-6 py-4"
                open
              >
                <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.24em] text-[color:var(--gold)]">
                  Founder routing diagnostics · temporary
                </summary>
                <dl className="mt-4 grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="inline text-muted-foreground">Conversation Mode: </dt>
                    <dd className="inline">{diagnostics.conversationMode}</dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">System Prompt: </dt>
                    <dd className="inline font-mono">
                      {diagnostics.systemPrompt}_{diagnostics.promptVersion}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">Session Type: </dt>
                    <dd className="inline font-mono">{diagnostics.sessionType}</dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">Memory: </dt>
                    <dd className="inline font-mono">{diagnostics.memoryNamespace}</dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">History: </dt>
                    <dd className="inline font-mono">
                      {diagnostics.historySource} ({diagnostics.historyMessages})
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">Fallback: </dt>
                    <dd className="inline font-mono">{diagnostics.fallback}</dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">Identity Discovery: </dt>
                    <dd className="inline font-mono">{diagnostics.identityDiscovery}</dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">Stage: </dt>
                    <dd className="inline font-mono">{diagnostics.stageId}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="inline text-muted-foreground">Routing Decision: </dt>
                    <dd className="inline">{diagnostics.routingDecision}</dd>
                  </div>
                </dl>
              </details>
            )}
            <header className="border-b border-border px-6 py-5">
              <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                {isOwnerTrack ? stage.chapter : `Chapter ${idx + 1} · ${stage.chapter}`}
              </div>
              <h2 className="mt-2 font-display text-2xl">{stage.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{stage.purpose}</p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (speakReplies && voice.phase === "speaking") voice.stopSpeaking();
                    setSpeakReplies((v) => !v);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition ${
                    speakReplies
                      ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {speakReplies ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                  {speakReplies ? "Voice on" : "Muted"}
                </button>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {voice.phase === "recording"
                    ? "Listening…"
                    : voice.phase === "transcribing"
                      ? "Transcribing…"
                      : voice.phase === "speaking"
                        ? "Frassy is speaking"
                        : "Type or hold the mic"}
                </span>
              </div>
            </header>

            <div className="space-y-6 px-6 py-8">
              {isLoading && (
                <p className="text-sm text-muted-foreground">Bringing your journey back…</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[78%] rounded-sm bg-foreground/5 px-4 py-3 text-sm"
                        : "max-w-[78%] text-[15px] leading-relaxed whitespace-pre-wrap"
                    }
                  >
                    {m.role === "assistant" && (
                      <div className="mb-1 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                        Frassy
                      </div>
                    )}
                    {m.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
                  Frassy is thinking…
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="border-t border-border px-6 py-4">
              {(voice.voiceError) && (
                <p className="mb-2 text-xs text-destructive">{voice.voiceError}</p>
              )}
              <FrassyComposer
                value={draft}
                onChange={setDraft}
                onSend={() => void send(draft)}
                loading={busy}
                placeholder={`Talk to Frassy about ${stage.title}…`}
                onMic={voice.voiceAvailable ? () => void toggleMic() : undefined}
                micAvailable={voice.voiceAvailable}
                micActive={voice.phase === "recording"}
              />
            </div>
          </section>
        </div>
      </div>
      <PageFeedback pageTitle={isOwnerTrack ? "Founder Commissioning" : "Builder Onboarding"} />
    </SiteShell>
  );
}
