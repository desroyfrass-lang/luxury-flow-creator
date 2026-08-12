// FRASS-P001 — Kanko's Daily, Version 1. The reference implementation for every
// personalized Daily. Organisation and words only; capability is unchanged.
//
// Rides on: FRASS-0501 Three-Layer Financial Engine · FRASS-0502 Daily ROI,
// Energy Management, Momentum Protection and the Golden Rule.

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { speakWithGuarantee } from "@/lib/frassy/speak-guarantee";
import { LAYER_BY_ID, balanceSentence } from "@/lib/business/financial-layers";
import {
  IMPROVEMENTS,
  energyProfile,
  judgeDay,
  learnedBestWindow,
  protectMomentum,
  type ImprovementId,
} from "@/lib/daily/time-roi";
import {
  AFFILIATE_STATUS,
  COCO_TODAY,
  FREEDOM_COUNTDOWN,
  FREEDOM_PROGRESS,
  FREIGHT_STATUS,
  KANKO_GREETING,
  KANKO_HEADER,
  KANKO_MINUTES_PER_DAY,
  KANKO_MOVES,
  KANKO_MOVE_LIMIT,
  MORNING_BRIEF,
  SUCCESS_OUTCOMES,
  TIME_PROMISE,
  countdownPosition,
  greetingPlayed,
  kankoBalance,
  kankoBalanceNote,
  kankoEncouragement,
  kankoEndOfDay,
  kankoLearning,
  kankoRoiPlan,
  markGreetingPlayed,
  movesForSection,
  type KankoMove,
} from "@/lib/daily/kanko";

