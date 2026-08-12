// ─────────────────────────────────────────────────────────────────────────────
// Frassy — Conversation Engine v2 (Phase 1: minimal, text-only)
//
// ARCHITECTURE RULE: Frassy must never generate a message without an explicit
// user turn. No autonomous behaviour. No background reasoning. No automatic
// continuation. No multi-turn automation. No voice. No streaming.
//
// Flow: user types → presses Send → exactly one assistant reply → wait.
//
// Voice, streaming TTS, barge-in and continuous listening are intentionally
// NOT wired here. They return only after Phase 2 acceptance testing.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { X, ShoppingBag, Trash2, Volume2, VolumeX, Mic } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import symbolAsset from "@/assets/frass-logo-symbol.asset.json";
import { readArrivalIntent } from "@/lib/frassy/context";
import { useFrassyContext } from "@/hooks/use-frassy-context";
import { useIsAdminStatus } from "@/hooks/use-is-admin";
import { FrassyComposer } from "@/components/workspace/frassy-composer";
import { usePushToTalk } from "@/hooks/use-push-to-talk";
import { SpeechControls } from "@/components/voice/speech-controls";
import { VoiceFeedbackButton } from "@/components/feedback/voice-feedback";
import { useFrassyStartup } from "@/hooks/use-frassy-startup";
import { loadTranscript, saveTranscript, type FrassyTurn } from "@/lib/frassy/transcript";
import { VOICE_TIER_LABELS } from "@/lib/voice/voice-tier";
// FRASS-0478 — she learns how you like to work, never who you are.
import {
  observeInterruption,
  observeNudge,
  observeTurn,
  workingStyleContext,
} from "@/lib/frassy/working-style";
// FRASS-0482 — the business already inside the person.
import { loadProfile, partnerContext } from "@/lib/business/partner-profile";


type ProductCard = {
  handle: string;
  title: string;
  price: string;
  currency: string;
  image: string | null;
  url: string;
  vendor?: string;
};

type OrderCard = {
  name: string;
  financial_status: string;
  fulfillment_status: string;
  total: string;
  currency: string;
  items: Array<{ title: string; quantity: number }>;
  tracking: Array<{ number: string; url: string; company: string; eta: string | null }>;
};

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ProductCard[];
  order?: OrderCard | null;
};

let seq = 0;
const nextId = () => `m${++seq}-${Date.now()}`;

