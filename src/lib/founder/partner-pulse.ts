// ─────────────────────────────────────────────────────────────────────────────
// Founder Daily Amendment — Partner Progress Center + Legacy Dashboard.
//
// A Founder should never have to ask "how is everyone doing?". Frassy answers
// it every morning, inside the Founder's own Daily — not inside anyone else's.
//
// This file only interprets data that already exists (partner_launch_state via
// listPartnerLaunchStates). It creates no second source of truth (FRASS-0494).
// ─────────────────────────────────────────────────────────────────────────────

import { normalizeState, type LaunchState } from "@/lib/business/accelerator";
import { normalizeProgram, programDay } from "@/lib/business/launch-program";
import { normalizeMoney, type MoneyState } from "@/lib/business/money-moves";
import { allStreamReadiness, overallReadiness } from "@/lib/launch-mode";

export type PulseTone = "green" | "amber" | "red";

export type PartnerPulse = {
  userId: string;
  name: string;
  tone: PulseTone;
  toneLabel: string;
  readiness: number;
  day: number;
  daysQuiet: number;
  today: string[];
  tomorrow: string;
  focus: string;
};

export type PartnerOverview = {
  total: number;
  green: number;
  amber: number;
  red: number;
  sentence: string;
};

type Row = {
  user_id: string;
  display_name: string | null;
  email: string | null;
  updated_at: string | null;
  state: unknown;
};

function daysSince(iso: string | null): number {
  if (!iso) return 99;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 99;
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
}

export function pulseFor(row: Row, today: string): PartnerPulse {
  const raw = (row.state ?? {}) as Record<string, unknown>;
  const launch: LaunchState = normalizeState(raw);
  const program = normalizeProgram(raw["program"]);
  const money: MoneyState = normalizeMoney(raw["money"]);
  const readinessRows = allStreamReadiness(launch, program, money);
  const readiness = overallReadiness(readinessRows);
  const quiet = daysSince(row.updated_at);
  const doneToday = money.assigned[today] ?? [];

  const tone: PulseTone = quiet >= 5 ? "red" : quiet >= 2 || readiness < 20 ? "amber" : "green";
  const toneLabel =
    tone === "green" ? "On track" : tone === "amber" ? "Could use encouragement" : "Needs you";

  const focusRow = readinessRows.find((r) => r.pct < 100) ?? readinessRows[0];
  const focus = focusRow ? `${focusRow.stream.emoji} ${focusRow.stream.label}` : "Getting started";

  const today_: string[] = [];
  if (doneToday.length) today_.push(`${doneToday.length} Money Move${doneToday.length === 1 ? "" : "s"} completed`);
  if (launch.activeDays.includes(today)) today_.push("Showed up today");
  if (!today_.length) today_.push("No activity recorded yet today");

  return {
    userId: row.user_id,
    name: row.display_name ?? row.email ?? "Partner",
    tone,
    toneLabel,
    readiness,
    day: programDay(program),
    daysQuiet: quiet,
    today: today_,
    tomorrow: focusRow ? `Continue ${focusRow.stream.label}` : "Choose a first business",
    focus,
  };
}

export function overviewOf(pulses: PartnerPulse[]): PartnerOverview {
  const green = pulses.filter((p) => p.tone === "green").length;
  const amber = pulses.filter((p) => p.tone === "amber").length;
  const red = pulses.filter((p) => p.tone === "red").length;
  const sentence = !pulses.length
    ? "No partners have started yet. The first one is the one that matters most."
    : red
      ? `${red} partner${red === 1 ? "" : "s"} need${red === 1 ? "s" : ""} you today. Everyone else is moving.`
      : amber
        ? `Everyone is safe. ${amber} could use a word of encouragement.`
        : "Everyone is progressing well. Nothing needs you this morning.";
  return { total: pulses.length, green, amber, red, sentence };
}

export type AttentionItem = { id: string; icon: string; text: string; tone: PulseTone };

/** Only meaningful events surface. Silence is a valid morning. */
export function attentionQueue(pulses: PartnerPulse[]): AttentionItem[] {
  const items: AttentionItem[] = [];
  for (const p of pulses) {
    if (p.daysQuiet >= 5) {
      items.push({
        id: `${p.userId}-quiet`,
        icon: "🚨",
        text: `${p.name} hasn't logged in for ${p.daysQuiet} days.`,
        tone: "red",
      });
    } else if (p.readiness >= 100) {
      items.push({
        id: `${p.userId}-ready`,
        icon: "🎉",
        text: `${p.name} is fully launch-ready and needs your approval.`,
        tone: "green",
      });
    } else if (p.daysQuiet >= 2) {
      items.push({
        id: `${p.userId}-slow`,
        icon: "💬",
        text: `${p.name} has been quiet for ${p.daysQuiet} days — a message would help.`,
        tone: "amber",
      });
    }
  }
  return items;
}

export type WeeklyReport = {
  ready: boolean;
  lines: { label: string; value: string }[];
  note: string;
};

/** Every Sunday morning, the whole ecosystem in one place. */
export function weeklyReport(pulses: PartnerPulse[], date = new Date()): WeeklyReport {
  const moves = pulses.reduce((n, p) => n + (p.today[0]?.startsWith("No") ? 0 : 1), 0);
  return {
    ready: date.getDay() === 0,
    lines: [
      { label: "Active partners", value: String(pulses.length) },
      { label: "Partners progressing well", value: String(pulses.filter((p) => p.tone === "green").length) },
      { label: "Partners needing help", value: String(pulses.filter((p) => p.tone !== "green").length) },
      { label: "Money Moves completed today", value: String(moves) },
      {
        label: "Average launch readiness",
        value: pulses.length
          ? `${Math.round(pulses.reduce((n, p) => n + p.readiness, 0) / pulses.length)}%`
          : "—",
      },
    ],
    note: "Income, products published and new customers appear here as soon as real records exist. Nothing is invented.",
  };
}

// ── Legacy Dashboard — the Founder's only private widget ────────────────────

export type LegacyMetric = { id: string; emoji: string; label: string; value: number };

export const LEGACY_PROMISE =
  "This doesn't measure money. It measures lives changed.";

export function legacyMetrics(pulses: PartnerPulse[]): LegacyMetric[] {
  const launched = pulses.filter((p) => p.readiness >= 100).length;
  return [
    { id: "businesses", emoji: "💼", label: "Businesses launched", value: launched },
    { id: "incomes", emoji: "💰", label: "Employment incomes replaced", value: 0 },
    { id: "families", emoji: "👨‍👩‍👧", label: "Families supported", value: pulses.length },
    { id: "countries", emoji: "🌍", label: "Countries reached", value: 0 },
    { id: "creative", emoji: "🎨", label: "Creative works monetized", value: 0 },
    { id: "freight", emoji: "📦", label: "Freight shipments completed", value: 0 },
    { id: "freedom", emoji: "❤️", label: "Members achieving financial freedom", value: 0 },
  ];
}
