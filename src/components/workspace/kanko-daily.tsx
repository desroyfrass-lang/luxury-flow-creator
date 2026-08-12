// FRASS-P001 — Kanko's Daily, Version 1. The reference implementation for every
// personalized Daily. Organisation and words only; capability is unchanged.

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { speakWithGuarantee } from "@/lib/frassy/speak-guarantee";
import {
  COCO_TODAY,
  FREEDOM_PROGRESS,
  FREIGHT_STATUS,
  KANKO_GREETING,
  KANKO_HEADER,
  KANKO_MOVES,
  KANKO_MOVE_LIMIT,
  greetingPlayed,
  kankoEncouragement,
  kankoEndOfDay,
  markGreetingPlayed,
} from "@/lib/daily/kanko";

export function KankoWelcome({ name = "Kanko" }: { name?: string }) {
  const [played, setPlayed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const first = useMemo(() => greetingPlayed(), []);

  useEffect(() => {
    setPlayed(first);
  }, [first]);

  async function play() {
    setPlayed(true);
    markGreetingPlayed();
    const res = await speakWithGuarantee(KANKO_GREETING.transcript, { owner: "founder-message" });
    setNotice(res.notice);
  }

  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {KANKO_GREETING.title} · {KANKO_GREETING.occasion}
      </p>
      <h3 className="font-display mt-1 text-xl">🌅 Good morning, {name}</h3>
      <blockquote className="mt-3 border-l-2 border-[color:var(--gold,#d4af37)] pl-4 text-sm leading-relaxed">
        “{KANKO_GREETING.transcript}”
      </blockquote>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="ws-chip" onClick={play}>
          <Play className="mr-1 h-3.5 w-3.5" /> {played ? "Play it again" : "Play the message"}
        </button>
        <span className="ws-meta">— {KANKO_GREETING.from}</span>
      </div>
      {notice && <p className="ws-meta mt-2">{notice}</p>}
      <dl className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
        <Fact label="Today's focus" value={KANKO_HEADER.focus} />
        <Fact label="Estimated working time" value={`⏱ ${KANKO_HEADER.workingTime}`} />
        <Fact label="Today's priority" value={`💰 ${KANKO_HEADER.priority}`} />
      </dl>
    </div>
  );
}

export function KankoFreedomProgress() {
  return (
    <div className="space-y-3">
      {FREEDOM_PROGRESS.map((m) => (
        <div key={m.id}>
          <div className="flex items-baseline justify-between text-sm">
            <span>
              {m.emoji} {m.label}
            </span>
            <span className="text-muted-foreground">{m.pct}%</span>
          </div>
          <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full bg-[color:var(--gold,#d4af37)]"
              style={{ width: `${m.pct}%` }}
            />
          </span>
          <p className="ws-meta mt-1">{m.plain}</p>
        </div>
      ))}
    </div>
  );
}

export function KankoMoneyMoves({ onNavigate }: { onNavigate?: (href: string) => void }) {
  return (
    <div className="daily-grid">
      {KANKO_MOVES.slice(0, KANKO_MOVE_LIMIT).map((m, i) => (
        <button
          key={m.id}
          type="button"
          className="daily-card daily-clickable text-left"
          onClick={() => onNavigate?.(m.href)}
        >
          <span className="ws-meta">{i + 1} · {m.impact} · {m.minutes} min</span>
          <span className="daily-task-label">{m.label}</span>
          <span className="ws-meta">{m.why}</span>
          <span className="daily-go">
            Start <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </button>
      ))}
    </div>
  );
}

export function KankoCocoVintage({ onNavigate }: { onNavigate?: (href: string) => void }) {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
      <p className="text-sm">
        Today's publishing goal: <strong>publish {COCO_TODAY.goal} products</strong>.
      </p>
      <ul className="mt-3 space-y-1 text-sm">
        {COCO_TODAY.prepared.map((p) => (
          <li key={p.id}>
            ✅ {p.label} — <span className="text-muted-foreground">{p.note}</span>
          </li>
        ))}
      </ul>
      <p className="ws-meta mt-3">{COCO_TODAY.promise}</p>
      <button type="button" className="daily-link mt-3" onClick={() => onNavigate?.("/workspace/coco-vintage")}>
        Review and approve <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function KankoFreight() {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.02] p-5">
      <p className="text-sm">
        📦 Freight Brokerage — <strong>{FREIGHT_STATUS.state}</strong>. Not active yet.
      </p>
      <p className="ws-meta mt-2">“{FREIGHT_STATUS.why}”</p>
      <p className="ws-meta mt-1">{FREIGHT_STATUS.plain}</p>
    </div>
  );
}

export function KankoFrassyNote({ day }: { day: number }) {
  return (
    <p className="text-sm leading-relaxed">❤️ {kankoEncouragement(day)}</p>
  );
}

export function KankoEndOfDay({ published, movesDone }: { published: number; movesDone: string[] }) {
  const eod = kankoEndOfDay({ published, movesDone });
  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">What you accomplished</p>
        <ul className="mt-1 space-y-1">
          {eod.accomplished.map((a) => (
            <li key={a}>• {a}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Income opportunities moved</p>
        <ul className="mt-1 space-y-1">
          {eod.incomeMoved.map((a) => (
            <li key={a}>• {a}</li>
          ))}
        </ul>
      </div>
      <p>🎯 Tomorrow: {eod.tomorrow}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