export function FrassyChat({ embedded = false }: { embedded?: boolean } = {}) {
  const [open, setOpen] = useState(embedded);
  // FRASS-0476B — one shared conversation history. A refresh or a change of
  // district continues the same conversation instead of restarting it.
  const [messages, setMessages] = useState<Msg[]>([]);
  useEffect(() => {
    const prior = loadTranscript();
    if (prior.length) {
      setMessages(prior.map((t: FrassyTurn) => ({ id: nextId(), role: t.role, content: t.content })));
    }
  }, []);
  useEffect(() => {
    if (messages.length) saveTranscript(messages.map((m) => ({ role: m.role, content: m.content })));
  }, [messages]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Frassy speaks her replies aloud again — unless the Builder mutes her.
  const [speakReplies, setSpeakReplies] = useState(true);

  const items = useCartStore((s) => s.items);
  const ctx = useFrassyContext();
  const { isAdmin } = useIsAdminStatus();
  const voice = usePushToTalk();

  // Welcome Hall is Frassy's front desk. Open the one shared panel there;
  // every other public page keeps the unobtrusive companion beacon.
  useEffect(() => {
    if (ctx.pathname === "/welcome-hall") setOpen(true);
  }, [ctx.pathname]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Turn ownership: exactly one in-flight assistant turn, owned by one user turn.
  const turnRef = useRef(0);

  // FRASS-0475 — the shared startup sequence. Verifies layout, chat, voice and
  // context before Frassy says a word, repairs a distorted panel in place, and
  // guarantees she is never silent for more than three seconds.
  const startup = useFrassyStartup({
    panelRef,
    embedded,
    active: open || embedded,
    contextReady: Boolean(ctx),
    speechAllowed: speakReplies,
  });

  const toggleReplyVoice = useCallback(() => {
    if (speakReplies) {
      if (voice.phase === "speaking") voice.stopSpeaking();
      setSpeakReplies(false);
      return;
    }
    // This runs directly inside the Builder's gesture, satisfying browser
    // autoplay rules. Enabling voice is an action, never a silent preference.
    setSpeakReplies(true);
    void startup.speakGreetingNow();
  }, [speakReplies, startup, voice]);

  useEffect(() => {
    const enableVoice = () => {
      setSpeakReplies(true);
      void startup.speakGreetingNow();
    };
    window.addEventListener("frassy-voice-enable", enableVoice);
    return () => window.removeEventListener("frassy-voice-enable", enableVoice);
  }, [startup]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Abort any in-flight turn when the widget unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const cartContext = items.length
    ? items
        .map((i) => `${i.quantity}× ${i.product.node.title} (${i.variantTitle})`)
        .join(", ")
        .slice(0, 500)
    : "";

  function stopTurn() {
    turnRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }

  // One user turn → one assistant turn. `spoken` only decides whether that
  // single reply is also read aloud; it never schedules another turn.
  //
  // COMPOSER CONTRACT: the composer is the single source of truth. Whatever the
  // box holds at press time is frozen, appended, sent, and cleared — in that
  // order — before any await happens.
  async function send(override?: string, spoken = false) {
    // Typed sends are blocked while busy; a voice turn passes its own text in.
    if (loading || (override === undefined && voice.phase !== "idle")) return;
    const before = input;
    const text = (override ?? before).trim();
    if (!text) return;

    const myTurn = ++turnRef.current;
    const userMsg: Msg = { id: nextId(), role: "user", content: text };
    const history = [...messages, userMsg];

    // Freeze + clear synchronously, before the request leaves.
    setMessages(history);
    setInput("");
    setError(null);
    setLoading(true);

    if (import.meta.env.DEV) {
      // Composer integrity trace: these must agree.
      console.info("[composer]", {
        beforeSend: before,
        outgoing: text,
        rendered: userMsg.content,
        inputAfter: "",
      });
    }

    const controller = new AbortController();
    abortRef.current = controller;

    // Did they take her up on the gentle offer of help, or work straight past it?
    observeNudge(startup.presence === "idle");

    // FRASS-0478 — observe *how* they work (channel, length, timing), then hand
    // Frassy manner-guidance only. Nothing here leaves the browser as raw data.
    const style = observeTurn({ channel: spoken ? "voice" : "text", text });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          cartContext,
          modeContext: ctx.mode,
          experienceContext: isAdmin ? "founder" : "storefront",
          // FRASS-0451A — where we are, and why they came.
          districtPath: ctx.pathname,
          arrivalIntent: readArrivalIntent() ?? undefined,
          // Actual runtime interaction mode, so Frassy never misstates her capabilities.
          interactionMode: spoken ? "voice_and_text" : "text",
          voiceAvailable: voice.voiceAvailable,
          workingStyleContext: workingStyleContext(style) || undefined,
          // FRASS-0482 — Frassy plans around the business already inside the person.
          partnerContext: partnerContext(loadProfile()) || undefined,
          stream: false,
        }),
      });

      const data = (await res.json()) as {
        reply?: string;
        error?: string;
        cards?: { products?: ProductCard[]; order?: OrderCard | null };
      };

      // Stale-turn guard: a superseded or stopped turn can never write to the UI.
      if (turnRef.current !== myTurn) return;

      if (!res.ok || data.error) {
        setError(data.error ?? "I hit a snag reaching my systems. Try again in a sec?");
        return;
      }

      const reply = data.reply?.trim() || "…";
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: reply,
          products: data.cards?.products ?? [],
          order: data.cards?.order ?? null,
        },
      ]);

      if ((spoken || speakReplies) && voice.voiceAvailable) {
        setLoading(false);
        await voice.speak(reply);
        // Playback finished → conversation waits. The mic stays closed.
      }
    } catch (err) {
      if (turnRef.current !== myTurn) return;
      if ((err as Error)?.name === "AbortError") return;
      setError("I hit a snag reaching my systems. Try again in a sec?");
    } finally {
      if (turnRef.current === myTurn) {
        setLoading(false);
        abortRef.current = null;
        inputRef.current?.focus();
      }
    }
  }

  // Push-to-talk: press → record, press again → transcribe → one spoken turn.
  async function toggleMic() {
    if (voice.phase === "speaking") {
      // Cutting her off mid-sentence is the clearest "shorter, please" signal.
      observeInterruption();
      voice.stopSpeaking();
      return;
    }
    if (voice.phase === "recording") {
      const transcript = await voice.stopRecording();
      if (!transcript) return;
      // Anything already typed is part of the same turn — never left behind.
      const typed = input.trim();
      await send(typed ? `${typed} ${transcript}` : transcript, true);
      return;
    }
    if (voice.phase === "idle" && !loading) await voice.startRecording();
  }

  if (!open && !embedded) {
    return (
      <button
        type="button"
        aria-label="Open Frassy chat"
        onClick={() => setOpen(true)}
        title="Frassy is here — ask me anything"
        className="frassy-beacon fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--gold)]/50 bg-[#0b0c0e] shadow-lg transition-transform hover:scale-105"
      >
        <img src={symbolAsset.url} alt="" className="h-7 w-7 object-contain" />
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      data-frassy-panel
      data-frassy-phase={startup.phase}
      aria-busy={startup.phase === "verifying" || startup.phase === "recovering"}
      className={
        `${startup.phase === "verifying" || startup.phase === "recovering" ? "invisible pointer-events-none" : "visible"} ${embedded
          ? "frass-workspace ws-dark flex h-[min(640px,78vh)] min-h-[420px] w-full flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0b0c0e]"
          : "frass-workspace ws-dark fixed bottom-5 right-5 z-50 flex h-[min(620px,80vh)] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0b0c0e] shadow-2xl"}`
      }
    >
      <header
        data-frassy-toolbar
        className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-white/10 px-4 py-3"
      >
        <div className="flex min-w-0 items-center gap-3">
          <img src={symbolAsset.url} alt="" className="h-6 w-6 object-contain" />
          <div>
            <div className="text-sm text-white">Frassy</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              {voice.phase === "recording"
                ? "Listening…"
                : voice.phase === "transcribing"
                  ? "Transcribing…"
                  : voice.phase === "speaking"
                    ? "Speaking…"
                    : loading
                      ? "Thinking…"
                      : startup.presence === "working"
                        ? "Nearby"
                        : "Waiting"}
            </div>
            {/* FRASS-0477 — never make the member guess which voice they hear. */}
            {speakReplies && startup.voiceTier !== "unknown" && (
              <div
                data-frassy-voice-tier={startup.voiceTier}
                className={`mt-0.5 flex items-center gap-1 text-[9px] tracking-[0.12em] ${
                  startup.voiceTier === "cloud" ? "text-[color:var(--gold)]/80" : "text-white/45"
                }`}
              >
                <Mic className="h-2.5 w-2.5" />
                {VOICE_TIER_LABELS[startup.voiceTier]}
              </div>
            )}
          </div>
        </div>
        <div data-frassy-voice className="flex shrink-0 items-center gap-1">
          {/* Voice: tap to let Frassy speak her replies aloud, or mute her. */}
          <button
            type="button"
            onClick={toggleReplyVoice}
            title={
              speakReplies
                ? "Frassy speaks her replies — tap to mute"
                : "Frassy is muted — tap to let her speak"
            }
            className={`mr-1 inline-flex items-center gap-1 rounded-sm border px-1.5 py-1 text-[9px] uppercase tracking-[0.18em] transition ${
              speakReplies
                ? "border-[color:var(--gold)]/40 text-[color:var(--gold)]"
                : "border-white/20 text-white/50 hover:text-white"
            }`}
          >
            {speakReplies ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
            {speakReplies ? "Voice on" : "Muted"}
          </button>

          {loading && (
            <button
              type="button"
              onClick={stopTurn}
              className="rounded-sm border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70 hover:text-white"
            >
              Stop
            </button>
          )}
          <button
            type="button"
            aria-label="Clear conversation"
            onClick={() => {
              stopTurn();
              setMessages([]);
              setError(null);
            }}
            className="rounded-sm p-2 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {!embedded && (
            <button
              type="button"
              aria-label="Close Frassy chat"
              onClick={() => {
                stopTurn();
                setOpen(false);
              }}
              className="rounded-sm p-2 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <div
        ref={scrollRef}
        data-frassy-transcript
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {startup.greeting && (
          <div className="w-fit max-w-[90%] rounded-lg bg-white/5 px-3 py-2 text-sm text-white/90">
            <p className="whitespace-pre-wrap">{startup.greeting}</p>
          </div>
        )}

        {startup.notice && (
          <div className="rounded-sm border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/10 px-3 py-2 text-xs text-white/80">
            {startup.notice}
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id}>
            <div
              className={
                m.role === "user"
                  ? "ml-auto w-fit max-w-[85%] rounded-lg bg-[color:var(--gold)]/15 px-3 py-2 text-sm text-white"
                  : "w-fit max-w-[90%] rounded-lg bg-white/5 px-3 py-2 text-sm text-white/90"
              }
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>

            {/* "Hear Frassy" only exists while playback is provably healthy. */}
            {m.role === "assistant" && voice.voiceAvailable && voice.phase !== "recording" && (
              <button
                type="button"
                onClick={() => void voice.speak(m.content)}
                disabled={voice.phase === "speaking"}
                className="mt-2 inline-flex items-center gap-1.5 rounded-sm border border-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white disabled:opacity-40"
              >
                <Volume2 className="h-3 w-3" /> Hear Frassy
              </button>
            )}

            {!!m.products?.length && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {m.products.map((p) => (
                  <a
                    key={`${m.id}-${p.handle}`}
                    href={p.url}
                    className="group overflow-hidden rounded-sm border border-white/10 hover:border-[color:var(--gold)]/50"
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        loading="lazy"
                        className="h-24 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-24 items-center justify-center bg-white/5">
                        <ShoppingBag className="h-5 w-5 text-white/30" />
                      </div>
                    )}
                    <div className="px-2 py-2">
                      <div className="truncate text-[11px] text-white">{p.title}</div>
                      <div className="mt-0.5 text-[10px] text-white/50">
                        {p.currency} {p.price}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {m.order && (
              <div className="mt-3 rounded-sm border border-white/10 px-3 py-3 text-xs text-white/70">
                <div className="text-white">{m.order.name}</div>
                <div className="mt-1">
                  {m.order.financial_status} · {m.order.fulfillment_status} · {m.order.currency}{" "}
                  {m.order.total}
                </div>
                {m.order.tracking.map((t) => (
                  <a
                    key={t.number}
                    href={t.url}
                    className="mt-2 block text-[color:var(--gold)] hover:underline"
                  >
                    Track {t.number} ({t.company})
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="w-fit rounded-lg bg-white/5 px-3 py-2 text-sm text-white/50">Typing…</div>
        )}

        {(error || voice.voiceError) && (
          <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error ?? voice.voiceError}
          </div>
        )}
      </div>

      {voice.isSpeaking || voice.isPaused ? (
        <div className="shrink-0 border-t border-white/10 px-3 py-2">
          <SpeechControls />
        </div>
      ) : null}

      {/* FRASS-0412 — temporary launch feedback program */}
      <div className="shrink-0 border-t border-white/10 px-3 py-2">
        <VoiceFeedbackButton source="chat" />
      </div>

      <div data-frassy-composer className="shrink-0">
        <FrassyComposer
          value={input}
          onChange={setInput}
          onSend={() => void send()}
          loading={loading}
          placeholder="Ask Frassy anything…"
          onMic={voice.voiceAvailable ? () => void toggleMic() : undefined}
          micAvailable={voice.voiceAvailable}
          micActive={voice.phase === "recording"}
        />
      </div>
    </div>
  );
}
