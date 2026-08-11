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

/* ───────────────────────────────────────────────────────────────────────────
 * FRASS-0474 v2 — Operational intelligence.
 * Score, timeline, geography and the quiet-mode rule that decides whether the
 * Founder is interrupted at all.
 * ─────────────────────────────────────────────────────────────────────────── */

export type HealthSignal = { key: string; state: "healthy" | "attention" | "down" | "standby" };

export type SecurityScore = {
  score: number;
  grade: "Excellent" | "Good" | "Watchful" | "At risk";
  tone: "good" | "warn" | "bad";
  summary: string;
  plainEnglish: string;
  deductions: Array<{ label: string; points: number }>;
};

const OPEN = (e: TieredEvent) => (e.review_status ?? "open") === "open";

/**
 * One number, computed from real signals — never guessed.
 * Critical events, unresolved warnings, repeated auth/access attempts,
 * payment integrity, email health and database health.
 */
export function securityScore(events: TieredEvent[], health: HealthSignal[] = []): SecurityScore {
  const grouped = groupByTier(events);
  const deductions: Array<{ label: string; points: number }> = [];
  const take = (label: string, points: number) => {
    if (points > 0) deductions.push({ label, points: Math.round(points) });
  };

  const openCritical = grouped.critical.filter(OPEN).length;
  const openSuspicious = grouped.suspicious.filter(OPEN).length;
  const openWarning = grouped.warning.filter(OPEN).length;

  take("Unresolved critical events", Math.min(60, openCritical * 20));
  take("Suspicious patterns still open", Math.min(20, openSuspicious * 5));
  take("Warnings not yet reviewed", Math.min(10, openWarning * 1));

  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const authSpike = events.filter(
    (e) =>
      new Date(e.created_at).getTime() >= dayAgo &&
      ["access", "session", "privilege", "account"].includes((e.category ?? "").toLowerCase()),
  ).length;
  if (authSpike >= 5) take("Failed authentication spike (24h)", Math.min(15, authSpike));

  const paymentTrouble = events.filter(
    (e) =>
      new Date(e.created_at).getTime() >= dayAgo &&
      /pay|price|commission|coupon|receipt|credit/i.test(`${e.rule} ${e.surface}`),
  ).length;
  if (paymentTrouble >= 3) take("Payment values refused repeatedly", Math.min(10, paymentTrouble));

  const stateOf = (key: string) => health.find((h) => h.key === key)?.state;
  if (stateOf("email") === "attention") take("Email delivery wobbling", 4);
  if (stateOf("email") === "down") take("Email delivery failing", 12);
  if (stateOf("database") === "attention") take("Database slow to answer", 8);
  if (stateOf("database") === "down") take("Database not answering", 30);

  const score = Math.max(0, Math.min(100, 100 - deductions.reduce((s, d) => s + d.points, 0)));
  const grade: SecurityScore["grade"] =
    score >= 95 ? "Excellent" : score >= 85 ? "Good" : score >= 65 ? "Watchful" : "At risk";
  const tone: SecurityScore["tone"] = score >= 85 ? "good" : score >= 65 ? "warn" : "bad";

  return {
    score,
    grade,
    tone,
    summary:
      score >= 95
        ? "Frass is healthy. Nothing is asking for you."
        : deductions[0]
          ? `Biggest drag: ${deductions[0].label.toLowerCase()}.`
          : "Holding steady.",
    plainEnglish:
      "One number for the whole building. It falls when something is genuinely wrong and climbs back as you clear it — nothing here is a guess.",
    deductions,
  };
}

/* ── Threat timeline ────────────────────────────────────────────────────── */

export type TimelineBucket = {
  key: "today" | "yesterday" | "week" | "month";
  label: string;
  counts: Record<SecurityTier, number>;
  total: number;
};

export function threatTimeline(events: TieredEvent[]): TimelineBucket[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86_400_000;
  const weekAgo = now.getTime() - 7 * 86_400_000;
  const monthAgo = now.getTime() - 30 * 86_400_000;

  const empty = (): Record<SecurityTier, number> => ({
    critical: 0,
    suspicious: 0,
    warning: 0,
    information: 0,
  });

  const buckets: TimelineBucket[] = [
    { key: "today", label: "Today", counts: empty(), total: 0 },
    { key: "yesterday", label: "Yesterday", counts: empty(), total: 0 },
    { key: "week", label: "This week", counts: empty(), total: 0 },
    { key: "month", label: "Last 30 days", counts: empty(), total: 0 },
  ];

  for (const e of events) {
    const t = new Date(e.created_at).getTime();
    const tier = tierOf(e, events);
    const add = (k: TimelineBucket["key"]) => {
      const b = buckets.find((x) => x.key === k)!;
      b.counts[tier] += 1;
      b.total += 1;
    };
    if (t >= startOfToday) add("today");
    else if (t >= startOfYesterday) add("yesterday");
    if (t >= weekAgo) add("week");
    if (t >= monthAgo) add("month");
  }

  return buckets;
}

