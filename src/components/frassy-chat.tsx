import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, ShoppingBag, Volume2, VolumeX, Settings, LifeBuoy, Trash2 } from "lucide-react";
import { BuilderComposer } from "@/components/builder-composer";
import { describeAttachments, type BuilderAttachment } from "@/lib/builder-attachments";
import { useCartStore } from "@/lib/cart-store";
import symbolAsset from "@/assets/frass-logo-symbol.asset.json";
import {
  useFrassyPrefs,
  pickGreeting,
  type FrassyPrefs,
  type FrassyCommunicationMode,
} from "@/hooks/use-frassy-prefs";
import { canSpeak, speakLine, stopSpeaking, VOICE_PROFILE_LABELS } from "@/lib/frassy-voice";
import { installAudioUnlockListener, isAudioUnlocked, unlockAudio } from "@/lib/audio-unlock";
import { useVoiceDictation } from "@/hooks/use-voice-dictation";
import { FrassyConsentModal } from "@/components/frassy-consent";
import { useFrassyMemory, memoryContext, rememberCartSnapshot } from "@/lib/frassy-memory";
import { useFrassyContext, currentSeason, seasonalAccent } from "@/hooks/use-frassy-context";
import { useJourneyStatus } from "@/hooks/use-journey-status";
import { useIsAdminStatus } from "@/hooks/use-is-admin";


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
  role: "user" | "assistant";
  content: string;
  products?: ProductCard[];
  order?: OrderCard | null;
};
type FounderChatDiagnostics = {
  conversationMode: string;
  systemPrompt: string;
  promptVersion: string;
  sessionType: string;
  memoryNamespace: string;
  routingDecision: string;
  historySource: string;
  fallback: string;
  identityDiscovery: string;
};

const INITIAL_MSG: Msg = {
  role: "assistant",
  content:
    "Welcome to Frass Hill — I'm Frassy. Tap me anytime for styling, sizing, or to unlock 40% off your first order.",
};

// Shown instead of the storefront welcome when a signed-in Builder still owes the journey.
const JOURNEY_MSG: Msg = {
  role: "assistant",
  content:
    "Welcome back — I'm Frassy. Before anything else, we have your Intelligent Builder Journey to walk through together: your mission, your identity, your vault, and the districts of Frass OS. It's taken at your pace across as many sessions as you like, and everything saves as we go. Tap “Begin my Builder Journey” below and I'll open the first chapter.",
};

