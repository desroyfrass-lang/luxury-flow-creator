// FRASS-0546 — Settings → Momentum & Challenge Style.
//
// Deadlines are earned, never imposed — and can be switched off for good.

import { useState } from "react";
import { useMomentum } from "@/hooks/use-momentum";
import { ACHIEVEMENT_STYLES, MOMENTUM_LEVELS } from "@/lib/frassy/momentum";

export function MomentumCard() {
  const {
    hydrated,
    record,
    momentum,
    challenge,
    setStyle,
    setChallengesOptOut,
    declineChallenge,
    completeChallenge,
  } = useMomentum();
  const [answered, setAnswered] = useState<"accepted" | "declined" | "done" | null>(null);

  if (!hydrated) return null;

  return (
    <section className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
      <h2 className="text-xs uppercase tracking-[0.24em] text-[color:var(--gold)]">
        Momentum &amp; challenges
      </h2>
      <p className="mt-2 text-sm text-white/70">{momentum.plain}</p>

      {/* Where you are */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {MOMENTUM_LEVELS.map((l) => {
          const active = l.id === momentum.level;
          return (
            <div
              key={l.id}
              className={[
                "rounded-md border p-3 text-left",
                active
                  ? "border-[color:var(--gold)]/60 bg-[color:var(--gold)]/10"
                  : "border-white/10 bg-white/[0.03] opacity-70",
              ].join(" ")}
            >
              <div className="text-sm font-medium text-white/90">
                <span aria-hidden>{l.glyph}</span> {l.label}
                {active && (
                  <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--gold)]">
                    You are here
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-white/60">{l.promise}</p>
            </div>
          );
        })}
      </div>

      {momentum.nextUnlock && (
        <p className="mt-3 text-[11px] text-white/40">{momentum.nextUnlock}</p>
      )}

      {/* How you like to achieve */}
      <div className="mt-5">
        <p className="text-sm text-white/70">
          How do you like to make progress? Frassy shapes challenges around your answer — the
          destination is the same either way.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACHIEVEMENT_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyle(s.id)}
              title={s.memberVoice}
              className={[
                "rounded-full border px-3 py-1.5 text-xs transition",
                record.style === s.id
                  ? "border-[color:var(--gold)]/60 bg-[color:var(--gold)]/15 text-[color:var(--gold)]"
                  : "border-white/15 text-white/70 hover:border-white/35",
              ].join(" ")}
            >
              <span aria-hidden>{s.glyph}</span> {s.label}
            </button>
          ))}
        </div>
        {momentum.style && (
          <p className="mt-2 text-[11px] text-white/40">{momentum.style.shaping}</p>
        )}
      </div>

      {/* An offered challenge — accept or decline, freely */}
      {challenge && !answered && (
        <div className="mt-5 rounded-md border border-white/15 bg-black/30 p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
            Optional challenge
          </p>
          <p className="mt-1 text-base text-white/90">{challenge.title}</p>
          <p className="mt-1 text-sm text-white/60">{challenge.why}</p>
          <p className="mt-2 text-xs text-white/50">
            By {challenge.dueLabel} · {challenge.reward}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAnswered("accepted")}
              className="rounded-full bg-[color:var(--gold)] px-4 py-1.5 text-xs font-medium text-black"
            >
              I'll take it on
            </button>
            <button
              type="button"
              onClick={() => {
                declineChallenge();
                setAnswered("declined");
              }}
              className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-white/70"
            >
              Not this one
            </button>
          </div>
        </div>
      )}

      {answered === "accepted" && (
        <div className="mt-5 rounded-md border border-white/15 bg-black/30 p-4">
          <p className="text-sm text-white/80">
            It's yours. Nothing bad happens if it slips — tell Frassy when it's done.
          </p>
          <button
            type="button"
            onClick={() => {
              completeChallenge();
              setAnswered("done");
            }}
            className="mt-3 rounded-full border border-[color:var(--gold)]/50 px-4 py-1.5 text-xs text-[color:var(--gold)]"
          >
            I finished it
          </button>
        </div>
      )}

      {answered === "declined" && (
        <p className="mt-5 text-sm text-white/60">
          No problem at all. Declining costs you nothing — Frassy will keep going at your pace.
        </p>
      )}

      {answered === "done" && (
        <p className="mt-5 text-sm text-[color:var(--gold)]">
          Finished. That's the reward that actually matters — the rest follows it.
        </p>
      )}

      <label className="mt-5 flex items-center gap-2 text-xs text-white/50">
        <input
          type="checkbox"
          checked={record.challengesOptOut}
          onChange={(e) => setChallengesOptOut(e.target.checked)}
          className="accent-[color:var(--gold)]"
        />
        Never offer me challenges or completion dates
      </label>
    </section>
  );
}