/** Is the trend getting worse? Compares this week with the week before. */
export function trendLine(events: TieredEvent[]): string {
  const now = Date.now();
  const thisWeek = events.filter((e) => new Date(e.created_at).getTime() >= now - 7 * 86_400_000).length;
  const lastWeek = events.filter((e) => {
    const t = new Date(e.created_at).getTime();
    return t < now - 7 * 86_400_000 && t >= now - 14 * 86_400_000;
  }).length;
  if (thisWeek === 0 && lastWeek === 0) return "Two quiet weeks in a row.";
  if (lastWeek === 0) return `${thisWeek} event${thisWeek === 1 ? "" : "s"} this week after a silent one.`;
  const delta = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  if (delta > 25) return `Up ${delta}% on last week — worth a look.`;
  if (delta < -25) return `Down ${Math.abs(delta)}% on last week. Settling.`;
  return "Roughly level with last week.";
}

/* ── Geographic awareness ───────────────────────────────────────────────── */

export type GeoRow = { country: string; count: number; share: number };

const COUNTRY_KEYS = ["country", "country_name", "geo_country", "cf_country", "region_country"];

export function countryOf(event: TieredEvent): string {
  const ctx = (event.context ?? {}) as Record<string, unknown>;
  for (const k of COUNTRY_KEYS) {
    const v = ctx[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const geo = ctx["geo"];
  if (geo && typeof geo === "object") {
    const g = geo as Record<string, unknown>;
    for (const k of ["country", "country_name", "name"]) {
      const v = g[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return "Unknown";
}

/** Where suspicious activity is coming from — country level only, never addresses. */
export function geography(events: TieredEvent[]): GeoRow[] {
  const notable = events.filter((e) => {
    const tier = tierOf(e, events);
    return tier === "critical" || tier === "suspicious";
  });
  const source = notable.length ? notable : events;
  const map = new Map<string, number>();
  for (const e of source) map.set(countryOf(e), (map.get(countryOf(e)) ?? 0) + 1);
  const total = source.length || 1;
  return [...map.entries()]
    .map(([country, count]) => ({ country, count, share: count / total }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

/* ── Quiet mode ─────────────────────────────────────────────────────────── */

export type QuietVerdict = {
  notify: boolean;
  reason: string;
  plainEnglish: string;
};

/**
 * The Founder should be building, not watching dashboards. Interrupt only for
 * a critical event, suspicious activity crossing a threshold, or a sudden spike
 * of a recurring rule.
 */
export function quietModeVerdict(events: TieredEvent[]): QuietVerdict {
  const dayAgo = Date.now() - 86_400_000;
  const recent = events.filter((e) => new Date(e.created_at).getTime() >= dayAgo);
  const grouped = groupByTier(recent);

  const openCritical = grouped.critical.filter(OPEN);
  if (openCritical.length)
    return {
      notify: true,
      reason: `${openCritical.length} critical event${openCritical.length === 1 ? "" : "s"} in the last 24 hours.`,
      plainEnglish: "This is the kind of thing worth stopping your work for.",
    };

  if (grouped.suspicious.filter(OPEN).length >= 3)
    return {
      notify: true,
      reason: "Suspicious activity crossed the threshold (3+ in 24 hours).",
      plainEnglish: "Someone is trying the same handle over and over.",
    };

  // Sudden spike: one rule firing far more today than its recent daily average.
  const byRule = new Map<string, number>();
  for (const e of recent) byRule.set(e.rule, (byRule.get(e.rule) ?? 0) + 1);
  const monthAgo = Date.now() - 30 * 86_400_000;
  for (const [rule, todayCount] of byRule) {
    const priorDaily =
      events.filter((e) => {
        const t = new Date(e.created_at).getTime();
        return e.rule === rule && t < dayAgo && t >= monthAgo;
      }).length / 29;
    if (todayCount >= 5 && todayCount > Math.max(3, priorDaily * 4))
      return {
        notify: true,
        reason: `"${rule}" spiked to ${todayCount} today, far above its usual rate.`,
        plainEnglish: "A quiet rule suddenly got loud. That change is the signal.",
      };
  }

  return {
    notify: false,
    reason: "Nothing crossed the notify threshold. Everything else is being watched quietly.",
    plainEnglish:
      "Frass is still recording every small thing — it just isn't going to tap you on the shoulder for it.",
  };
}

/* ── Export ─────────────────────────────────────────────────────────────── */

export function toCsv(events: TieredEvent[]): string {
  const head = [
    "created_at",
    "tier",
    "review_status",
    "category",
    "severity",
    "rule",
    "surface",
    "country",
    "halted",
    "attempted_value",
    "allowed_min",
    "allowed_max",
    "enforced_value",
    "detail",
    "plain_english",
    "founder_note",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = events.map((e) =>
    [
      e.created_at,
      tierOf(e, events),
      e.review_status ?? "open",
      e.category,
      e.severity,
      e.rule,
      e.surface,
      countryOf(e),
      e.halted,
      e.attempted_value,
      e.allowed_min,
      e.allowed_max,
      e.enforced_value,
      e.detail,
      e.plain_english,
      e.founder_note,
    ]
      .map(esc)
      .join(","),
  );
  return [head.join(","), ...lines].join("\n");
}
