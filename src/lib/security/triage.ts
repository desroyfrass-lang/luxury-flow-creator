/**
 * FRASS-0475 — Security triage.
 *
 * A flat list of events is not intelligence. Every recorded event is sorted
 * into one of four tiers so the Founder can see at a glance whether something
 * needs attention now or is simply worth knowing.
 *
 * In plain English: this is the difference between a shop diary that says
 * "someone came in" and one that says "someone tried the safe three times".
 */

export type SecurityTier = "information" | "warning" | "suspicious" | "critical";

export type TieredEvent = {
  id: string;
  user_id: string | null;
  category: string;
  severity: string;
  rule: string;
  surface: string;
  attempted_value: number | null;
  allowed_min: number | null;
  allowed_max: number | null;
  enforced_value: number | null;
  halted: boolean;
  detail: string | null;
  plain_english: string | null;
  created_at: string;
  context?: Record<string, unknown> | null;
  review_status?: string | null;
  founder_note?: string | null;
  reviewed_at?: string | null;
};

export const TIERS: Array<{
  key: SecurityTier;
  label: string;
  dot: string;
  meaning: string;
  plainEnglish: string;
}> = [
  {
    key: "information",
    label: "Information",
    dot: "🟢",
    meaning: "Normal account activity worth a record — new device, password changed.",
    plainEnglish: "Nothing wrong. Just the diary of who did what.",
  },
  {
    key: "warning",
    label: "Warnings",
    dot: "🟡",
    meaning: "A rule was broken once and corrected — a coupon over its limit, an invalid rate.",
    plainEnglish: "Someone got a number wrong and Frass fixed it before it counted.",
  },
  {
    key: "suspicious",
    label: "Suspicious",
    dot: "🟠",
    meaning: "The same boundary was pushed repeatedly, or a payment was manipulated more than once.",
    plainEnglish: "Once is a mistake. Three times in a day is someone trying the handle.",
  },
  {
    key: "critical",
    label: "Critical",
    dot: "🔴",
    meaning: "Privilege escalation, a database policy violation, or unauthorised Founder access.",
    plainEnglish: "Somebody reached for a door that is not theirs. Look at this first.",
  },
];

export const TIER_INDEX: Record<SecurityTier, (typeof TIERS)[number]> = Object.fromEntries(
  TIERS.map((t) => [t.key, t]),
) as Record<SecurityTier, (typeof TIERS)[number]>;

/** Categories that are always critical, whatever the stored severity says. */
const CRITICAL_CATEGORIES = new Set(["privilege", "access", "policy", "escalation"]);

/** Categories that are never more than a note. */
const INFORMATIONAL_CATEGORIES = new Set(["account", "session", "device", "audit"]);

const REPEAT_WINDOW_MS = 24 * 60 * 60 * 1000;
const REPEAT_THRESHOLD = 3;

/**
 * Sort one event into a tier, using the whole set for repetition context.
 * Repetition is what turns a warning into something suspicious.
 */
export function tierOf(event: TieredEvent, all: TieredEvent[]): SecurityTier {
  const category = (event.category ?? "").toLowerCase();
  if (CRITICAL_CATEGORIES.has(category) || event.severity === "critical") return "critical";
  if (INFORMATIONAL_CATEGORIES.has(category) || event.severity === "info") return "information";

  const at = new Date(event.created_at).getTime();
  const repeats = all.filter(
    (e) =>
      e.rule === event.rule &&
      e.user_id === event.user_id &&
      Math.abs(new Date(e.created_at).getTime() - at) <= REPEAT_WINDOW_MS,
  ).length;

  if (repeats >= REPEAT_THRESHOLD) return "suspicious";
  return event.halted ? "suspicious" : "warning";
}

export function groupByTier(events: TieredEvent[]): Record<SecurityTier, TieredEvent[]> {
  const out: Record<SecurityTier, TieredEvent[]> = {
    critical: [],
    suspicious: [],
    warning: [],
    information: [],
  };
  for (const e of events) out[tierOf(e, events)].push(e);
  return out;
}

/** The one-line headline a Founder should read before anything else. */
export function triageHeadline(grouped: Record<SecurityTier, TieredEvent[]>): string {
  if (grouped.critical.length)
    return `${grouped.critical.length} critical event${grouped.critical.length === 1 ? "" : "s"} need your eyes now.`;
  if (grouped.suspicious.length)
    return `${grouped.suspicious.length} suspicious pattern${grouped.suspicious.length === 1 ? "" : "s"} — the same limit was pushed more than once.`;
  if (grouped.warning.length)
    return `${grouped.warning.length} rule${grouped.warning.length === 1 ? " was" : "s were"} broken and corrected. Nothing got through.`;
  return "Nothing has been refused. Every financial value has arrived inside its written limit.";
}
