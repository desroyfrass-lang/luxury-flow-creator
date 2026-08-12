// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0475 — the one startup process every Frassy-enabled page runs.
//
// Mounted inside the single shared chat component, so no page can opt out and
// no page can invent its own version. It performs the constitutional sequence:
//
//   load → verify (layout · chat · voice · auth · context) → only then greet
//
// plus the layout watchdog (repairs a distorted interface in place, never a
// refresh) and the silence rule (within 3 seconds Frassy has either spoken or
// explained why she cannot).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { resolveDestination } from "@/lib/frassy-destinations";
import { speakText } from "@/lib/voice/speech-manager";
import { speakWithGuarantee } from "@/lib/frassy/speak-guarantee";
import {
  decidePresence,
  hasNudged,
  hasVisited,
  markNudged,
  markVisited,
  type PresenceState,
} from "@/lib/frassy/presence";
import { markNudgeOffered } from "@/lib/frassy/working-style";
import { getVoiceTier, subscribeVoiceTier, type VoiceTier } from "@/lib/voice/voice-tier";
import {
  FAULT_LABELS,
  SILENCE_LIMIT_MS,
  VOICE_FALLBACK_MESSAGE,
  evaluateReadiness,
  inspectLayout,
  isRepairable,
  repairSize,
  type LayoutFault,
  type ReadinessChecks,
} from "@/lib/frassy/startup";

export type FrassyStartupState = {
  /** Where the startup sequence has got to. */
  phase: "verifying" | "ready" | "greeted" | "recovering";
  /** Which readiness checks are still outstanding. */
  missing: string[];
  /** The greeting Frassy has for this destination, once she is allowed to give it. */
  greeting: string | null;
  /** A plain-English line shown when voice could not start. Never silence. */
  notice: string | null;
  /** Layout faults found by the watchdog on the most recent sweep. */
  faults: LayoutFault[];
  /** How many times the watchdog has rebuilt the shared layout. */
  repairs: number;
  /** Gesture-safe recovery: enabling voice always speaks or explains why it cannot. */
  speakGreetingNow: () => Promise<void>;
  /** FRASS-0477 — arrival / returning / working / idle. */
  presence: PresenceState;
  /** Which voice she is currently using: cloud, device or text only. */
  voiceTier: VoiceTier;
};

