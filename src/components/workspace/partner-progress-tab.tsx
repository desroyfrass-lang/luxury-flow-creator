// FRASS-0462 — Partner Progress (Founder only).
//
// Every partner's launch readiness, today's Money Moves and their own words,
// without opening anyone's Daily. Observation plus coaching — never editing
// someone else's work.

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPartnerLaunchStates } from "@/lib/business/accelerator.functions";
import { normalizeState } from "@/lib/business/accelerator";
import {
  currentWeek,
  foundationPct,
  normalizeProgram,
  programDay,
  todayISO,
} from "@/lib/business/launch-program";
import { normalizeMoney, streamById } from "@/lib/business/money-moves";
import {
  allStreamReadiness,
  daysUntilLaunch,
  launchPrepPct,
  normalizeCoaching,
  overallReadiness,
} from "@/lib/launch-mode";
import { addCoachingNote, getLaunchMode, setLaunchMode } from "@/lib/launch-mode.functions";
import { listSharedJournal } from "@/lib/partner-journal.functions";

export function PartnerProgressTab() {
  const qc = useQueryClient();
  const list = useServerFn(listPartnerLaunchStates);
  const modeFn = useServerFn(getLaunchMode);
  const saveMode = useServerFn(setLaunchMode);
  const coach = useServerFn(addCoachingNote);

  const partners = useQuery({ queryKey: ["partner-progress"], queryFn: () => list({}) });
  const modeQ = useQuery({ queryKey: ["launch-mode"], queryFn: () => modeFn({}) });
  const mode = modeQ.data ?? { paymentsLive: false, launchDate: null };

  const [dateInput, setDateInput] = useState("");
  const [note, setNote] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const today = todayISO();
  const rows = useMemo(() => {
    return (partners.data ?? []).map((r) => {
      const raw = (r.state ?? {}) as Record<string, unknown>;
      const launch = normalizeState(raw);
      const program = normalizeProgram(raw['program']);
      const money = normalizeMoney(raw['money']);
      const coaching = normalizeCoaching(raw['coaching']);
      const readiness = allStreamReadiness(launch, program, money);
      const doneToday = money.assigned[today] ?? [];
      const skippedToday = money.skipped[today] ?? [];
      const focus = readiness.find((x) => x.pct < 100) ?? readiness[0];
      return {
        row: r,
        launch,
        program,
        money,
        coaching,
        readiness,
        overall: overallReadiness(readiness),
        doneToday,
        skippedToday,
        focus,
      };
    });
  }, [partners.data, today]);

  async function pushMode(patch: { paymentsLive?: boolean; launchDate?: string | null }) {
    setBusy(true);
    try {
      await saveMode({ data: patch });
      await qc.invalidateQueries({ queryKey: ["launch-mode"] });
    } finally {
      setBusy(false);
    }
  }

  async function sendNote(userId: string, about: string) {
    const text = (note[userId] ?? "").trim();
    if (!text) return;
    setBusy(true);
    try {
      await coach({ data: { userId, about, text } });
      setNote((n) => ({ ...n, [userId]: "" }));
      await qc.invalidateQueries({ queryKey: ["partner-progress"] });
    } finally {
      setBusy(false);
    }
  }

  const countdown = daysUntilLaunch(mode);

  return (
    <div className="space-y-6">
      <SharedJournal />
      {/* Launch control — the Founder decides when the lights come on. */}
      <section className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
        <h3 className="font-display text-sm uppercase tracking-[0.18em]">Launch control</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Payments are {mode.paymentsLive ? "live" : "intentionally off"}.{" "}
          {mode.paymentsLive
            ? "Pre-Launch Mode has ended everywhere automatically."
            : "Every partner sees Pre-Launch Mode until you switch this on. Nothing looks broken to them."}
          {countdown !== null && !mode.paymentsLive ? ` ${countdown} days to go.` : ""}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="text-xs text-muted-foreground">
            Launch date
            <input
              type="date"
              value={dateInput || mode.launchDate || ""}
              onChange={(e) => setDateInput(e.target.value)}
              onBlur={() => dateInput && pushMode({ launchDate: dateInput })}
              className="ml-2 rounded-full bg-black/30 px-3 py-1 text-sm"
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => pushMode({ paymentsLive: !mode.paymentsLive })}
            className="rounded-full border border-white/20 px-4 py-1.5 text-sm"
          >
            {mode.paymentsLive ? "Return to Pre-Launch Mode" : "Turn on payments (go live)"}
          </button>
        </div>
      </section>

      {partners.isLoading && <p className="ws-meta">Reading partner progress…</p>}
      {!partners.isLoading && !rows.length && (
        <p className="ws-meta">No partners have started a launch plan yet.</p>
      )}

      {rows.map((p) => {
        const name = p.row.display_name ?? p.row.email ?? "Partner";
        const day = programDay(p.program);
        return (
          <article key={p.row.user_id} className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="font-display text-lg">{name}</h3>
                <p className="text-xs text-muted-foreground">
                  Day {day} of 30 · {currentWeek(p.program).label} · last active{" "}
                  {p.row.updated_at ? new Date(p.row.updated_at).toLocaleDateString() : "—"}
                </p>
              </div>
              <span className="font-display text-2xl">{p.overall}% ready</span>
            </header>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <Stat label="Foundation set up" value={`${foundationPct(p.program)}%`} />
              <Stat label="Launch preparation" value={`${launchPrepPct(p.money)}%`} />
              <Stat label="Streak (active days)" value={String(p.launch.activeDays.length)} />
              <Stat
                label="Current focus"
                value={p.focus ? `${p.focus.stream.emoji} ${p.focus.stream.label}` : "—"}
              />
            </dl>

            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Businesses being built
              </p>
              <div className="mt-2 space-y-2">
                {p.readiness.map((r) => (
                  <div key={r.stream.id} className="flex items-center gap-3 text-sm">
                    <span className="w-48 shrink-0">
                      {r.stream.emoji} {r.stream.label}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full bg-[color:var(--gold,#d4af37)]"
                        style={{ width: `${r.pct}%` }}
                      />
                    </span>
                    <span className="w-16 text-right text-muted-foreground">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Today's Money Moves
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {p.doneToday.map((k) => (
                  <li key={`d-${k}`}>✅ {moveLabel(k)}</li>
                ))}
                {p.skippedToday.map((k) => (
                  <li key={`s-${k}`} className="text-muted-foreground">
                    ⚪ Skipped — {moveLabel(k)}
                  </li>
                ))}
                {!p.doneToday.length && !p.skippedToday.length && (
                  <li className="text-muted-foreground">🔵 Scheduled — nothing accepted yet today.</li>
                )}
              </ul>
            </div>

            {p.program.reflections.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  In their own words
                </p>
                <ul className="mt-2 space-y-2 text-sm">
                  {p.program.reflections.slice(-3).reverse().map((r, i) => (
                    <li key={`${r.date}-${i}`} className="rounded-2xl bg-black/20 p-3">
                      <span className="block text-[11px] text-muted-foreground">{r.question}</span>
                      {r.answer}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Coaching on their progress
              </p>
              <textarea
                rows={2}
                value={note[p.row.user_id] ?? ""}
                onChange={(e) => setNote((n) => ({ ...n, [p.row.user_id]: e.target.value }))}
                placeholder="Great work finishing your Wellness Brand setup. Tomorrow let's focus on your first affiliate content."
                className="mt-2 w-full rounded-2xl bg-black/30 p-3 text-sm"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  sendNote(p.row.user_id, p.focus ? p.focus.stream.label : "Launch progress")
                }
                className="mt-2 rounded-full border border-white/20 px-4 py-1.5 text-sm"
              >
                Send encouragement
              </button>
              {p.coaching.length > 0 && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {p.coaching.length} note{p.coaching.length === 1 ? "" : "s"} sent so far.
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3">
      <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-lg">{value}</dd>
    </div>
  );
}

/** Move keys are `streamId:...` — show the stream so the Founder reads it at a glance. */
function moveLabel(key: string): string {
  const streamId = key.split(":")[0] ?? "";
  const stream = streamById(streamId);
  const rest = key.slice(streamId.length + 1).replace(/[-_:]/g, " ");
  return stream ? `${stream.emoji} ${stream.label} — ${rest || "move"}` : key;
}


/** FRASS-0463 — Journal entries the Partner explicitly chose to share. Read-only. */
function SharedJournal() {
  const fn = useServerFn(listSharedJournal);
  const q = useQuery({ queryKey: ["shared-journal"], queryFn: () => fn({}) });
  const rows = q.data ?? [];
  if (!rows.length) return null;
  return (
    <section className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
      <h3 className="font-display text-sm uppercase tracking-[0.18em]">In their own words</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Journal entries partners chose to share with you. Private entries never appear here.
      </p>
      <div className="mt-4 space-y-3">
        {rows.slice(0, 10).map((r) => (
          <article key={r.id} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {r.display_name ?? "Partner"} · {r.entry_date}
              {r.mood ? ` · ${r.mood}` : ""}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{r.prompt}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{r.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
