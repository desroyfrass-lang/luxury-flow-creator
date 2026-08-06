import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { BuilderComposer } from "@/components/builder-composer";
import { describeAttachments } from "@/lib/builder-attachments";
import {
  getBuilderJourney,
  journeyTurn,
  setJourneyStage,
  startJourneyTrack,
  type ConversationDiagnostics,
  type JourneyMessage,
} from "@/lib/journey.functions";
import { stageById, stageIndex, stagesFor, trackMinutes, trackOf } from "@/lib/journey";
import { useIsAdminStatus } from "@/hooks/use-is-admin";
import { LaunchReadiness } from "@/components/launch-readiness";
import { COMMISSIONING_PHASES } from "@/lib/commissioning";
import { useFrassyPrefs } from "@/hooks/use-frassy-prefs";
import { speakLine, stopSpeaking } from "@/lib/frassy-voice";
import { installAudioUnlockListener, isAudioUnlocked, unlockAudio } from "@/lib/audio-unlock";
import { useVoiceDictation } from "@/hooks/use-voice-dictation";

type ConversationMode = "text" | "voice_text" | "voice_only";
const MODE_LABELS: Record<ConversationMode, string> = {
  text: "Text only",
  voice_text: "Voice + text",
  voice_only: "Voice only",
};

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
  const turn = useServerFn(journeyTurn);
  const jumpStage = useServerFn(setJourneyStage);
  const switchTrack = useServerFn(startJourneyTrack);
  const { isAdmin, loading: roleLoading } = useIsAdminStatus();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["builder-journey"],
    queryFn: () => loadJourney(),
  });

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState<LocalMessage[]>([]);
  const [mode, setMode] = useState<ConversationMode>("text");
  const [speaking, setSpeaking] = useState(false);
  const [voiceBlocked, setVoiceBlocked] = useState(false);
  const [diagnostics, setDiagnostics] = useState<ConversationDiagnostics | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);
  const founderRef = useRef(false);
  const modeRef = useRef<ConversationMode>("text");
  modeRef.current = mode;
  const lastSpokenRef = useRef<string>("");

  const { prefs, update: updatePrefs, hydrated: prefsHydrated } = useFrassyPrefs();

  // Prime the browser's audio gate on the very first gesture anywhere on the page.
  useEffect(() => installAudioUnlockListener(), []);

  useEffect(() => {
    if (!prefsHydrated) return;
    setMode(prefs.communicationMode === "silent" ? "text" : prefs.communicationMode);
  }, [prefsHydrated, prefs.communicationMode]);

  const chooseMode = (m: ConversationMode) => {
    // This click IS the user gesture — use it to unlock audio playback.
    unlockAudio();
    setMode(m);
    modeRef.current = m;
    updatePrefs({ communicationMode: m === "text" ? "silent" : m, muted: false });
    if (m === "text") {
      stopSpeaking();
      setSpeaking(false);
      dictationRef.current?.stop();
      return;
    }
    setVoiceBlocked(false);
    // Entering a voice mode should immediately give Frassy her voice back.
    const lastReply = [...messagesRef.current].reverse().find((x) => x.role === "assistant");
    if (lastReply) speakReply(lastReply.content);
    else dictationRef.current?.start();
  };

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

  useEffect(() => () => stopSpeaking(), []);

  const dictation = useVoiceDictation(
    (text) => {
      // Voice modes are continuous: what you say is sent, no button press.
      if (modeRef.current !== "text") void send(text);
      else setDraft((p) => (p ? `${p} ${text}` : text));
    },
    {
      // Push-to-interrupt: the Builder speaking always takes the floor.
      onSpeechStart: () => {
        stopSpeaking();
        setSpeaking(false);
      },
    },
  );

  const dictationRef = useRef(dictation);
  dictationRef.current = dictation;

  const speakReply = (text: string) => {
    if (modeRef.current === "text" || !text) return;
    lastSpokenRef.current = text;
    if (!isAudioUnlocked()) {
      // No gesture yet — the browser will refuse. Ask once instead of failing mute.
      setVoiceBlocked(true);
      return;
    }
    setVoiceBlocked(false);
    setSpeaking(true);
    speakLine(text, {
      prefs: { ...prefs, muted: false, communicationMode: "voice_text" },
      tone: "welcome",
      onDone: () => {
        setSpeaking(false);
        // Continuous conversation: hand the floor straight back to the speaker.
        if (modeRef.current !== "text") dictationRef.current.start();
      },
      onBlocked: () => {
        setSpeaking(false);
        setVoiceBlocked(true);
      },
    });
  };

  /** User tapped "Let Frassy speak" — a real gesture, so unlock and replay. */
  const enableVoicePlayback = () => {
    unlockAudio();
    setVoiceBlocked(false);
    const text =
      lastSpokenRef.current ||
      [...messagesRef.current].reverse().find((m) => m.role === "assistant")?.content ||
      "";
    if (text) speakReply(text);
    else dictationRef.current.start();
  };

  const send = async (text: string, opening = false) => {
    if (busy) return;
    stopSpeaking();
    setBusy(true);
    if (text) setLocal((p) => [...p, { role: "user", content: text }]);
    try {
      const res = await turn({ data: { message: text, opening } });
      setDiagnostics(res.diagnostics);
      setLocal([]);
      await refetch();
      speakReply(res.reply);
      if (res.movedTo) {
        toast.success(
          `${isOwnerTrack ? "Commissioned" : "Chapter"} complete — next: ${stageById(res.movedTo).title}`,
        );
      }
      if (res.completed)
        toast.success(
          isOwnerTrack
            ? "Frass OS is commissioned and ready to welcome its first Builder."
            : "Your Builder Journey is complete.",
        );
    } catch (err) {
      setLocal((p) => p.filter((m) => m.content !== text));
      toast.error(err instanceof Error ? err.message : "Frassy couldn't respond just now.");
    } finally {
      setBusy(false);
    }
  };

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

  // First session on this track: let Frassy open the conversation.
  useEffect(() => {
    // Wait for the saved voice preference, otherwise the opening line is
    // generated while mode is still "text" and is never spoken.
    if (isLoading || roleLoading || !prefsHydrated || !data || openedRef.current) return;
    if (isAdmin === true && track !== "owner") return;
    // Founder corrections and legacy Builder-style prompts must not suppress
    // the deterministic Control Room opening. The server removes contaminated
    // assistant replies; only a valid assistant turn proves this track opened.
    const hasValidAssistantOpening = (data.messages ?? []).some(
      (m: JourneyMessage) => trackOf(m.stage) === track && m.role === "assistant",
    );
    openedRef.current = true;
    if (!hasValidAssistantOpening) {
      void send("", true);
    } else if (modeRef.current !== "text") {
      // Returning to a voice session: Frassy greets out loud with where we left off.
      const lastReply = [...messagesRef.current].reverse().find((m) => m.role === "assistant");
      if (lastReply) speakReply(lastReply.content);
    }
  }, [isLoading, roleLoading, prefsHydrated, data, isAdmin, track]);

  // Hands-free loop: whenever Frassy is done and nothing is happening,
  // the microphone reopens on its own in the voice modes.
  useEffect(() => {
    if (mode === "text" || voiceBlocked) return;
    if (busy || speaking || dictation.listening || !dictation.supported) return;
    const t = window.setTimeout(() => dictationRef.current.start(), 400);
    return () => window.clearTimeout(t);
  }, [mode, voiceBlocked, busy, speaking, dictation.listening, dictation.supported]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    void send(text);
  };

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
              to="/welcome-hall"
              className="mt-8 block rounded-sm border border-[color:var(--gold)] px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--gold)]"
            >
              Enter the Welcome Hall
            </Link>
          )}
        </aside>

        <div className="space-y-8">
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

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  How we talk
                </span>
                {(["text", "voice_text", "voice_only"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => chooseMode(m)}
                    className={`rounded-sm border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition ${
                      mode === m
                        ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10 text-[color:var(--gold)]"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {MODE_LABELS[m]}
                  </button>
                ))}
                {speaking && (
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      setSpeaking(false);
                    }}
                    className="rounded-sm border border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                  >
                    Stop voice
                  </button>
                )}
              </div>

              {mode !== "text" && voiceBlocked && (
                <button
                  type="button"
                  onClick={enableVoicePlayback}
                  className="mt-3 w-full rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)]/10 px-4 py-3 text-left text-xs text-[color:var(--gold)] transition hover:bg-[color:var(--gold)]/20"
                >
                  <span className="font-bold uppercase tracking-[0.24em]">
                    Tap to let Frassy speak
                  </span>
                  <span className="mt-1 block normal-case tracking-normal text-muted-foreground">
                    Your browser blocks sound until you interact with the page once. One tap and the
                    conversation runs hands-free from here.
                  </span>
                </button>
              )}
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
                    {m.role === "assistant" && mode !== "text" && (
                      <button
                        type="button"
                        onClick={() => speakReply(m.content)}
                        className="mt-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--gold)] hover:text-foreground"
                      >
                        Hear Frassy
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {busy && (
                <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
                  Frassy is thinking…
                </div>
              )}
              {speaking && !busy && (
                <div role="status" aria-live="polite" className="text-sm text-[color:var(--gold)]">
                  Frassy is speaking…
                </div>
              )}
              {dictation.listening && (
                <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
                  Listening… {dictation.interim}
                </div>
              )}
              <div ref={endRef} />
            </div>

            <BuilderComposer
              variant="page"
              value={draft}
              onChange={setDraft}
              onSend={(text, files) => {
                stopSpeaking();
                setSpeaking(false);
                const line = files.length ? `[Attached: ${describeAttachments(files)}]` : "";
                const payload = [text.trim(), line].filter(Boolean).join("\n");
                if (payload) void send(payload);
              }}
              disabled={busy}
              mode={mode}
              dictation={dictation}
              thinking={busy}
              speaking={speaking}
              canSaveToVault
              placeholder={
                mode === "voice_text"
                  ? "Speak or type — upload anything Frassy should see."
                  : "Answer in your own words, or attach a file, photo, or note…"
              }
              hint="Saved automatically"
            />
          </section>
        </div>
      </div>
      <PageFeedback pageTitle={isOwnerTrack ? "Founder Commissioning" : "Builder Onboarding"} />
    </SiteShell>
  );
}
