import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Send, ShoppingBag, Volume2, VolumeX, Settings } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import symbolAsset from "@/assets/frass-logo-symbol.asset.json";
import {
  useFrassyPrefs,
  pickGreeting,
  type FrassyPrefs,
  type FrassyCommunicationMode,
} from "@/hooks/use-frassy-prefs";
import { canSpeak, speakLine, stopSpeaking, VOICE_PROFILE_LABELS } from "@/lib/frassy-voice";
import { FrassyConsentModal } from "@/components/frassy-consent";

type Msg = { role: "user" | "assistant"; content: string };

const INITIAL_MSG: Msg = {
  role: "assistant",
  content:
    "Welcome to Frass Hill — I'm Frassy. Tap me anytime for styling, sizing, or to unlock 40% off your first order.",
};

const QUICK_ACTIONS = [
  { label: "🎁 Unlock 40% OFF", prompt: "How do I unlock the 40% off first purchase reward?" },
  { label: "How Try-On works", prompt: "How does the Try-On feature work?" },
  { label: "What's Capsule Checkout?", prompt: "What is Capsule Checkout?" },
  { label: "Shipping & returns", prompt: "Tell me about shipping and returns." },
];

const GREETED_STORAGE_KEY = "frassy:greeted";

export function FrassyChat() {
  const navigate = useNavigate();
  const { prefs, update, hydrated } = useFrassyPrefs();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [nudged, setNudged] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [greetingText, setGreetingText] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const [consentOpen, setConsentOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastCartCountRef = useRef(0);
  const dismissedRef = useRef(false);

  const cartCount = items.reduce((n, i) => n + i.quantity, 0);
  const cartTotal = items.reduce(
    (n, i) => n + Number(i.price.amount) * i.quantity,
    0,
  );

  const muted = prefs.muted;
  const speechEnabled = canSpeak(prefs);

  // First-run consent gate — spec 031: never auto-speak for a first-time visitor.
  useEffect(() => {
    if (!hydrated) return;
    if (prefs.consentedAt) return;
    if (prefs.consentDismissCount >= 2) return;
    const t = setTimeout(() => setConsentOpen(true), 5000);
    return () => clearTimeout(t);
  }, [hydrated, prefs.consentedAt, prefs.consentDismissCount]);

  const handleConsentChoose = (mode: FrassyCommunicationMode) => {
    // Voice Only is future-ready; treat as voice_text for now.
    const applied: FrassyCommunicationMode = mode === "voice_only" ? "voice_text" : mode;
    update({ communicationMode: applied, consentedAt: new Date().toISOString() });
    setConsentOpen(false);
  };
  const handleConsentDefer = () => {
    update({
      communicationMode: "silent",
      consentDismissCount: prefs.consentDismissCount + 1,
    });
    setConsentOpen(false);
  };

  // Frassy symbol activation: ~5s after landing, subtle pulse + (optional) spoken greeting.
  // Held off while the consent modal is showing or the visitor hasn't consented yet.
  useEffect(() => {
    if (!hydrated || nudged) return;
    if (typeof window === "undefined") return;
    if (consentOpen) return;
    if (!prefs.consentedAt && prefs.consentDismissCount < 2) return;
    if (prefs.greetingStyle === "quiet") {
      setNudged(true);
      return;
    }
    const alreadyGreeted = window.sessionStorage.getItem(GREETED_STORAGE_KEY) === "1";
    if (alreadyGreeted && prefs.greetingStyle !== "concierge") {
      setNudged(true);
      return;
    }
    const t = setTimeout(() => {
      if (dismissedRef.current) return;
      setNudged(true);
      const line = pickGreeting(prefs.language);
      setGreetingText(line);
      setLiveMessage(line);
      setPulse(true);
      window.sessionStorage.setItem(GREETED_STORAGE_KEY, "1");
      if (speechEnabled) {
        speakLine(line, {
          prefs,
          tone: "welcome",
          onDone: () => setPulse(false),
        });
        setTimeout(() => setPulse(false), 9000);
      } else {
        setTimeout(() => setPulse(false), 4000);
      }
      setTimeout(() => setGreetingText(null), 9000);
    }, 5000);
    return () => clearTimeout(t);
  }, [
    hydrated,
    nudged,
    consentOpen,
    speechEnabled,
    prefs,
  ]);




  // Cart-add trigger
  useEffect(() => {
    const prev = lastCartCountRef.current;
    lastCartCountRef.current = cartCount;
    if (cartCount > prev && cartCount > 0) {
      setPulse(true);
      // Auto-open with contextual message
      setMessages((prevMsgs) => {
        const already = prevMsgs.some((m) =>
          m.content.includes("added to your cart"),
        );
        if (already) return prevMsgs;
        return [
          ...prevMsgs,
          {
            role: "assistant",
            content:
              "🔥 Nice pick — that just landed in your cart. Want to head to checkout, try it on first, or ask me anything before you buy?",
          },
        ];
      });
      // Open on desktop, subtle pulse on mobile
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        setOpen(true);
      }
    }
  }, [cartCount]);

  useEffect(() => {
    if (open) {
      setPulse(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const cartContext =
        cartCount > 0
          ? `Shopper has ${cartCount} item(s) in cart, subtotal ~${cartTotal.toFixed(2)} ${items[0]?.price.currencyCode ?? "USD"}. Items: ${items
              .map((i) => `${i.product.node.title} (${i.variantTitle}) x${i.quantity}`)
              .join(", ")}.`
          : "Cart is empty.";
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          cartContext,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.error ?? "I hit a snag. Try again in a sec?",
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.reply ?? "…" },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Connection hiccup — try again?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = () => {
    const next = !muted;
    update({ muted: next });
    if (next) {
      stopSpeaking();
      setPulse(false);
    }
  };

  const dismissPulse = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissedRef.current = true;
    setPulse(false);
    setGreetingText(null);
    stopSpeaking();
  };

  const pulseClass =
    prefs.animation === "minimal"
      ? "frassy-pulse frassy-pulse-minimal"
      : prefs.animation === "expressive"
        ? "frassy-pulse frassy-pulse-expressive"
        : "frassy-pulse";

  return (
    <>
      <FrassyConsentModal
        open={consentOpen}
        onChoose={handleConsentChoose}
        onDefer={handleConsentDefer}
        prefs={prefs}
      />
      {/* ARIA live region — every spoken line is announced in text for parity. */}
      <div role="status" aria-live="polite" className="sr-only">
        {liveMessage}
      </div>
      {/* Frassy — the Frass symbol itself */}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2">
        {(pulse || greetingText) && !open && (
          <div className="flex max-w-[280px] items-center gap-2 rounded-2xl border border-[color:var(--gold)]/50 bg-background/95 px-3 py-2 text-[12px] text-foreground shadow-lg backdrop-blur animate-fade-in">
            <span className="flex-1 leading-snug">{greetingText ?? "Frassy is here"}</span>
            <button
              type="button"
              onClick={toggleMute}
              className="rounded-full p-1 hover:bg-secondary/60"
              aria-label={muted ? "Unmute Frassy" : "Mute Frassy"}
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={dismissPulse}
              className="rounded-full p-1 hover:bg-secondary/60"
              aria-label="Dismiss Frassy greeting"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close Frassy" : "Open Frassy chat"}
          className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--ink,#0a0a0a)] shadow-2xl ring-1 ring-[color:var(--gold)]/40 transition-transform hover:scale-105 md:h-[72px] md:w-[72px] ${
            pulse && !open ? pulseClass : ""
          }`}
        >

          {open ? (
            <X className="h-6 w-6 text-[color:var(--gold)]" />
          ) : (
            <img
              src={symbolAsset.url}
              alt="Frassy"
              className="h-11 w-11 md:h-12 md:w-12 object-contain drop-shadow-[0_0_18px_oklch(0.78_0.14_78_/_0.55)]"
            />
          )}
          {!open && cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--gold)] px-1.5 text-[10px] font-bold text-[color:var(--ink)]">
              {cartCount}
            </span>
          )}
        </button>
      </div>


      {/* Panel */}
      {open && (
        <div className="fixed inset-x-3 bottom-24 z-[59] flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl md:inset-x-auto md:right-5 md:bottom-24 md:w-[380px]">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-foreground px-4 py-3 text-background">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background/10 overflow-hidden">
              <img src={symbolAsset.url} alt="Frassy" className="h-7 w-7 object-contain" />
            </div>

            <div className="flex-1">
              <div className="font-display text-lg leading-none">Frassy</div>
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">
                Frass Hill Concierge
              </div>
            </div>
            <button
              type="button"
              onClick={toggleMute}
              className="rounded-full p-1 hover:bg-background/10"
              aria-label={muted ? "Unmute Frassy" : "Mute Frassy"}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen((s) => !s)}
              className={`rounded-full p-1 hover:bg-background/10 ${settingsOpen ? "bg-background/10" : ""}`}
              aria-label="Frassy settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-background/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {settingsOpen && <FrassySettingsPanel prefs={prefs} update={update} />}



          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-foreground text-background"
                      : "bg-secondary/60 text-foreground"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-secondary/60 px-3 py-2 text-sm text-muted-foreground">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:240ms]" />
                  </span>
                </div>
              </div>
            )}

            {/* Contextual quick actions */}
            {messages.length <= 2 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_ACTIONS.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => send(q.prompt)}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:bg-secondary/60"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            {cartCount > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate({ to: "/checkout" }).catch(() => {
                      window.location.href = "/checkout";
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Checkout ({cartCount})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate({ to: "/try-on" }).catch(() => {
                      window.location.href = "/try-on";
                    });
                  }}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary/60"
                >
                  🪞 Try before buying
                </button>
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 border-t border-border bg-background px-3 py-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask Frassy anything…"
              className="max-h-32 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

// ---------- Settings ----------

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function FrassySettingsPanel({
  prefs,
  update,
}: {
  prefs: FrassyPrefs;
  update: (patch: Partial<FrassyPrefs>) => void;
}) {
  const selectCls =
    "w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/40";
  return (
    <div className="border-b border-border bg-secondary/40 px-4 py-3 space-y-3">
      <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
        Personalize Frassy
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Voice">
          <select
            className={selectCls}
            value={prefs.voice}
            onChange={(e) => update({ voice: e.target.value as FrassyPrefs["voice"] })}
          >
            <option value="feminine">Feminine</option>
            <option value="masculine">Masculine</option>
            <option value="neutral">Gender neutral</option>
          </select>
        </Row>
        <Row label="Language">
          <select
            className={selectCls}
            value={prefs.language}
            onChange={(e) => update({ language: e.target.value as FrassyPrefs["language"] })}
          >
            <option value="english">Standard English</option>
            <option value="caribbean-lite">Caribbean-lite</option>
            <option value="caribbean">Caribbean English</option>
            <option value="patois">Jamaican Patois</option>
          </select>
        </Row>
        <Row label="Greeting style">
          <select
            className={selectCls}
            value={prefs.greetingStyle}
            onChange={(e) =>
              update({ greetingStyle: e.target.value as FrassyPrefs["greetingStyle"] })
            }
          >
            <option value="quiet">Quiet</option>
            <option value="friendly">Friendly</option>
            <option value="concierge">Luxury Concierge</option>
          </select>
        </Row>
        <Row label="Animation">
          <select
            className={selectCls}
            value={prefs.animation}
            onChange={(e) => update({ animation: e.target.value as FrassyPrefs["animation"] })}
          >
            <option value="minimal">Minimal</option>
            <option value="standard">Standard</option>
            <option value="expressive">Expressive</option>
          </select>
        </Row>
      </div>
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Frassy's intelligence stays the same — only tone, voice, and presence change.
      </p>
    </div>
  );
}