export function useFrassyStartup(opts: {
  panelRef: React.RefObject<HTMLDivElement | null>;
  embedded: boolean;
  /** False while the surface is closed — startup pauses rather than fails. */
  active: boolean;
  /** Page context resolved (who the member is, where they are). */
  contextReady: boolean;
  /** Only member-only surfaces require a verified session. */
  requiresAuth?: boolean;
  authReady?: boolean;
  /** Muted members get the words, never the voice. */
  speechAllowed: boolean;
  /** Focus Mode — task, progress, completion and emergencies only. */
  focusMode?: boolean;
}): FrassyStartupState {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [phase, setPhase] = useState<FrassyStartupState["phase"]>("verifying");
  const [missing, setMissing] = useState<string[]>([]);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [faults, setFaults] = useState<LayoutFault[]>([]);
  const [repairs, setRepairs] = useState(0);
  const startedAt = useRef(Date.now());
  const handled = useRef<string | null>(null);
  const [presence, setPresence] = useState<PresenceState>("arrival");
  const [voiceTier, setVoiceTierState] = useState<VoiceTier>(getVoiceTier());
  const lastActivity = useRef(Date.now());
  const interacted = useRef(false);

  useEffect(() => subscribeVoiceTier(() => setVoiceTierState(getVoiceTier())), []);

  // ── Presence: is the member working, or has the room gone quiet? ───────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mark = () => {
      lastActivity.current = Date.now();
      interacted.current = true;
    };
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    for (const e of events) window.addEventListener(e, mark, { passive: true });
    return () => {
      for (const e of events) window.removeEventListener(e, mark);
    };
  }, []);

  // She waits while they work; after several quiet minutes she offers once.
  useEffect(() => {
    if (!opts.active || typeof window === "undefined") return;
    const dest = resolveDestination(pathname);
    const roomId = dest?.id ?? "frass";
    const timer = window.setInterval(() => {
      const decision = decidePresence(
        {
          visited: true,
          focusMode: Boolean(opts.focusMode),
          interacted: interacted.current,
          idleMs: Date.now() - lastActivity.current,
          nudged: hasNudged(roomId),
        },
        dest?.welcome ?? "",
      );
      if (decision.state === "idle" && decision.line) {
        markNudged(roomId);
        // FRASS-0478 — the offer is now open; how they answer teaches her
        // whether reminders are welcome for this person.
        markNudgeOffered();
        setPresence("idle");
        setNotice(decision.line);
      } else if (decision.state === "working") {
        setPresence("working");
      }
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [opts.active, opts.focusMode, pathname]);

  const speakGreetingNow = useCallback(async () => {
    const dest = resolveDestination(pathname);
    if (!dest) {
      setNotice("Voice is ready. Ask me anything and I'll answer out loud.");
      return;
    }
    const line = hasVisited(dest.id) ? "Welcome back." : dest.welcome;
    markVisited(dest.id);
    setGreeting(line);
    setNotice(null);
    const { notice: voiceNotice } = await speakWithGuarantee(line, {
      owner: "frassy-voice-toggle",
    });
    setNotice(voiceNotice);
    setPhase("greeted");
  }, [pathname]);

  // ── Layout watchdog ────────────────────────────────────────────────────────
  const sweep = useCallback(() => {
    const panel = opts.panelRef.current;
    if (!panel || typeof window === "undefined") return false;
    const rect = panel.getBoundingClientRect();
    const composer = panel.querySelector<HTMLElement>("[data-frassy-composer]");
    const toolbar = panel.querySelector<HTMLElement>("[data-frassy-toolbar]");
    const voiceCtl = panel.querySelector<HTMLElement>("[data-frassy-voice]");
    const transcript = panel.querySelector<HTMLElement>("[data-frassy-transcript]");

    const found = inspectLayout({
      width: rect.width,
      height: rect.height,
      composerHeight: composer?.getBoundingClientRect().height ?? 0,
      hasToolbar: Boolean(toolbar),
      hasVoiceControls: Boolean(voiceCtl),
      transcriptHeight: transcript?.getBoundingClientRect().height ?? 0,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });

    setFaults((prev) =>
      prev.length === found.length && prev.every((f, i) => f === found[i]) ? prev : found,
    );

    const repairable = found.filter(isRepairable);
    if (repairable.length) {
      const size = repairSize(
        { width: window.innerWidth, height: window.innerHeight },
        opts.embedded ? "embedded" : "floating",
      );
      // Rebuild the shared layout in place — no refresh, no broken interface.
      panel.style.width = opts.embedded ? "100%" : `${size.width}px`;
      panel.style.height = `${size.height}px`;
      panel.style.maxHeight = `${window.innerHeight}px`;
      panel.style.maxWidth = `${window.innerWidth}px`;
      panel.dataset["frassyRepaired"] = "1";
      setRepairs((n) => n + 1);
      return true;
    }
    return false;
  }, [opts.embedded, opts.panelRef]);

  useEffect(() => {
    if (!opts.active || typeof window === "undefined") return;
    let stop = false;
    // Sweep on paint, then keep watching for the first ten seconds and on every
    // resize / orientation change for as long as Frassy is on screen.
    const tick = () => {
      if (!stop) sweep();
    };
    const raf = requestAnimationFrame(tick);
    const interval = window.setInterval(tick, 1000);
    const settle = window.setTimeout(() => window.clearInterval(interval), 10_000);
    window.addEventListener("resize", tick);
    window.addEventListener("orientationchange", tick);
    const ro = new ResizeObserver(tick);
    if (opts.panelRef.current) ro.observe(opts.panelRef.current);
    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      window.clearInterval(interval);
      window.clearTimeout(settle);
      window.removeEventListener("resize", tick);
      window.removeEventListener("orientationchange", tick);
      ro.disconnect();
    };
  }, [opts.active, opts.panelRef, sweep]);

  // ── Readiness + greeting guarantee ─────────────────────────────────────────
  useEffect(() => {
    if (!opts.active || typeof window === "undefined") return;
    const dest = resolveDestination(pathname);
    const key = dest?.id ?? "frass";
    if (handled.current === key) return;

    startedAt.current = Date.now();
    let cancelled = false;
    let settled = false;

    // The silence rule: three seconds, then Frassy explains herself in words.
    const silenceTimer = window.setTimeout(() => {
      if (cancelled || settled) return;
      settled = true;
      setNotice(VOICE_FALLBACK_MESSAGE);
      setPhase("greeted");
    }, SILENCE_LIMIT_MS);

    const run = async () => {
      // Step 2 — verify before anything is said.
      const checks: ReadinessChecks = {
        layout: Boolean(opts.panelRef.current),
        chat: Boolean(opts.panelRef.current?.querySelector("[data-frassy-composer]")),
        voice: typeof speakText === "function",
        auth: Boolean(opts.authReady),
        context: opts.contextReady,
      };
      const verdict = evaluateReadiness(checks, { requiresAuth: opts.requiresAuth ?? false });
      setMissing(verdict.missing.map((m) => m));
      if (!verdict.ready) {
        setPhase("verifying");
        return; // re-runs as the dependencies settle
      }

      // Repair anything distorted before she is seen or heard.
      sweep();
      handled.current = key;
      setPhase("ready");

      if (!dest) {
        settled = true;
        window.clearTimeout(silenceTimer);
        setPhase("greeted");
        return;
      }

      // FRASS-0477 — presence decides *whether* and *what*: the full welcome on
      // first arrival, a short "Welcome back." on return, quiet while working.
      const decision = decidePresence(
        {
          visited: hasVisited(key),
          focusMode: Boolean(opts.focusMode),
          interacted: interacted.current,
          idleMs: Date.now() - lastActivity.current,
          nudged: hasNudged(key),
        },
        dest.welcome,
      );
      markVisited(key);
      setPresence(decision.state);

      if (!decision.line) {
        settled = true;
        window.clearTimeout(silenceTimer);
        setPhase("greeted");
        return;
      }

      // Step 3 — the greeting. Words first, so silence is impossible.
      setGreeting(decision.line);
      setPhase("greeted");

      if (!opts.speechAllowed || !decision.speak) {
        settled = true;
        window.clearTimeout(silenceTimer);
        return;
      }

      const { notice: voiceNotice } = await speakWithGuarantee(decision.line, {
        owner: "frassy-startup",
      });
      if (cancelled) return;
      settled = true;
      window.clearTimeout(silenceTimer);
      setNotice(voiceNotice);
    };

    void run();
    return () => {
      cancelled = true;
      window.clearTimeout(silenceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pathname,
    opts.active,
    opts.contextReady,
    opts.authReady,
    opts.requiresAuth,
    opts.speechAllowed,
    opts.focusMode,
  ]);

  return {
    phase,
    missing,
    greeting,
    notice,
    faults,
    repairs,
    speakGreetingNow,
    presence,
    voiceTier,
  };
}

export { FAULT_LABELS };
