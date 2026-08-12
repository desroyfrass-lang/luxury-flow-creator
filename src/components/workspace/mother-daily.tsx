// FRASS-P002-Z — Your Mother's Daily. The second founding blueprint: the
// knowledge economy. Organisation and words only; capability is unchanged.

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { LAYER_BY_ID, balanceSentence } from "@/lib/business/financial-layers";
import { KNOWLEDGE_ECONOMY_BLUEPRINT, VALIDATION_PHASE } from "@/lib/daily/blueprints";
import { protectMomentum } from "@/lib/daily/time-roi";
import {
  FIRST_DOLLAR,
  VALUATION_HONESTY,
  VENTURE_PHASES,
} from "@/lib/business/hidden-assets";
import {
  KNOWLEDGE_FUTURES,
  KNOWLEDGE_PROTOCOL,
  LEGACY_PRINCIPLE,
  MOTHER_BUSINESS_PHILOSOPHY,
  MOTHER_FIRST_VENTURE,
  MOTHER_MINUTES_PER_DAY,
  MOTHER_MONEY_RULE,
  MOTHER_MOVES,
  MOTHER_MOVE_LIMIT,
  MOTHER_NEVER_MEASURED,
  MOTHER_OUTCOMES,
  MOTHER_PILLARS,
  motherBalance,
  motherEncouragement,
  motherRoiPlan,
  motherWellbeingNote,
  movesForPillar,
  type MotherMove,
} from "@/lib/daily/mother";

function MoveCard({ move, onNavigate }: { move: MotherMove; onNavigate?: (href: string) => void }) {
  const layer = LAYER_BY_ID[move.layer];
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="ws-chip">
          {layer?.dot} {layer?.label}
        </span>
        <span className="ws-meta">{move.minutes} min · {move.impact}</span>
      </div>
      <p className="mt-2 text-sm font-medium">{move.label}</p>
      <p className="ws-meta mt-1">{move.why}</p>
      <button type="button" className="ws-chip mt-3" onClick={() => onNavigate?.(move.href)}>
        Start this <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function MotherWelcome({ name = "Mom", daysAway = 0 }: { name?: string; daysAway?: number }) {
  const restart = useMemo(() => protectMomentum(daysAway, MOTHER_MOVES[0]?.label), [daysAway]);
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
      <h3 className="font-display text-xl">🌅 Good morning, {name}</h3>
      <p className="mt-2 text-sm leading-relaxed">
        {MOTHER_VISION_LINE}
      </p>
      <p className="ws-meta mt-2">{restart.greeting} {restart.reassurance}</p>
    </div>
  );
}

const MOTHER_VISION_LINE =
  "What you know is worth money today, and worth keeping forever. Today we do a little of both — nothing more than you feel like doing.";

