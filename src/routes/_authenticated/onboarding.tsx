import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import {
  getBuilderJourney,
  journeyTurn,
  setJourneyStage,
  startJourneyTrack,
  type JourneyMessage,
} from "@/lib/journey.functions";
import {
  stageById,
  stageIndex,
  stagesFor,
  trackMinutes,
  trackOf,
} from "@/lib/journey";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { LaunchReadiness } from "@/components/launch-readiness";
import { COMMISSIONING_PHASES } from "@/lib/commissioning";
import { useFrassyPrefs } from "@/hooks/use-frassy-prefs";
import { speakLine, stopSpeaking } from "@/lib/frassy-voice";
import { useVoiceDictation } from "@/hooks/use-voice-dictation";

type ConversationMode = "text" | "voice_text" | "voice_only";
const MODE_KEY = "frass:onboarding:mode";
const MODE_LABELS: Record<ConversationMode, string> = {
  text: "Text only",
  voice_text: "Voice + text",
  voice_only: "Voice only",
};


export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Your Builder Journey — Frass OS" },
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
  const isAdmin = useIsAdmin();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["builder-journey"],
    queryFn: () => loadJourney(),
  });

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState<LocalMessage[]>([]);
  const [mode, setMode] = useState<ConversationMode>("text");
  const [speaking, setSpeaking] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);
  const founderRef = useRef(false);
  const modeRef = useRef<ConversationMode>("text");
  modeRef.current = mode;

  const { prefs } = useFrassyPrefs();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(MODE_KEY) as ConversationMode | null;
    if (saved === "text" || saved === "voice_text" || saved === "voice_only") setMode(saved);
  }, []);

  const chooseMode = (m: ConversationMode) => {
    setMode(m);
    if (typeof window !== "undefined") window.localStorage.setItem(MODE_KEY, m);
    if (m === "text") {
      stopSpeaking();
      setSpeaking(false);
    }
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

  useEffect(() => {
    inputRef.current?.focus();
  }, [busy, stage.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, busy]);

  useEffect(() => () => stopSpeaking(), []);

  const dictation = useVoiceDictation((text) => {
    if (modeRef.current === "voice_only") void send(text);
    else setDraft((p) => (p ? `${p} ${text}` : text));
  });
  const dictationRef = useRef(dictation);
  dictationRef.current = dictation;

  const speakReply = (text: string) => {
    if (modeRef.current === "text" || !text) return;
    setSpeaking(true);
    speakLine(text, {
      prefs: { ...prefs, muted: false, communicationMode: "voice_text" },
      tone: "welcome",
      onDone: () => {
        setSpeaking(false);
        // Voice only: hand the floor straight back to the speaker.
        if (modeRef.current === "voice_only") dictationRef.current.start();
      },
    });
  };

  const send = async (text: string, opening = false) => {
    if (busy) return;
    stopSpeaking();
    setBusy(true);
    if (text) setLocal((p) => [...p, { role: "user", content: text }]);
    try {
      const res = await turn({ data: { message: text, opening } });
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
    if (isLoading || !data || founderRef.current || isAdmin !== true) return;
    if (trackOf(data.currentStage) === "owner") {
      founderRef.current = true;
      return;
    }
    founderRef.current = true;
    void (async () => {
      await switchTrack({ data: { track: "owner" } });
      await refetch();
    })();
  }, [isLoading, data, isAdmin]);

  // First session on this track: let Frassy open the conversation.
  useEffect(() => {
    if (isLoading || !data || openedRef.current) return;
    if (isAdmin === true && !founderRef.current) return;
    const hasTrackMessages = (data.messages ?? []).some(
      (m: JourneyMessage) => trackOf(m.stage) === track,
    );
    if (!hasTrackMessages) {
      openedRef.current = true;
      void send("", true);
    }
  }, [isLoading, data, isAdmin, track]);


  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    void send(text);
  };

  if (needsFounderChoice) {
    const choose = async (t: "owner" | "builder") => {
      setBusy(true);
      try {
        await switchTrack({ data: { track: t } });
        openedRef.current = true;
        await refetch();
        await send("", true);
      } finally {
        setBusy(false);
      }
    };

    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
            Frass Operating System
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight">
            Welcome back. Are we commissioning Frass OS today, or would you like to enter as a
            Builder?
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            You can switch between the two at any time — nothing is lost either way.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void choose("owner")}
              className="rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)]/5 p-6 text-left transition hover:bg-[color:var(--gold)]/10 disabled:opacity-50"
            >
              <div className="font-display text-2xl">Commission Frass OS</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Five phases — platform identity, commerce, the Builder experience, operations, and
                launch readiness. We prepare the place others will enter.
              </p>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void choose("builder")}
              className="rounded-sm border border-border p-6 text-left transition hover:border-foreground/40 disabled:opacity-50"
            >
              <div className="font-display text-2xl">Enter as a Builder</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Walk the same journey every Builder walks — mission, identity, memory, and the
                districts.
              </p>
            </button>
          </div>

          <Link
            to="/founder"
            className="mt-10 inline-block text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground"
          >
            Open Founder Mode instead
          </Link>
        </div>
      </SiteShell>
    );
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
            {isOwnerTrack ? "Founder Commissioning" : "Your Builder Journey"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {isOwnerTrack
              ? "Frassy walks you through commissioning Frass OS across five phases — identity, commerce, the Builder experience, operations, and launch."
              : "Frassy walks you through who you are and what you're building, one chapter at a time."}{" "}
            About {Math.round(trackMinutes(track) / 60)} hours at your pace, across as many sessions
            as you like. Everything is saved — leave whenever you want and Frassy picks up exactly
            where you left off.
          </p>

          {isAdmin && (
            <div className="mt-5 flex gap-2">
              {(["owner", "builder"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={busy || t === track}
                  onClick={async () => {
                    await switchTrack({ data: { track: t } });
                    openedRef.current = true;
                    await refetch();
                  }}
                  className={`flex-1 rounded-sm border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition ${
                    t === track
                      ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10 text-[color:var(--gold)]"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "owner" ? "Commission Frass OS" : "Builder journey"}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6">
            <div className="h-px w-full bg-border">
              <div
                className="h-px bg-[color:var(--gold)] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              {completedCount} of {stages.length} {isOwnerTrack ? "commissioning steps" : "chapters"}
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
        {isOwnerTrack && (finished || stage.chapter.includes("Launch")) && (
          <LaunchReadiness
            completedStageIds={Object.keys(data?.stageProgress ?? {}).filter(
              (id) => trackOf(id) === "owner",
            )}
          />
        )}

        {/* Conversation */}
        <section className="min-h-[70vh] rounded-sm border border-border bg-background/40">
          <header className="border-b border-border px-6 py-5">
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              {isOwnerTrack ? stage.chapter : `Chapter ${idx + 1} · ${stage.chapter}`}
            </div>
            <h2 className="mt-2 font-display text-2xl">{stage.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{stage.purpose}</p>
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
              <div className="text-sm text-muted-foreground">Frassy is thinking…</div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={onSubmit} className="border-t border-border px-6 py-5">
            <textarea
              ref={inputRef}
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
              placeholder="Take your time — answer in your own words."
              className="w-full resize-none rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Saved automatically
              </span>
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className="lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)] disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </form>
        </section>
        </div>
      </div>
      <PageFeedback pageTitle={isOwnerTrack ? "Founder Commissioning" : "Builder Onboarding"} />
    </SiteShell>
  );
}
