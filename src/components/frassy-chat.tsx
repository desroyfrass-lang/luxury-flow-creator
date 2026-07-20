import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Send, ShoppingBag, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import symbolAsset from "@/assets/frass-logo-symbol.asset.json";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Wah gwaan! Welcome to Frass Kicks — I'm Frassy 👋. Fun fact: new customers can unlock 40% OFF their first order in about 3 minutes. Want me to walk you through it, or help you shop?",
};

const SPOKEN_GREETING =
  "Welcome to Frass Hill. I'm Frassy. Tap me anytime — I can help you find your fit, style a look, or unlock forty percent off your first order.";

const QUICK_ACTIONS = [
  { label: "🎁 Unlock 40% OFF", prompt: "How do I unlock the 40% off first purchase reward?" },
  { label: "How Try-On works", prompt: "How does the Try-On feature work?" },
  { label: "What's Capsule Checkout?", prompt: "What is Capsule Checkout?" },
  { label: "Shipping & returns", prompt: "Tell me about shipping and returns." },
];

const MUTE_STORAGE_KEY = "frassy:muted";
const GREETED_STORAGE_KEY = "frassy:greeted";

export function FrassyChat() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [nudged, setNudged] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [muted, setMuted] = useState(false);
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

  // Load mute preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    setMuted(window.localStorage.getItem(MUTE_STORAGE_KEY) === "1");
  }, []);

  // Frassy symbol activation: ~5s after landing, subtle pulse + spoken greeting.
  useEffect(() => {
    if (nudged) return;
    if (typeof window === "undefined") return;
    const alreadyGreeted = window.sessionStorage.getItem(GREETED_STORAGE_KEY) === "1";
    if (alreadyGreeted) {
      setNudged(true);
      return;
    }
    const t = setTimeout(() => {
      if (dismissedRef.current) return;
      setNudged(true);
      setPulse(true);
      window.sessionStorage.setItem(GREETED_STORAGE_KEY, "1");
      // Try to speak — many browsers block until first user gesture, in which case pulse still plays.
      if (!muted && "speechSynthesis" in window) {
        try {
          const u = new SpeechSynthesisUtterance(SPOKEN_GREETING);
          u.rate = 1;
          u.pitch = 1;
          u.volume = 0.9;
          u.onend = () => setPulse(false);
          u.onerror = () => setPulse(false);
          window.speechSynthesis.speak(u);
          // Safety: stop pulse after 8s regardless
          setTimeout(() => setPulse(false), 8000);
        } catch {
          setTimeout(() => setPulse(false), 4000);
        }
      } else {
        setTimeout(() => setPulse(false), 4000);
      }
    }, 5000);
    return () => clearTimeout(t);
  }, [nudged, muted]);


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
    setMuted(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MUTE_STORAGE_KEY, next ? "1" : "0");
      if (next && "speechSynthesis" in window) window.speechSynthesis.cancel();
    }
    if (next) setPulse(false);
  };

  const dismissPulse = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissedRef.current = true;
    setPulse(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <>
      {/* Frassy — the Frass symbol itself */}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2">
        {pulse && !open && (
          <div className="flex items-center gap-2 rounded-full border border-[color:var(--gold)]/50 bg-background/95 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-foreground shadow-lg backdrop-blur animate-fade-in">
            <span>Frassy is here</span>
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
            pulse && !open ? "frassy-pulse" : ""
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
                Frass Kicks Concierge
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-background/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

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