export function MotherBalanceOfDay() {
  const balance = useMemo(() => motherBalance("moderate"), []);
  const plan = useMemo(() => motherRoiPlan(MOTHER_MINUTES_PER_DAY), []);
  return (
    <div className="space-y-3">
      <p className="text-sm">{balanceSentence(balance)}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {MOTHER_PILLARS.map((p) => (
          <div key={p.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <p className="text-sm font-medium">{p.emoji} {p.label}</p>
            <p className="ws-meta mt-1">{p.plain}</p>
          </div>
        ))}
      </div>
      <p className="ws-meta">{plan.explanation}</p>
    </div>
  );
}

export function MotherMoneyMoves({ onNavigate }: { onNavigate?: (href: string) => void }) {
  const moves = useMemo(
    () => [...movesForPillar("income"), ...movesForPillar("business")].slice(0, MOTHER_MOVE_LIMIT),
    [],
  );
  return (
    <div className="space-y-3">
      <p className="ws-meta">{MOTHER_MONEY_RULE.first} {MOTHER_MONEY_RULE.caution}</p>
      {moves.map((m) => (
        <MoveCard key={m.id} move={m} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

export function MotherKnowledge({ onNavigate }: { onNavigate?: (href: string) => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const move = movesForPillar("knowledge")[0];
  return (
    <div className="space-y-3">
      {move && <MoveCard move={move} onNavigate={onNavigate} />}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm font-medium">How I handle what you tell me</p>
        <ul className="ws-meta mt-2 space-y-1">
          {KNOWLEDGE_PROTOCOL.always.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <p className="ws-meta mt-2">{KNOWLEDGE_PROTOCOL.control}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm font-medium">📚 And you decide where it goes</p>
        <p className="ws-meta mt-1">{LEGACY_PRINCIPLE.rule} {LEGACY_PRINCIPLE.decides}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {KNOWLEDGE_FUTURES.map((f) => (
            <button
              key={f.id}
              type="button"
              className="ws-chip"
              aria-pressed={chosen === f.id}
              onClick={() => setChosen(chosen === f.id ? null : f.id)}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
        {chosen && (
          <p className="ws-meta mt-2">
            {KNOWLEDGE_FUTURES.find((f) => f.id === chosen)?.plain} Nothing is saved until you say so.
          </p>
        )}
      </div>
    </div>
  );
}

export function MotherBusinessDevelopment({ onNavigate }: { onNavigate?: (href: string) => void }) {
  const move = movesForPillar("business")[0];
  return (
    <div className="space-y-3">
      <p className="ws-meta">{MOTHER_BUSINESS_PHILOSOPHY.statement} {MOTHER_BUSINESS_PHILOSOPHY.how}</p>
      {move && <MoveCard move={move} onNavigate={onNavigate} />}
    </div>
  );
}

export function MotherWellbeing({ day = 0 }: { day?: number }) {
  const note = useMemo(() => motherWellbeingNote(day), [day]);
  if (!note) return null;
  return <p className="text-sm leading-relaxed">❤️ {note}</p>;
}

export function MotherOutcomes() {
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {MOTHER_OUTCOMES.map((o) => (
          <div key={o.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <p className="text-sm">{o.emoji} {o.label}</p>
            <p className="font-display text-lg">{o.value}</p>
          </div>
        ))}
      </div>
      <p className="ws-meta">
        Never measured: {MOTHER_NEVER_MEASURED.join(" · ")}. {VALIDATION_PHASE.rule}
      </p>
    </div>
  );
}

export function MotherFrassyNote({ day = 0 }: { day?: number }) {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-4">
      <p className="text-sm leading-relaxed">{motherEncouragement(day)}</p>
      <p className="ws-meta mt-2">{KNOWLEDGE_ECONOMY_BLUEPRINT.founderPrinciple}</p>
    </div>
  );
}

// FRASS-P002-E — First Business Venture. Her first business is something she
// already owns. Small step today; First Dollar Earned is the milestone.
export function MotherFirstVenture({ onNavigate }: { onNavigate?: (href: string) => void }) {
  const move = MOTHER_MOVES.find((m) => m.id === "first-venture");
  return (
    <div className="space-y-3">
      <p className="ws-meta">
        {MOTHER_FIRST_VENTURE.vision} {MOTHER_FIRST_VENTURE.lowestRisk}
      </p>
      {move && <MoveCard move={move} onNavigate={onNavigate} />}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm font-medium">{FIRST_DOLLAR.emoji} {FIRST_DOLLAR.label}</p>
        <p className="ws-meta mt-1">{FIRST_DOLLAR.before}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {VENTURE_PHASES.map((p) => (
            <span key={p.id} className="ws-chip">
              {p.emoji} {p.number}. {p.label}
            </span>
          ))}
        </div>
        <p className="ws-meta mt-2">{VALUATION_HONESTY.never}</p>
      </div>
      <button
        type="button"
        className="ws-chip"
        onClick={() => onNavigate?.(MOTHER_FIRST_VENTURE.href)}
      >
        Open your collection <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </button>
    </div>
  );
}
