// FRASS-0532 — The Tradesperson's Daily.
// Builders, contractors, masons, electricians, carpenters, plumbers and every
// other skilled trade. Big text, one thing at a time, income first. Frassy does
// the technology; the member brings the knowledge.

import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { LAYER_BY_ID } from "@/lib/business/financial-layers";
import {
  CERTIFICATION_STANCE,
  DIGITAL_PRESENCE,
  FRASSY_HANDLES,
  KNOWLEDGE_PRODUCTS,
  LONG_TERM_SHIFT,
  TRADESPERSON_MINUTES_PER_DAY,
  TRADESPERSON_NEVER_MEASURED,
  TRADESPERSON_OUTCOMES,
  TRADESPERSON_PRINCIPLE,
  TRADESPERSON_QUESTION,
  TRADESPERSON_VISION,
  todaysTradeMoves,
  tradespersonEncouragement,
  type TradeMove,
} from "@/lib/daily/tradesperson";

function Move({ move, onNavigate }: { move: TradeMove; onNavigate?: (href: string) => void }) {
  const layer = LAYER_BY_ID[move.layer];
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="ws-chip">
          {layer?.dot} {layer?.label}
        </span>
        <span className="ws-meta">{move.minutes} min</span>
      </div>
      <p className="mt-2 text-base font-medium">{move.label}</p>
      <p className="ws-meta mt-1 text-sm">{move.why}</p>
      <button type="button" className="ws-chip mt-3" onClick={() => onNavigate?.(move.href)}>
        Start this <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function TradespersonWelcome({ name = "Boss" }: { name?: string }) {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
      <h3 className="font-display text-xl">🔨 Morning, {name}</h3>
      <p className="mt-2 text-base leading-relaxed">{TRADESPERSON_VISION}</p>
      <p className="ws-meta mt-2 text-sm">
        Today's only question: <strong>{TRADESPERSON_QUESTION}</strong> · about{" "}
        {TRADESPERSON_MINUTES_PER_DAY} minutes, no more.
      </p>
    </div>
  );
}

export function TradespersonMoneyMoves({ onNavigate }: { onNavigate?: (href: string) => void }) {
  const moves = useMemo(() => todaysTradeMoves(), []);
  return (
    <div className="space-y-3">
      {moves.map((m) => (
        <Move key={m.label} move={m} onNavigate={onNavigate} />
      ))}
      <p className="ws-meta text-sm">One at a time. Anything you don't get to simply waits.</p>
    </div>
  );
}

export function FrassyDoesTheTech() {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
      <p className="text-sm">You bring the knowledge. I do the computer work:</p>
      <ul className="mt-2 grid gap-1 text-sm text-white/70 sm:grid-cols-2">
        {FRASSY_HANDLES.map((h) => (
          <li key={h}>• {h}</li>
        ))}
      </ul>
    </div>
  );
}

export function TradespersonReputation() {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
      <p className="text-sm">{CERTIFICATION_STANCE.plain}</p>
      <ul className="mt-2 space-y-1 text-sm text-white/70">
        {CERTIFICATION_STANCE.proof.map((p) => (
          <li key={p}>✅ {p}</li>
        ))}
      </ul>
      <p className="ws-meta mt-2 text-xs">{CERTIFICATION_STANCE.rule}</p>
    </div>
  );
}

export function TradespersonPresence({ onNavigate }: { onNavigate?: (href: string) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {DIGITAL_PRESENCE.map((d) => (
        <button
          key={d.label}
          type="button"
          onClick={() => onNavigate?.(d.to)}
          className="rounded-2xl border border-white/12 bg-white/[0.03] p-3 text-left text-sm"
        >
          {d.label} <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

export function TradespersonKnowledgeIncome({ onNavigate }: { onNavigate?: (href: string) => void }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
      <p className="text-sm">
        What you know is worth money too — not just what your hands do.
      </p>
      <ul className="mt-2 grid gap-1 text-sm text-white/70 sm:grid-cols-2">
        {KNOWLEDGE_PRODUCTS.map((k) => (
          <li key={k}>• {k}</li>
        ))}
      </ul>
      <button type="button" className="ws-chip mt-3" onClick={() => onNavigate?.("/vault")}>
        Save one thing you know <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </button>
      <p className="ws-meta mt-2 text-xs">
        {LONG_TERM_SHIFT.priority} {LONG_TERM_SHIFT.direction}
      </p>
    </div>
  );
}

export function TradespersonOutcomes() {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
      <ul className="grid gap-1 text-sm text-white/75 sm:grid-cols-2">
        {TRADESPERSON_OUTCOMES.map((o) => (
          <li key={o}>• {o}</li>
        ))}
      </ul>
      <p className="ws-meta mt-2 text-xs">
        Never measured: {TRADESPERSON_NEVER_MEASURED.join(" · ")}
      </p>
    </div>
  );
}

export function TradespersonFrassyNote({ day = 0 }: { day?: number }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
      <p className="text-base">{tradespersonEncouragement(day)}</p>
      <p className="ws-meta mt-2 text-xs italic">{TRADESPERSON_PRINCIPLE}</p>
    </div>
  );
}
