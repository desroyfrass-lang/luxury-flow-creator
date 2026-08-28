import { safeContinuation, SAFE_MEMBER_DESTINATION } from "@/lib/welcome-hall/continuation";
// FRASS-0569 — 🌅 Welcome Hall One: the Daily Welcome.
//
// This is the ceremony every Builder passes through once a calendar day before
// the Daily. Frassy speaks first. The member may continue or skip — but the
// platform never bypasses this arrival.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Play, Volume2, VolumeX } from "lucide-react";
import { getWelcomeHall } from "@/lib/welcome-hall.functions";
import { speakWithGuarantee } from "@/lib/frassy/speak-guarantee";
import { stopSpeech } from "@/lib/voice/speech-manager";
import { unlockAudio } from "@/lib/audio-unlock";
import {
  buildWelcomeScript,
  getWelcomeTier,
  markWelcomedToday,
  setWelcomeTier,
  WELCOME_TIERS,
  TIER_BY_ID,
  type WelcomeTier,
} from "@/lib/welcome-hall/daily-welcome";
import { FrassyLook } from "@/components/frassy/frassy-look";
import { t as copy } from "@/lib/i18n";

export function DailyWelcomeCeremony({ next = SAFE_MEMBER_DESTINATION }: { next?: string }) {
  // Atlas Recovery Phase 1 — never continue back into the Welcome Hall itself.
  const destination = safeContinuation(next);
  const navigate = useNavigate();
  const hallFn = useServerFn(getWelcomeHall);
  const [tier, setTier] = useState<WelcomeTier>("motivational");
  const [name, setName] = useState<string | null>(null);
  const [remembered, setRemembered] = useState(0);
  const [line, setLine] = useState(0);
  const [muted, setMuted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [step, setStep] = useState(0); // conversation step
  const [answered, setAnswered] = useState<string[]>([]);
  const spoken = useRef<string | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTier(getWelcomeTier());
  }, []);


  useEffect(() => {
    let alive = true;
    void hallFn()
      .then((s) => {
        if (!alive) return;
        setName(s.displayName);
        setRemembered(s.totalRemembered);
      })
      .catch(() => {
        /* a greeting never depends on a lookup succeeding */
      });
    return () => {
      alive = false;
      stopSpeech("left the Welcome Hall");
    };
  }, [hallFn]);

  const script = useMemo(
    () => buildWelcomeScript(tier, { name, remembered }),
    [tier, name, remembered],
  );

  const speak = useCallback(
    async (text: string, key: string) => {
      if (muted || spoken.current === key) return;
      spoken.current = key;
      unlockAudio();
      const { notice: n } = await speakWithGuarantee(text, { owner: "daily-welcome" });
      setNotice(n);
    },
    [muted],
  );

  // Frassy speaks the moment she can. If the browser refuses audio before a
  // gesture, the "Hear Frassy" button below is the gesture.
  useEffect(() => {
    if (muted) return;
    void speak(script.lines.join(" "), `${tier}:${name ?? ""}`);
  }, [script, speak, muted, tier, name]);

  // Lines reveal in rhythm with the speaking.
  useEffect(() => {
    setLine(0);
    const timers = script.lines.map((_, i) => setTimeout(() => setLine(i), i * 3400));
    return () => timers.forEach(clearTimeout);
  }, [script]);

  const leave = (to: string) => {
    markWelcomedToday();
    stopSpeech("welcome hall concluded");
    navigate({ href: to, replace: true });
  };

  const meta = TIER_BY_ID[tier];
  const prompt = script.prompts[step];

  return (
    <section
      aria-label="Daily Welcome"
      className="relative overflow-hidden rounded-[2rem] border border-[color:var(--hill-gold)]/45 bg-card/80 p-6 shadow-xl backdrop-blur md:p-10"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--hill-gold)]">
          🌅 {copy("welcome.hallLabel")}
        </p>
        <button
          type="button"
          onClick={() => {
            setMuted((m) => {
              if (!m) stopSpeech("muted the Welcome Hall");
              else {
                spoken.current = null;
                unlockAudio();
              }
              return !m;
            });
          }}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          {muted ? copy("welcome.voiceOff") : copy("welcome.voiceOn")}
        </button>
      </div>

      <div className="mt-7 flex items-start gap-5">
        <FrassyLook room="hall" size={112} showCaption={false} />
        <div className="space-y-4">
          {(mounted ? script.lines.slice(0, line + 1) : []).map((l, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "font-display text-3xl leading-tight md:text-4xl"
                  : "max-w-2xl text-sm leading-relaxed text-foreground/90 md:text-base"
              }
            >
              {l}
            </p>
          ))}
        </div>
      </div>

      {/* The browser's autoplay rules mean the first sound sometimes needs a
          click. Frassy never stays silent without saying why. */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            spoken.current = null;
            setMuted(false);
            void speak(script.lines.join(" "), `replay:${Date.now()}`);
          }}
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--hill-gold)]/60 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[color:var(--hill-gold)] transition hover:bg-[color:var(--hill-gold)]/10"
        >
          <Play className="h-3.5 w-3.5" /> Hear Frassy
        </button>
        {notice && (
          <p role="status" className="text-xs text-muted-foreground">
            {notice}
          </p>
        )}
      </div>

      {/* ❤️ Tier three — a short back-and-forth before the work begins. */}
      {tier === "conversation" && prompt && (
        <div className="mt-8 rounded-2xl border border-border/70 bg-background/50 p-5">
          <p className="text-sm font-bold">{prompt.question}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {prompt.replies.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setAnswered((a) => [...a, `${prompt.question} — ${r}`]);
                  spoken.current = null;
                  void speak(prompt.response, `reply:${step}:${r}`);
                  setStep((s) => s + 1);
                }}
                className="rounded-full border border-border px-4 py-2 text-xs transition hover:border-[color:var(--hill-gold)]"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
      {tier === "conversation" && !prompt && answered.length > 0 && (
        <ul className="mt-8 space-y-2 text-xs text-muted-foreground">
          {answered.map((a) => (
            <li key={a}>✅ {a}</li>
          ))}
          <li className="text-foreground">Frassy: “Good. Let's take today one move at a time.”</li>
        </ul>
      )}

      {/* 🎥 Tier four — celebration before work. */}
      {script.celebration.length > 0 && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {script.celebration.map((c) => (
            <article key={c.title + c.line} className="rounded-2xl border border-border/70 bg-background/50 p-5">
              <span aria-hidden className="text-2xl">
                {c.glyph}
              </span>
              <h3 className="mt-3 text-sm font-bold">{c.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.line}</p>
            </article>
          ))}
        </div>
      )}

      <div className="mt-9 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => leave(destination)}
          className="lux-press inline-flex items-center gap-2 rounded-sm border border-[color:var(--hill-gold)] bg-[color:var(--hill-gold)] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)]"
        >
          {copy("welcome.continue")} <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => leave(destination)}
          className="lux-press rounded-sm border border-border px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.3em] hover:border-[color:var(--hill-gold)]"
        >
          {copy("welcome.skip")}
        </button>
      </div>

      <div className="mt-8 border-t border-border/60 pt-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {copy("welcome.tierIntro", { styleName: `${meta.glyph} ${meta.name}` })}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {WELCOME_TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setWelcomeTier(t.id);
                setTier(t.id);
                setStep(0);
                setAnswered([]);
                spoken.current = null;
              }}
              className={`rounded-full border px-4 py-2 text-xs transition ${
                t.id === tier
                  ? "border-[color:var(--hill-gold)] text-[color:var(--hill-gold)]"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.glyph} {t.name} · {t.length}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Here's what that means: this choice lives in your Daily settings, and Frassy greets you
          this way every morning until you change it.
        </p>
      </div>
    </section>
  );
}
