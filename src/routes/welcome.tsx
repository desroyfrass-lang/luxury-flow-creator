import { PlatformProtectionBanner } from "@/components/founder/platform-protection-banner";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getArrivalState, type ArrivalState } from "@/lib/arrival.functions";
import { designationMeta } from "@/lib/partners";
import { speakText, stopSpeech } from "@/lib/voice/speech-manager";
import frassyGold from "@/assets/frassy-gold.png.asset.json";

/**
 * FRASS-0466 — First Arrival.
 *
 * Every verified account lands here, and nowhere else. The backend decides
 * whether this is the first time this person has ever been inside Frass. A
 * first arrival is greeted personally, by voice, then walked to the Welcome
 * Hall. A returning member is simply welcomed back and sent on. The Daily is
 * never the arrival — it is the destination.
 */
export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to Frass — your first arrival" },
      {
        name: "description",
        content:
          "Frassy meets you at the gate after you confirm your email, then walks you into the Frass Hill Welcome Hall.",
      },
      { property: "og:title", content: "Welcome to Frass" },
      { property: "og:description", content: "Frassy meets you at the gate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: WelcomePage,
});

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

function WelcomePage() {
  const navigate = useNavigate();
  const arrivalFn = useServerFn(getArrivalState);
  const [state, setState] = useState<ArrivalState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [line, setLine] = useState(0);
  const [muted, setMuted] = useState(false);
  const spoken = useRef(false);

  // Wait for the session (the email link hydrates it), then ask the backend.
  useEffect(() => {
    let alive = true;
    const resolve = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return false;
      try {
        const next = await arrivalFn();
        if (alive) setState(next);
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
        if (!data.session && alive) navigate({ to: "/auth", search: { next: "/welcome" } });
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
      navigate({ to: state.journeyComplete ? "/room" : "/onboarding", replace: true });
    }, 1600);
    return () => clearTimeout(t);
  }, [state, navigate]);

  const meta = state?.designation ? designationMeta(state.designation) : null;
  const lines = firstArrivalLines(state?.displayName ?? "", meta?.label ?? null);

  // Frassy speaks the greeting, and falls back silently to text if voice fails.
  useEffect(() => {
    if (!state?.firstArrival || spoken.current || muted) return;
    spoken.current = true;
    void speakText(lines.join(" "), { owner: "first-arrival" }).catch(() => undefined);
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
        <Link
          to="/welcome-hall"
          className="lux-press inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)]"
        >
          Enter the Welcome Hall <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          to="/onboarding"
          className="lux-press rounded-sm border border-border px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.3em] hover:border-[color:var(--gold)]"
        >
          Sit down with Frassy
        </Link>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        In plain English: this page only ever happens once. Next time you sign in, you'll go
        straight back to your own work.
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-24">{children}</div>
    </main>
  );
}
