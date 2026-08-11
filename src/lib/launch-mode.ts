// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0462 — Partner Launch Mode
//
// Frass is in Pre-Launch Mode. Payments are intentionally switched off by the
// Founder until launch day. Nothing is broken — every Money Move made now is
// building the machine so launch day is "turning on the lights", not starting
// from scratch.
//
// State lives in the existing `launch_program_settings` row `platform_launch`
// (enabled = payments live, notice = ISO launch date). No new tables.
// ─────────────────────────────────────────────────────────────────────────────

import { businessReadiness, type LaunchState } from "./business/accelerator";
import { foundationPct, type ProgramState } from "./business/launch-program";
import { INCOME_STREAMS, type IncomeStream, type MoneyState } from "./business/money-moves";

export const LAUNCH_SETTINGS_ID = "platform_launch";

export type LaunchMode = {
  /** True once the Founder switches payments on. Pre-Launch Mode ends automatically. */
  paymentsLive: boolean;
  /** ISO date (YYYY-MM-DD) of the official launch, when the Founder has set one. */
  launchDate: string | null;
};

export const DEFAULT_LAUNCH_MODE: LaunchMode = { paymentsLive: false, launchDate: null };

export function daysUntilLaunch(mode: LaunchMode, today = new Date().toISOString().slice(0, 10)): number | null {
  if (!mode.launchDate) return null;
  return Math.max(0, Math.round((Date.parse(mode.launchDate) - Date.parse(today)) / 86400000));
}

/** The line Frassy opens with each morning. Purposeful, never pressuring. */
export function launchGreeting(name: string, mode: LaunchMode): string {
  if (mode.paymentsLive) return `Good morning, ${name}. We're live — today we're earning.`;
  const d = daysUntilLaunch(mode);
  if (d === null) return `Good morning, ${name}. Today we're building tomorrow's income.`;
  if (d === 0) return `Good morning, ${name}. Today we go live.`;
  if (d === 1) return `Good morning, ${name}. Tomorrow we go live.`;
  return `Good morning, ${name}. We're ${d} day${d === 1 ? "" : "s"} from launch. Today we're building tomorrow's income.`;
}

export function launchBannerCopy(mode: LaunchMode): { title: string; lines: string[] } | null {
  if (mode.paymentsLive) return null;
  const d = daysUntilLaunch(mode);
  return {
    title: d === null ? "🚀 Pre-Launch Mode" : d === 0 ? "🚀 Launch Day" : `🚀 Pre-Launch Mode · ${d} days to launch`,
    lines: [
      "Your businesses are being prepared for launch.",
      "Payment processing will activate when Frass officially launches.",
      "Until then, Frassy will help you build everything needed so you're ready to earn from Day One.",
    ],
  };
}

/** What a payment surface says while payments are intentionally off. */
export function paymentLabel(mode: LaunchMode, live: string): string {
  return mode.paymentsLive ? live : "Available at Launch";
}

// ── Launch preparation checklist ────────────────────────────────────────────
// The Founder Principle, made checkable. Everything here must be true before
// launch day so nobody begins building on the morning they should be earning.

export type LaunchPrepTask = { id: string; label: string; why: string; href?: string };

export const LAUNCH_PREP: LaunchPrepTask[] = [
  { id: "card", label: "A completed Frass Card", why: "Your identity, storefront and payment surface in one link.", href: "/workspace/card" },
  { id: "for-me", label: "A configured FOR ME page", why: "The page that turns a visitor into someone who knows you.", href: "/for-me" },
  { id: "vaults", label: "Organized Business Vaults", why: "Every asset findable the moment you need it.", href: "/vault" },
  { id: "content", label: "Content ready to publish", why: "Launch week needs a queue, not a blank page.", href: "/studio" },
  { id: "campaigns", label: "Affiliate campaigns prepared", why: "Links, offers and tracking live from hour one.", href: "/affiliate" },
  { id: "branding", label: "Branding completed", why: "Consistent look means people remember you.", href: "/studio" },
  { id: "assets", label: "Marketing assets ready", why: "Covers, thumbnails, product photos — made before you need them." },
  { id: "strategy", label: "A clear business strategy", why: "You know what you sell, to whom, and at what price.", href: "/business-builder" },
  { id: "habits", label: "Daily habits established", why: "Consistency is the only thing that compounds." },
];

export function launchPrepPct(money: MoneyState): number {
  const done = (money.launchPrep ?? []).length;
  return Math.round((Math.min(done, LAUNCH_PREP.length) / LAUNCH_PREP.length) * 100);
}

// ── Launch readiness per business ───────────────────────────────────────────
// Honest: it's built from real progress, real setup and real preparation.

export type StreamReadiness = {
  stream: IncomeStream;
  pct: number;
  parts: { label: string; pct: number }[];
};

export function streamLaunchReadiness(
  stream: IncomeStream,
  state: LaunchState,
  program: ProgramState,
  money: MoneyState,
): StreamReadiness {
  const build = businessReadiness(state, stream.id);
  const setup = foundationPct(program);
  const prep = launchPrepPct(money);
  const pct = Math.round(build * 0.6 + setup * 0.2 + prep * 0.2);
  return {
    stream,
    pct: Math.min(100, pct),
    parts: [
      { label: "Business built", pct: build },
      { label: "Foundation set up", pct: setup },
      { label: "Launch preparation", pct: prep },
    ],
  };
}

export function allStreamReadiness(
  state: LaunchState,
  program: ProgramState,
  money: MoneyState,
): StreamReadiness[] {
  const ids = new Set(state.businesses);
  return INCOME_STREAMS.filter((s) => ids.size === 0 || ids.has(s.id))
    .map((s) => streamLaunchReadiness(s, state, program, money))
    .sort((a, b) => b.pct - a.pct);
}

export function overallReadiness(rows: StreamReadiness[]): number {
  if (!rows.length) return 0;
  return Math.round(rows.reduce((n, r) => n + r.pct, 0) / rows.length);
}

// ── Founder coaching attached to real progress ──────────────────────────────

export type CoachingNote = {
  id: string;
  at: string;
  /** What the note is attached to — a milestone, stream or move label. */
  about: string;
  text: string;
  /** True once the partner has seen it. */
  seen?: boolean;
};

export function normalizeCoaching(raw: unknown): CoachingNote[] {
  return Array.isArray(raw) ? (raw as CoachingNote[]) : [];
}
