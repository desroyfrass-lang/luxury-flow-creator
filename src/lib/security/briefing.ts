// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0476 — Founder Daily Integration.
//
// The Founder should never have to remember to open the Security Center. Every
// morning the Daily says one sentence: what happened overnight, whether it
// matters, and whether anything needs a decision before work begins.
// ─────────────────────────────────────────────────────────────────────────────

import {
  groupByTier,
  securityScore,
  type HealthSignal,
  type TieredEvent,
} from "@/lib/security/triage";
import { isPaused, protectionHeadline, type ProtectionState } from "@/lib/platform-protection";

export type SecurityBriefing = {
  /** One sentence, said the way an assistant would say it. */
  sentence: string;
  /** True when the Founder genuinely needs to look before starting the day. */
  needsAttention: boolean;
  score: number;
  /** Where to go if they do. */
  href: string;
};

const HOURS_12 = 12 * 60 * 60 * 1000;

function healthPhrase(health: HealthSignal[]): string {
  if (!health.length) return "Platform health is steady";
  if (health.some((h) => h.state === "down")) return "Part of the platform is down";
  if (health.some((h) => h.state === "attention")) return "Platform health needs a look";
  return "Platform health is excellent";
}

/**
 * The morning security sentence.
 * @param events every alert the Founder can see, newest first.
 * @param health the Platform Health checks.
 * @param protection the Freeze Switch, so a frozen platform is never forgotten.
 */
export function securityBriefing(
  events: TieredEvent[],
  health: HealthSignal[] = [],
  protection?: ProtectionState,
  now = Date.now(),
): SecurityBriefing {
  const score = securityScore(events, health);
  const grouped = groupByTier(events);
  const overnight = events.filter((e) => now - Date.parse(e.created_at) <= HOURS_12);
  const overnightIds = new Set(overnight.map((e) => e.id));

  const openCritical = grouped.critical.filter(
    (e) => !e.review_status || e.review_status === "open" || e.review_status === "reviewing",
  );
  const openSuspicious = grouped.suspicious.filter(
    (e) => !e.review_status || e.review_status === "open" || e.review_status === "reviewing",
  );
  const settledOvernight = [...grouped.warning, ...grouped.information].filter(
    (e) => overnightIds.has(e.id) && (e.review_status === "resolved" || e.halted),
  );

  const parts: string[] = [`${healthPhrase(health)}.`, `Security score is ${score.score}/100.`];

  if (protection?.active) {
    parts.push(protectionHeadline(protection).replace(/^Platform Protection Mode is on\. /, "Platform Protection Mode is on — "));
  }

  if (settledOvernight.length) {
    const n = settledOvernight.length;
    parts.push(`${n} ${n === 1 ? "warning was" : "warnings were"} automatically resolved overnight.`);
  }

  let needsAttention = false;
  if (openCritical.length) {
    needsAttention = true;
    const n = openCritical.length;
    parts.push(
      `${n} critical ${n === 1 ? "event requires" : "events require"} your attention before we begin today's work.`,
    );
  } else if (openSuspicious.length) {
    needsAttention = true;
    const n = openSuspicious.length;
    const what = openSuspicious[0]?.rule?.toLowerCase() ?? "pattern";
    parts.push(
      n === 1
        ? `One suspicious ${what} requires your review before we begin today's work.`
        : `${n} suspicious patterns require your review before we begin today's work.`,
    );
  } else if (!settledOvernight.length && !protection?.active) {
    parts.push("No action required.");
  } else {
    parts.push("No critical events require your attention.");
  }

  if (protection && isPaused(protection, "payments")) needsAttention = true;

  return { sentence: parts.join(" "), needsAttention, score: score.score, href: "/admin/launch-feedback" };
}