const FOUNDER_MSG: Msg = {
  role: "assistant",
  content:
    "Welcome back. Your Founder Control Room is ready. We’re commissioning Frass OS itself—not onboarding you as a Builder. Continue with Platform Readiness, operating decisions, and launch preparation below.",
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
  const {
    memory,
    update: updateMemory,
    resetLearnedPreferences,
    clearRecentlyViewed,
    clearWishlist,
    clearAll: clearAllMemory,
  } = useFrassyMemory();
  const ctx = useFrassyContext();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [nudged, setNudged] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [greetingText, setGreetingText] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [voiceBlocked, setVoiceBlocked] = useState(false);
  const [founderDiagnostics, setFounderDiagnostics] = useState<FounderChatDiagnostics | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const [idleOffered, setIdleOffered] = useState(false);
  const items = useCartStore((s) => s.items);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastCartCountRef = useRef(0);
  const dismissedRef = useRef(false);
  const modeRef = useRef(prefs.communicationMode);
  const openRef = useRef(open);
  const messagesRef = useRef(messages);
  const lastSpokenRef = useRef("");
  modeRef.current = prefs.communicationMode;
  openRef.current = open;
  messagesRef.current = messages;

  useEffect(() => installAudioUnlockListener(), []);

  const speakReply = (text: string, tone: "calm" | "welcome" = "calm") => {
    if (!text.trim() || modeRef.current === "silent" || prefs.muted) return;
    lastSpokenRef.current = text;
    if (!isAudioUnlocked()) {
      setVoiceBlocked(true);
      return;
    }
    setVoiceBlocked(false);
    setSpeaking(true);
    speakLine(text, {
      prefs: { ...prefs, muted: false },
      tone,
      onDone: () => setSpeaking(false),
      onBlocked: () => {
        setSpeaking(false);
        setVoiceBlocked(true);
      },
    });
  };

  const dictation = useVoiceDictation((text) => {
    if (modeRef.current !== "silent") void send(text);
    else setInput((current) => (current ? `${current} ${text}` : text));
  });
  const dictationRef = useRef(dictation);
  dictationRef.current = dictation;

  const enableVoicePlayback = () => {
    unlockAudio();
    setVoiceBlocked(false);
    const lastReply =
      lastSpokenRef.current ||
      [...messagesRef.current].reverse().find((message) => message.role === "assistant")?.content ||
      "";
    if (lastReply) speakReply(lastReply, "welcome");
    else dictationRef.current.start();
  };

  const season = useMemo(() => currentSeason(), []);
  const journey = useJourneyStatus();
  const { isAdmin } = useIsAdminStatus();
  const needsJourney = journey.signedIn && journey.needsJourney;
  const needsCommissioning = needsJourney && isAdmin === true;

  const goToOnboarding = () => {
    setOpen(false);
    navigate({ to: "/onboarding" }).catch(() => {
      window.location.href = "/onboarding";
    });
  };

  // A signed-in Builder mid-journey is greeted by the journey, not the storefront.
  useEffect(() => {
    if (!needsJourney) return;
    setMessages((prev) =>
      prev.length === 1 && prev[0] === INITIAL_MSG
        ? [needsCommissioning ? FOUNDER_MSG : JOURNEY_MSG]
        : prev,
    );
  }, [needsJourney, needsCommissioning]);




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
    if (mode !== "silent") unlockAudio();
    update({ communicationMode: mode, consentedAt: new Date().toISOString(), muted: false });
    setConsentOpen(false);
  };
  const handleConsentDefer = () => {
    update({
      communicationMode: "silent",
      consentDismissCount: prefs.consentDismissCount + 1,
    });
    setConsentOpen(false);
  };

  // Frassy activation: ~5s after landing, subtle pulse + (optional) spoken greeting.
  // Suppressed at checkout, auth, and workspace routes (situational awareness).
  useEffect(() => {
    if (!hydrated || nudged) return;
    if (typeof window === "undefined") return;
    if (consentOpen) return;
    if (!prefs.consentedAt && prefs.consentDismissCount < 2) return;
    if (!ctx.canProactivelySpeak) return;
    if (prefs.disableHomepageGreeting) { setNudged(true); return; }
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
      // Memory-aware greeting: name-back if we know them, else language greeting.
      let line = pickGreeting(prefs.language);
      if (needsJourney) {
        line = needsCommissioning
          ? "Welcome back — the Founder Control Room is ready."
          : "Ready when you are — your Builder Journey is waiting.";
      } else if (memory.firstName && memory.visits > 0) {
        line = `Welcome back, ${memory.firstName}.`;
        if (memory.recentCategories[0]) {
          line += ` Last time you were looking at ${memory.recentCategories[0].replace(/-/g, " ")}. Want to continue?`;
        }
      } else {
        const accent = seasonalAccent(season);
        if (accent && Math.random() < 0.4) line = accent;
      }
      setGreetingText(line);
      setLiveMessage(line);
      setPulse(true);
      window.sessionStorage.setItem(GREETED_STORAGE_KEY, "1");
      if (speechEnabled) {
        speakReply(line, "welcome");
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
    ctx.canProactivelySpeak,
    memory.firstName,
    memory.visits,
    memory.recentCategories,
    season,
    needsCommissioning,
  ]);

  // Idle help — offer a hand after ~90s of no interaction while browsing.
  useEffect(() => {
    if (idleOffered || !ctx.shouldOfferHelp || open) return;
    if (prefs.disableProactive) return;
    setIdleOffered(true);
    const line = "Taking your time — want me to help you narrow it down?";
    setGreetingText(line);
    setLiveMessage(line);
    setPulse(true);
    setTimeout(() => setPulse(false), 4000);
    setTimeout(() => setGreetingText(null), 9000);
  }, [ctx.shouldOfferHelp, idleOffered, open, prefs.disableProactive]);





  // Cart-add trigger — respect situational awareness (never at checkout/auth/workspace).
  useEffect(() => {
    const prev = lastCartCountRef.current;
    lastCartCountRef.current = cartCount;
    if (cartCount > prev && cartCount > 0) {
      rememberCartSnapshot(items.map((i) => i.product.node.title));
      if (!ctx.canAutoOpenOnCart) return; // don't interrupt at checkout
      if (prefs.disableProactive) return;
      setPulse(true);
      setMessages((prevMsgs) => {
        const already = prevMsgs.some((m) => m.content.includes("landed in your cart"));
        if (already) return prevMsgs;
        return [
          ...prevMsgs,
          {
            role: "assistant",
            content:
              "Nice pick — that just landed in your cart. Ready when you are, or want to try it on first?",
          },
        ];
      });
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        setOpen(true);
      }
    }
  }, [cartCount, ctx.canAutoOpenOnCart, items]);


  useEffect(() => {
    if (open) {
      setPulse(false);
      setTimeout(() => inputRef.current?.focus(), 50);
      if (modeRef.current !== "silent" && !speaking) {
        const lastReply = [...messagesRef.current]
          .reverse()
          .find((message) => message.role === "assistant")?.content;
        if (lastReply && lastSpokenRef.current !== lastReply) speakReply(lastReply, "welcome");
      }
    } else {
      dictationRef.current.stop();
    }
  }, [open]);

  // Hands-free conversation: after Frassy finishes, automatically return the floor.
  useEffect(() => {
    if (!open || modeRef.current === "silent" || voiceBlocked) return;
    if (loading || speaking || dictation.listening || !dictation.supported) return;
    const timer = window.setTimeout(() => dictationRef.current.start(), 400);
    return () => window.clearTimeout(timer);
  }, [open, prefs.communicationMode, voiceBlocked, loading, speaking, dictation.listening, dictation.supported]);

  // Bump visit counter once per browser session for memory-aware greetings.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("frassy:visit-bumped") === "1") return;
    window.sessionStorage.setItem("frassy:visit-bumped", "1");
    import("@/lib/frassy-memory").then((m) => m.bumpVisit(memory.firstName ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);


  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    dictationRef.current.stop();
    stopSpeaking();
    setSpeaking(false);
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
          memoryContext: memoryContext(memory),
          modeContext: `${ctx.mode} (route ${ctx.pathname})`,
          seasonContext: seasonalAccent(season) ?? "",
          experienceContext: isAdmin === true ? "founder" : journey.signedIn ? "builder" : "storefront",
        }),

      });
      const data = (await res.json()) as {
        reply?: string;
        error?: string;
        cards?: { products?: ProductCard[]; order?: OrderCard | null };
        diagnostics?: FounderChatDiagnostics;
      };
      if (!res.ok) {
        const errorReply = data.error ?? "I hit a snag. Try again in a sec?";
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: errorReply,
          },
        ]);
        speakReply(errorReply);
      } else {
        if (data.diagnostics) setFounderDiagnostics(data.diagnostics);
        const reply = data.reply ?? "…";
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: reply,
            products: data.cards?.products,
            order: data.cards?.order ?? null,
          },
        ]);
        setLiveMessage(reply);
        speakReply(reply);
      }
    } catch {
      const errorReply = "Connection hiccup — try again?";
      setMessages((m) => [
        ...m,
        { role: "assistant", content: errorReply },
      ]);
      speakReply(errorReply);
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
              onClick={() => setEscalateOpen((s) => !s)}
              className={`rounded-full p-1 hover:bg-background/10 ${escalateOpen ? "bg-background/10" : ""}`}
              aria-label="Talk to a human"
              title="Talk to a human"
            >
              <LifeBuoy className="h-4 w-4" />
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

          {escalateOpen && (
            <div className="border-b border-border bg-secondary/40 px-4 py-3 space-y-2">
              <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
                Talk to a human
              </div>
              <p className="text-xs text-muted-foreground">
                I'll never leave you stuck — pick the fastest path for you.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="mailto:concierge@frasskicks.com"
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary/60"
                >
                  ✉ Email concierge
                </a>
                <a
                  href="sms:+1"
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary/60"
                >
                  💬 Text support
                </a>
                <button
                  type="button"
                  onClick={() => send("I'd like to open a support ticket, please.")}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary/60"
                >
                  🎟 Open ticket
                </button>
              </div>
            </div>
          )}

          {settingsOpen && (
            <FrassySettingsPanel
              prefs={prefs}
              update={update}
              memory={memory}
              updateMemory={updateMemory}
              onResetCommunication={() =>
                update({
                  communicationMode: "silent",
                  voice: "feminine",
                  voiceProfile: "calm-luxury",
                  language: "caribbean-lite",
                  greetingStyle: "concierge",
                  animation: "standard",
                  muted: false,
                })
              }
              onClearRecentlyViewed={clearRecentlyViewed}
              onClearWishlist={clearWishlist}
              onResetLearned={resetLearnedPreferences}
              onFactoryReset={() => {
                clearAllMemory();
                update({
                  communicationMode: "silent",
                  voice: "feminine",
                  voiceProfile: "calm-luxury",
                  language: "caribbean-lite",
                  greetingStyle: "concierge",
                  animation: "standard",
                  muted: false,
                  consentedAt: null,
                  consentDismissCount: 0,
                });
                stopSpeaking();
              }}
            />
          )}

          {voiceBlocked && (
            <button
              type="button"
              onClick={enableVoicePlayback}
              className="border-b border-[color:var(--gold)]/40 bg-[color:var(--gold)]/10 px-4 py-3 text-left text-xs font-semibold text-[color:var(--gold)]"
            >
              Tap to let Frassy speak
            </button>
          )}




          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {isAdmin === true && founderDiagnostics && (
              <details className="rounded-xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 p-3 text-[10px]" open>
                <summary className="cursor-pointer font-bold uppercase tracking-[0.18em] text-[color:var(--gold)]">
                  Founder routing diagnostics · temporary
                </summary>
                <div className="mt-2 space-y-1 font-mono text-muted-foreground">
                  <div>Mode: {founderDiagnostics.conversationMode}</div>
                  <div>Prompt: {founderDiagnostics.systemPrompt}_{founderDiagnostics.promptVersion}</div>
                  <div>Session: {founderDiagnostics.sessionType}</div>
                  <div>Memory: {founderDiagnostics.memoryNamespace}</div>
                  <div>History: {founderDiagnostics.historySource}</div>
                  <div>Fallback: {founderDiagnostics.fallback}</div>
                  <div>Identity Discovery: {founderDiagnostics.identityDiscovery}</div>
                  <div className="font-sans">Route: {founderDiagnostics.routingDecision}</div>
                </div>
              </details>
            )}
            {messages.map((m, i) => (
              <div key={i} className="space-y-2">
                <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
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
                {m.role === "assistant" && m.products && m.products.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pl-1">
                    {m.products.map((p) => (
                      <a
                        key={p.handle}
                        href={p.url}
                        onClick={() => setOpen(false)}
                        className="group overflow-hidden rounded-xl border border-border bg-background transition hover:border-[color:var(--gold)]/60"
                      >
                        {p.image ? (
                          <div className="aspect-square w-full overflow-hidden bg-secondary/40">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="h-full w-full object-cover transition group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square w-full bg-secondary/40" />
                        )}
                        <div className="space-y-0.5 p-2">
                          <div className="line-clamp-2 text-[11px] font-medium leading-tight text-foreground">
                            {p.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {p.currency} {Number(p.price).toFixed(2)}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
                {m.role === "assistant" && m.order && (
                  <div className="rounded-xl border border-border bg-background p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Order {m.order.name}</span>
                      <span className="text-muted-foreground">
                        {m.order.currency} {Number(m.order.total).toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {m.order.financial_status} · {m.order.fulfillment_status}
                    </div>
                    {m.order.tracking.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {m.order.tracking.map((t, ti) => (
                          <a
                            key={ti}
                            href={t.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-[color:var(--gold)] hover:underline"
                          >
                            Track {t.company} · {t.number}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
            {prefs.communicationMode !== "silent" && !loading && (
              <div className="px-1 text-[11px] text-muted-foreground" aria-live="polite">
                {speaking
                  ? "Frassy is speaking…"
                  : dictation.listening
                    ? dictation.interim || "Listening…"
                    : dictation.supported
                      ? "Preparing microphone…"
                      : "Voice input is unavailable in this browser."}
              </div>
            )}

            {/* Route each signed-in identity to its authoritative experience. */}
            {needsJourney && !loading && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={goToOnboarding}
                  className="w-full rounded-full bg-[color:var(--gold)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--ink)]"
                >
                  {needsCommissioning
                    ? "Continue Platform Commissioning"
                    : journey.started
                      ? "Continue my Builder Journey"
                      : "Begin my Builder Journey"}
                </button>
              </div>
            )}

            {/* Contextual quick actions */}
            {messages.length <= 2 && !loading && !needsJourney && (
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

          {/* Builder Composer */}
          <BuilderComposer
            value={input}
            onChange={setInput}
            onSend={(text, files) => send(text, files)}
            disabled={loading}
            mode={prefs.communicationMode}
            dictation={dictation}
            canSaveToVault={journey.signedIn}
            hint={speaking ? "Frassy is speaking…" : undefined}
          />

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
  memory,
  updateMemory,
  onResetCommunication,
  onClearRecentlyViewed,
  onClearWishlist,
  onResetLearned,
  onFactoryReset,
}: {
  prefs: FrassyPrefs;
  update: (patch: Partial<FrassyPrefs>) => void;
  memory: import("@/lib/frassy-memory").FrassyMemory;
  updateMemory: (patch: Partial<import("@/lib/frassy-memory").FrassyMemory>) => void;
  onResetCommunication: () => void;
  onClearRecentlyViewed: () => void;
  onClearWishlist: () => void;
  onResetLearned: () => void;
  onFactoryReset: () => void;
}) {
  const [confirmFactory, setConfirmFactory] = useState(false);

  const selectCls =
    "w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/40";
  const inputCls =
    "w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/40";
  const resetBtn =
    "inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground";

  return (
    <div className="border-b border-border bg-secondary/40 px-4 py-3 space-y-3">
      <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
        Personalize Frassy
      </div>
      <Row label="How Frassy communicates">
        <select
          className={selectCls}
          value={prefs.communicationMode}
          onChange={(e) => {
            const mode = e.target.value as FrassyPrefs["communicationMode"];
            update({
              communicationMode: mode,
              consentedAt: prefs.consentedAt ?? new Date().toISOString(),
            });
            if (mode === "silent") {
              stopSpeaking();
            } else {
              unlockAudio();
            }
          }}
        >
          <option value="silent">Silent Concierge — text only</option>
          <option value="voice_text">Voice &amp; Text (premium neural)</option>
          <option value="voice_only">Voice Only (hands-free)</option>
        </select>
      </Row>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Voice">
          <select
            className={selectCls}
            value={prefs.voice}
            onChange={(e) => update({ voice: e.target.value as FrassyPrefs["voice"] })}
            disabled={prefs.communicationMode === "silent"}
          >
            <option value="feminine">Feminine</option>
            <option value="masculine">Masculine</option>
            <option value="neutral">Gender neutral</option>
          </select>
        </Row>
        <Row label="Voice profile">
          <select
            className={selectCls}
            value={prefs.voiceProfile}
            onChange={(e) =>
              update({ voiceProfile: e.target.value as FrassyPrefs["voiceProfile"] })
            }
            disabled={prefs.communicationMode === "silent"}
          >
            {Object.entries(VOICE_PROFILE_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
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
      {/* Spec 032 — Customer Control toggles */}
      <div className="space-y-1.5 rounded-md border border-border/60 bg-background/60 px-2 py-2">
        <label className="flex cursor-pointer items-center justify-between gap-2 text-[11px] text-foreground">
          <span>Homepage greeting</span>
          <input
            type="checkbox"
            checked={!prefs.disableHomepageGreeting}
            onChange={(e) => update({ disableHomepageGreeting: !e.target.checked })}
            className="h-3.5 w-3.5 accent-[color:var(--gold)]"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-2 text-[11px] text-foreground">
          <span>Proactive recommendations</span>
          <input
            type="checkbox"
            checked={!prefs.disableProactive}
            onChange={(e) => update({ disableProactive: !e.target.checked })}
            className="h-3.5 w-3.5 accent-[color:var(--gold)]"
          />
        </label>
        <p className="text-[10px] leading-snug text-muted-foreground">
          When off, Frassy stays quiet until you open the chat.
        </p>
      </div>
      <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/60 px-2 py-1.5">
        <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Communication preferences
        </span>
        <button type="button" onClick={onResetCommunication} className={resetBtn}>
          <Trash2 className="h-3 w-3" /> Reset
        </button>
      </div>
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Frassy's intelligence stays the same — only tone, voice, and presence change. Audio uses a
        premium neural voice; every message is also written.
      </p>

      {/* What Frassy remembers — user-controlled memory with granular resets */}
      <div className="mt-2 rounded-lg border border-border/70 bg-background/60 p-3 space-y-3">
        <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
          What Frassy remembers
        </div>

        <Row label="Name to greet you by">
          <input
            type="text"
            value={memory.firstName ?? ""}
            onChange={(e) => updateMemory({ firstName: e.target.value || null })}
            placeholder="Optional — e.g. Mike"
            className={inputCls}
          />
        </Row>

        <div className="grid grid-cols-2 gap-3">
          <Row label="Preferred size">
            <input
              type="text"
              value={memory.preferredSize ?? ""}
              onChange={(e) => updateMemory({ preferredSize: e.target.value || null })}
              placeholder="M / 9 / 32"
              className={inputCls}
            />
          </Row>
          <Row label="Budget">
            <input
              type="text"
              value={memory.budgetRange ?? ""}
              onChange={(e) => updateMemory({ budgetRange: e.target.value || null })}
              placeholder="$50–150"
              className={inputCls}
            />
          </Row>
          <Row label="Favorite colors">
            <input
              type="text"
              value={memory.preferredColors.join(", ")}
              onChange={(e) =>
                updateMemory({
                  preferredColors: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="black, cream, olive"
              className={inputCls}
            />
          </Row>
          <Row label="Favorite brands">
            <input
              type="text"
              value={memory.preferredBrands.join(", ")}
              onChange={(e) =>
                updateMemory({
                  preferredBrands: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="Frass Kicks, Bare Drip"
              className={inputCls}
            />
          </Row>
        </div>

        <Row label="Style likes (comma separated)">
          <input
            type="text"
            value={memory.likes.join(", ")}
            onChange={(e) =>
              updateMemory({
                likes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="neutral colors, oversized hoodies"
            className={inputCls}
          />
        </Row>
        <Row label="Dislikes">
          <input
            type="text"
            value={memory.dislikes.join(", ")}
            onChange={(e) =>
              updateMemory({
                dislikes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="floral prints, bright colors"
            className={inputCls}
          />
        </Row>

        {/* Granular reset actions */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/60 px-2 py-1.5">
            <div className="min-w-0">
              <div className="text-xs text-foreground">Recently viewed</div>
              <div className="text-[10px] text-muted-foreground truncate">
                {memory.recentProducts.length + memory.recentCategories.length > 0
                  ? `${memory.recentProducts.length} products · ${memory.recentCategories.length} categories`
                  : "Nothing yet."}
              </div>
            </div>
            <button type="button" onClick={onClearRecentlyViewed} className={resetBtn}>
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/60 px-2 py-1.5">
            <div className="min-w-0">
              <div className="text-xs text-foreground">Wishlist</div>
              <div className="text-[10px] text-muted-foreground truncate">
                {memory.wishlist.length
                  ? `${memory.wishlist.length} saved · ${memory.wishlist.slice(0, 2).map((w) => w.title).join(", ")}${memory.wishlist.length > 2 ? "…" : ""}`
                  : "Nothing saved yet."}
              </div>
            </div>
            <button type="button" onClick={onClearWishlist} className={resetBtn}>
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/60 px-2 py-1.5">
            <div className="min-w-0">
              <div className="text-xs text-foreground">Learned shopping preferences</div>
              <div className="text-[10px] text-muted-foreground">
                Sizes, colors, brands, budget, likes &amp; dislikes.
              </div>
            </div>
            <button type="button" onClick={onResetLearned} className={resetBtn}>
              <Trash2 className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>

        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Stored only on this device. Frassy never remembers payment info, addresses, or
          passwords.
        </p>
      </div>

      {/* Factory Reset — visually distinct, requires confirmation */}
      <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 space-y-2">
        <div className="text-[10px] uppercase tracking-[0.28em] text-destructive">
          Factory reset
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Clears every preference, memory, wishlist item, and returns Frassy to a first-run state.
          This can't be undone.
        </p>
        {confirmFactory ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onFactoryReset();
                setConfirmFactory(false);
              }}
              className="rounded-full bg-destructive px-3 py-1.5 text-[11px] font-medium text-destructive-foreground"
            >
              Yes, clear everything
            </button>
            <button
              type="button"
              onClick={() => setConfirmFactory(false)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmFactory(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-destructive/60 bg-background px-3 py-1.5 text-[11px] text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3" /> Clear everything
          </button>
        )}
      </div>
    </div>
  );
}


