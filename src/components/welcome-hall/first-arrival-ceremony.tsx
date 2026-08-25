import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getArrivalState, type ArrivalState } from "@/lib/arrival.functions";
import { designationMeta } from "@/lib/partners";
import { stopSpeech } from "@/lib/voice/speech-manager";
import { speakWithGuarantee } from "@/lib/frassy/speak-guarantee";
import { PlatformProtectionBanner } from "@/components/founder/platform-protection-banner";
import frassyGold from "@/assets/frassy-gold.png.asset.json";

/**
 * FRASS-0466 — First Arrival, now an arrival state of the Welcome Hall.
 *
 * The ceremony that used to live at /welcome. The backend decides whether this
 * is the first time this person has ever been inside Frass. A first arrival is
 * greeted personally, by voice, then walked on into the Hall. A returning
 * member is welcomed back and sent to their own work. The Daily is never the
 * arrival — it is the destination.
 */
function firstArrivalLines(name: string, designationLabel: string | null): string[] {
  const who = name || "friend";
  return [
    `Hi ${who}. Welcome to Frass.`,
    designationLabel
      ? `I've been looking forward to meeting you — you arrive here as our ${designationLabel}.`
      : "I've been looking forward to meeting you.",
    "I'm Frassy. I host this place. I'll explain everything twice if that's what it takes, and I'll never rush you.",
    "Let me walk you into the Welcome Hall, then we'll set your business up together. Your Daily comes last — that's your desk, not your front door.",
  ];
}

export function FirstArrivalCeremony({ next }: { next?: string }) {
  const navigate = useNavigate();
  const arrivalFn = useServerFn(getArrivalState);
  const [state, setState] = useState<ArrivalState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [line, setLine] = useState(0);
  const [muted, setMuted] = useState(false);
  const spoken = useRef(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Wait for the session (the email link hydrates it), then ask the backend.
  useEffect(() => {
    let alive = true;
    const resolve = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return false;
      try {
        const nextState = await arrivalFn();
        if (alive) setState(nextState);
      } catch {
        if (alive) setError("I couldn't reach your record just now.");
      }
      return true;
    };
    void resolve().then((ok) => {
      if (ok) return;
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        if (session) void resolve();
      });
      // No session appears within a few seconds → send them to sign in.
      const t = setTimeout(async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session && alive) {
          navigate({ to: "/auth", search: { next: "/welcome-hall?arrival=first" } });
        }
      }, 4000);
      return () => {
        sub.subscription.unsubscribe();
        clearTimeout(t);
      };
    });
    return () => {
      alive = false;
      stopSpeech("left the arrival");
    };
  }, [arrivalFn, navigate]);

  // Returning members never see a first-time welcome.
  useEffect(() => {
    if (!state || state.firstArrival) return;
    const t = setTimeout(() => {
      const destination = next ?? (state.journeyComplete ? "/room" : "/onboarding");
      navigate({ to: destination, replace: true });
    }, 1600);
    return () => clearTimeout(t);
  }, [state, navigate, next]);

  const meta = state?.designation ? designationMeta(state.designation) : null;
  const lines = firstArrivalLines(state?.displayName ?? "", meta?.label ?? null);

  // FRASS-0475 — the shared speaking guarantee. Voice gets one retry; if it
  // still cannot start, Frassy says so in words rather than going quiet.
  useEffect(() => {
    if (!state?.firstArrival || spoken.current || muted) return;
    spoken.current = true;
    let alive = true;
    void speakWithGuarantee(lines.join(" "), { owner: "first-arrival" }).then(({ notice }) => {
      if (alive) setVoiceNotice(notice);
    });
    return () => {
      alive = false;
    };
  }, [state, muted, lines]);

  useEffect(() => {
    if (!state?.firstArrival) return;
    const timers = lines.map((_, i) => setTimeout(() => setLine(i), i * 3200));
    return () => timers.forEach(clearTimeout);
  }, [state, lines.length]);

  if (!state) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">
          {error ?? "One moment — Frassy is coming to the gate."}
        </p>
      </Shell>
    );
  }

  if (!state.firstArrival) {
    return (
      <Shell>
        <h1 className="font-display text-4xl">Welcome back.</h1>
        <p className="mt-3 text-sm text-muted-foreground">Taking you back to where you left off…</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <PlatformProtectionBanner domain="registrations" className="mb-6" />
      {meta && (
        <div className="mb-8 inline-flex items-center gap-3 rounded-sm border border-[color:var(--gold)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)]">
          <span className="text-base">{meta.badge}</span> {meta.label}
        </div>
      )}

      <div className="flex items-start gap-6">
        <img
          src={frassyGold.url}
          alt="Frassy, the host of Frass Hill"
          className="h-24 w-24 shrink-0 rounded-full object-cover"
          loading="lazy"
        />
        <div className="space-y-4">
          {lines.slice(0, line + 1).map((l, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "font-display text-4xl leading-tight"
                  : "text-sm leading-relaxed text-foreground/90"
              }
            >
              {l}
            </p>
          ))}
        </div>
      </div>

      {voiceNotice && (
        <p
          role="status"
          className="mt-6 rounded-sm border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/10 px-3 py-2 text-xs text-foreground/80"
        >
          {voiceNotice}
        </p>
      )}

      <button
        onClick={() => {
          setMuted((m) => {
            if (!m) stopSpeech("muted at arrival");
            return !m;
          });
        }}
        className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-[color:var(--gold)]"
      >
        {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        {muted ? "Voice off" : "Voice on"}
      </button>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            stopSpeech("walked into the Hall");
            navigate({
              to: "/welcome-hall",
              search: next ? { next } : {},
              replace: true,
            });
          }}
          className="lux-press inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)]"
        >
          Walk into the Welcome Hall <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <Link
          to="/onboarding"
          className="lux-press rounded-sm border border-border px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.3em] hover:border-[color:var(--gold)]"
        >
          Sit down with Frassy
        </Link>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        Here's the takeaway: this only ever happens once. Next time you sign in, you'll go straight
        back to your own work.
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20" aria-label="Your first arrival">
      {children}
    </section>
  );
}
