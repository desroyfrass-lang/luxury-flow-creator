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

import { useEffect, useRef, useState } from "react";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import symbolAsset from "@/assets/frass-logo-symbol.asset.json";
import { useFrassyContext } from "@/hooks/use-frassy-context";
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
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ProductCard[];
  order?: OrderCard | null;
};

const WELCOME: Msg = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome to Frass Hill — I'm Frassy. Ask me anything about sizing, styling, your order, or the 40% welcome offer.",
};

let seq = 0;
const nextId = () => `m${++seq}-${Date.now()}`;

export function FrassyChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = useCartStore((s) => s.items);
  const ctx = useFrassyContext();
  const { isAdmin } = useIsAdminStatus();

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Turn ownership: exactly one in-flight assistant turn, owned by one user turn.
  const turnRef = useRef(0);

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

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const myTurn = ++turnRef.current;
    const userMsg: Msg = { id: nextId(), role: "user", content: text };
    const history = [...messages, userMsg];

    setMessages(history);
    setInput("");
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: history
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content })),
          cartContext,
          modeContext: ctx.mode,
          experienceContext: isAdmin ? "founder" : "storefront",
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

      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: data.reply?.trim() || "…",
          products: data.cards?.products ?? [],
          order: data.cards?.order ?? null,
        },
      ]);
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

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Open Frassy chat"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--gold)]/50 bg-[#0b0c0e] shadow-lg transition-transform hover:scale-105"
      >
        <img src={symbolAsset.url} alt="" className="h-7 w-7 object-contain" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex h-[min(620px,80vh)] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0b0c0e] shadow-2xl">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={symbolAsset.url} alt="" className="h-6 w-6 object-contain" />
          <div>
            <div className="text-sm text-white">Frassy</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              {loading ? "Thinking…" : "Ready"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
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
              setMessages([WELCOME]);
              setError(null);
            }}
            className="rounded-sm p-2 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
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

        {error && (
          <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}
      </div>

      <ComposerShell
        value={input}
        onChange={setInput}
        onSend={() => void send()}
        disabled={loading}
        placeholder="Ask Frassy anything…"
      />
    </div>
  );
}