export function KankoWelcome({ name = "Kanko", daysAway = 0 }: { name?: string; daysAway?: number }) {
  const [played, setPlayed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const first = useMemo(() => greetingPlayed(), []);
  const restart = useMemo(() => protectMomentum(daysAway, KANKO_MOVES[0]?.label), [daysAway]);

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

      {/* Momentum Protection — never a backlog, always one winnable move. */}
      {daysAway > 1 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm">
          <p>{restart.greeting}</p>
          <p className="ws-meta mt-1">{restart.reassurance}</p>
          <p className="mt-2">Start here: <strong>{restart.oneMove}</strong></p>
        </div>
      )}

      <dl className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
        <Fact label="Today's focus" value={KANKO_HEADER.focus} />
        <Fact label="Estimated working time" value={`⏱ ${KANKO_HEADER.workingTime}`} />
        <Fact label="Today's priority" value={`💰 ${KANKO_HEADER.priority}`} />
      </dl>

      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Morning brief</p>
        <ul className="mt-1 grid gap-1 text-sm sm:grid-cols-2">
          {MORNING_BRIEF.map((b) => (
            <li key={b.id}>• {b.label}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** FRASS-0501 + FRASS-0502 — how today's two hours are actually spent. */
export function KankoTimePlan({ minutes = KANKO_MINUTES_PER_DAY }: { minutes?: number }) {
  const balance = useMemo(() => kankoBalance(minutes), [minutes]);
  const roi = useMemo(() => kankoRoiPlan(minutes), [minutes]);
  const energy = energyProfile();
  const learned = learnedBestWindow();

  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
      <p className="text-sm">{TIME_PROMISE}</p>

      <div className="mt-4 space-y-3">
        {balance.allocation.map((a) => {
          const layer = LAYER_BY_ID[a.layer];
          return (
            <div key={a.layer}>
              <div className="flex items-baseline justify-between text-sm">
                <span>{layer.dot} {layer.label}</span>
                <span className="text-muted-foreground">{a.minutes} min</span>
              </div>
              <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full bg-[color:var(--gold,#d4af37)]" style={{ width: `${a.pct}%` }} />
              </span>
              <p className="ws-meta mt-1">{layer.question} — {layer.because}</p>
            </div>
          );
        })}
      </div>

      <p className="ws-meta mt-3">{balance.explanation}</p>
      <p className="ws-meta mt-2">⏱ Return on your time: {roi.explanation}</p>
      <p className="ws-meta mt-2">
        {energy.label.toLowerCase() === "morning" ? "🌅" : energy.label.toLowerCase() === "afternoon" ? "🌤" : "🌙"}{" "}
        {energy.label}: {energy.plain} Best for {energy.bestFor.join(", ").toLowerCase()}.
        {learned && learned !== energy.window
          ? ` I've noticed you actually finish more in the ${learned} — we can move the heavy work there.`
          : ""}
      </p>
      <p className="ws-meta mt-1">{balanceSentence(balance)}</p>
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

/** ⭐ Freedom Countdown — milestones, not days. */
export function KankoFreedomCountdown() {
  const pos = countdownPosition();
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
      <p className="text-sm">
        {pos.reached} of {pos.total} milestones reached.
        {pos.next && <> Next: <strong>{pos.next.label}</strong></>}
      </p>
      {pos.next && <p className="ws-meta mt-1">{pos.next.meaning}</p>}
      <ol className="mt-4 space-y-2 text-sm">
        {FREEDOM_COUNTDOWN.map((m) => (
          <li key={m.id} className="flex items-start gap-2">
            <span aria-hidden>{m.reached ? "✅" : "⬜"}</span>
            <span>
              <span className={m.reached ? "" : "text-muted-foreground"}>{m.label}</span>
              <span className="ws-meta block">{m.meaning}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function MoveCard({ move, index, onNavigate }: { move: KankoMove; index: number; onNavigate?: (href: string) => void }) {
  const layer = LAYER_BY_ID[move.layer];
  return (
    <button type="button" className="daily-card daily-clickable text-left" onClick={() => onNavigate?.(move.href)}>
      <span className="ws-meta">{index + 1} · {move.impact} · {move.minutes} min</span>
      <span className="daily-task-label">{move.label}</span>
      <span className="ws-meta">{move.why}</span>
      <span className="ws-meta">{layer.dot} {layer.label} — {layer.because}</span>
      <span className="daily-go">
        Start <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

export function KankoMoneyMoves({ onNavigate }: { onNavigate?: (href: string) => void }) {
  return (
    <div className="daily-grid">
      {KANKO_MOVES.slice(0, KANKO_MOVE_LIMIT).map((m, i) => (
        <MoveCard key={m.id} move={m} index={i} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

/** 🚀 The one action most likely to improve her financial future today. */
export function KankoFreedomMove({ onNavigate }: { onNavigate?: (href: string) => void }) {
  const move = movesForSection("freedom-move")[0];
  if (!move) return null;
  const layer = LAYER_BY_ID[move.layer];
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
      <p className="daily-task-label text-base">{move.label}</p>
      <p className="ws-meta mt-1">{move.why}</p>
      <p className="ws-meta mt-1">{layer.dot} {layer.label} · {move.minutes} min</p>
      <button type="button" className="daily-link mt-3" onClick={() => onNavigate?.(move.href)}>
        Do this first <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/** 💰 Fastest ethical income opportunities. */
export function KankoQuickIncome({ onNavigate }: { onNavigate?: (href: string) => void }) {
  const moves = movesForSection("quick-income");
  return (
    <div className="daily-grid">
      {moves.map((m, i) => (
        <MoveCard key={m.id} move={m} index={i} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

/** 📈 One action that strengthens her long-term businesses. */
export function KankoBusinessBuilder({ onNavigate }: { onNavigate?: (href: string) => void }) {
  const move = movesForSection("business-builder")[0];
  if (!move) return null;
  const layer = LAYER_BY_ID[move.layer];
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
      <p className="daily-task-label text-base">{move.label}</p>
      <p className="ws-meta mt-1">{move.why}</p>
      <p className="ws-meta mt-1">{layer.dot} {layer.label} · {move.minutes} min</p>
      <button type="button" className="daily-link mt-3" onClick={() => onNavigate?.(move.href)}>
        Build it <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/** 🎓 Only shown when it directly unlocks income. */
export function KankoLearning({ published = 0 }: { published?: number }) {
  const lesson = kankoLearning(published);
  if (!lesson) return null;
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.02] p-5 text-sm">
      <p>{lesson.label}</p>
      <p className="ws-meta mt-1">{lesson.unlocks}</p>
    </div>
  );
}

/** ❤️ One gentle reminder. Never another task list. */
export function KankoBalanceNote({ day, published = 0 }: { day: number; published?: number }) {
  const note = kankoBalanceNote(day, published);
  if (!note) return null;
  return <p className="text-sm leading-relaxed">❤️ {note}</p>;
}

export function KankoCocoVintage({ onNavigate }: { onNavigate?: (href: string) => void }) {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
      <p className="text-sm">
        Today's publishing goal: <strong>publish {COCO_TODAY.goal} products</strong>.
      </p>
      <p className="ws-meta mt-1">{COCO_TODAY.workflow}</p>
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

/** 🤝 Prepared, never promoted early. */
export function KankoAffiliatePrep() {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.02] p-5">
      <p className="text-sm">
        🤝 Affiliate — <strong>{AFFILIATE_STATUS.state}</strong>. Not active yet.
      </p>
      <p className="ws-meta mt-2">{AFFILIATE_STATUS.why}</p>
      <p className="ws-meta mt-1">{AFFILIATE_STATUS.plain}</p>
      <p className="ws-meta mt-2">Preparing now: {AFFILIATE_STATUS.preparing.join(" · ")}</p>
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
      <p className="ws-meta mt-2">{FREIGHT_STATUS.never}</p>
    </div>
  );
}

/** Outcomes, not activity. */
export function KankoSuccessDashboard() {
  return (
    <div className="daily-grid">
      {SUCCESS_OUTCOMES.map((o) => (
        <div key={o.id} className="daily-card">
          <span className="ws-meta">{o.emoji} {o.label}</span>
          <span className="daily-task-label">{o.value}</span>
        </div>
      ))}
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

  // The Golden Rule — every Daily ends better than it began.
  const improved: ImprovementId[] = [];
  if (published > 0) {
    improved.push("business", "freedom");
  }
  if (movesDone.some((id) => KANKO_MOVES.find((m) => m.id === id)?.layer === "immediate-income")) {
    improved.push("money");
  }
  if (movesDone.includes("collection-system")) improved.push("system");
  if (movesDone.length > 0) improved.push("confidence");
  const verdict = judgeDay(improved);

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
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Did today end better than it began?</p>
        <ul className="mt-1 flex flex-wrap gap-2">
          {IMPROVEMENTS.map((i) => (
            <li key={i.id} className="ws-chip">
              {verdict.improved.includes(i.id) ? "✅" : "⬜"} {i.emoji} {i.label}
            </li>
          ))}
        </ul>
        <p className="ws-meta mt-2">{verdict.closing}</p>
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
