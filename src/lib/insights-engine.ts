// Builder Insights — pattern engine (A-05 Part 3).
// Pure, deterministic, browser-safe. Given a Builder's artifacts it derives
// pattern-based insights and always names the connected artifacts behind them.

export type ArtifactType =
  | "slogan"
  | "logo"
  | "proposal"
  | "look"
  | "note"
  | "link"
  | "order";

export type Artifact = {
  id: string;
  type: ArtifactType;
  label: string;
  sublabel?: string;
  createdAt: string;
  /** Free-form signals used by the pattern rules. */
  meta?: Record<string, string | number | boolean | null | undefined>;
};

export type InsightKind =
  | "signature"
  | "momentum"
  | "focus"
  | "craft"
  | "opportunity"
  | "reach"
  | "cadence";

export type Insight = {
  id: string;
  kind: InsightKind;
  title: string;
  narrative: string;
  /** 0–1 confidence in the pattern, from evidence volume + consistency. */
  strength: number;
  evidence: string;
  artifacts: Artifact[];
};

export const INSIGHT_LABELS: Record<InsightKind, string> = {
  signature: "Signature Pattern",
  momentum: "Momentum",
  focus: "Focus Area",
  craft: "Craft Standard",
  opportunity: "Opportunity",
  reach: "Reach",
  cadence: "Rhythm",
};

const ARTIFACT_LABELS: Record<ArtifactType, string> = {
  slogan: "Slogan",
  logo: "Logo Treatment",
  proposal: "Merch Proposal",
  look: "Try-On Look",
  note: "Note",
  link: "Affiliate Link",
  order: "Order",
};

export function artifactTypeLabel(t: ArtifactType): string {
  return ARTIFACT_LABELS[t];
}

const newest = (a: Artifact, b: Artifact) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

function tally<T extends string>(values: T[]): Array<[T, number]> {
  const counts = new Map<T, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const pct = (n: number) => `${Math.round(n * 100)}%`;

const titleize = (s: string) =>
  s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Derive pattern-based insights from a Builder's artifacts.
 * Every insight carries the artifacts that produced it — no unsupported claims.
 */
export function deriveInsights(artifacts: Artifact[]): Insight[] {
  const insights: Insight[] = [];
  const of = (t: ArtifactType) => artifacts.filter((a) => a.type === t);

  const slogans = of("slogan");
  const logos = of("logo");
  const proposals = of("proposal");
  const looks = of("look");
  const links = of("link");

  // 1. Signature theme — a tag that keeps returning across slogans + proposals.
  const themed = [...slogans, ...proposals].filter(
    (a) => typeof a.meta?.["theme"] === "string" && a.meta["theme"],
  );
  const themes = tally(themed.map((a) => String(a.meta!["theme"])));
  if (themes.length && themes[0][1] >= 3) {
    const [theme, count] = themes[0];
    const supporting = themed
      .filter((a) => String(a.meta!["theme"]) === theme)
      .sort(newest);
    const share = count / themed.length;
    insights.push({
      id: `signature-${theme}`,
      kind: "signature",
      title: `"${titleize(theme)}" is becoming your signature`,
      narrative: `${count} of your ${themed.length} themed pieces return to ${titleize(
        theme,
      )}. That repetition isn't noise — it's the through-line other Builders will recognise as yours.`,
      strength: clamp01(0.4 + share * 0.6),
      evidence: `${count} artifacts · ${pct(share)} of themed work`,
      artifacts: supporting,
    });
  }

  // 2. Craft standard — dominant logo placement across treatments.
  const placed = logos.filter((a) => typeof a.meta?.["placement"] === "string");
  const placements = tally(placed.map((a) => String(a.meta!["placement"])));
  if (placements.length && placements[0][1] >= 2) {
    const [placement, count] = placements[0];
    const supporting = placed
      .filter((a) => String(a.meta!["placement"]) === placement)
      .sort(newest);
    insights.push({
      id: `craft-${placement}`,
      kind: "craft",
      title: `You keep returning to ${titleize(placement)} placement`,
      narrative: `${count} treatments land in the same place on the garment. A consistent placement language is what turns separate drops into one wardrobe.`,
      strength: clamp01(0.35 + (count / Math.max(placed.length, 1)) * 0.5),
      evidence: `${count} of ${placed.length} treatments`,
      artifacts: supporting,
    });
  }

  // 3. Momentum — approval rate on submitted proposals.
  const decided = proposals.filter((a) =>
    ["approved", "adjusted", "published", "rejected", "skipped"].includes(
      String(a.meta?.["status"] ?? ""),
    ),
  );
  if (decided.length >= 3) {
    const won = decided.filter((a) =>
      ["approved", "adjusted", "published"].includes(String(a.meta?.["status"])),
    );
    const rate = won.length / decided.length;
    insights.push({
      id: "momentum-approval",
      kind: "momentum",
      title:
        rate >= 0.5
          ? `${pct(rate)} of your reviewed proposals move forward`
          : `Your review pass rate is sitting at ${pct(rate)}`,
      narrative:
        rate >= 0.5
          ? `You're reading the brand well. ${won.length} of ${decided.length} reviewed proposals cleared the desk — keep pushing work through while the read is sharp.`
          : `${won.length} of ${decided.length} reviewed proposals cleared. Look at what the approved ones did differently before the next submission.`,
      strength: clamp01(0.3 + decided.length / 20),
      evidence: `${decided.length} reviewed proposals`,
      artifacts: (won.length ? won : decided).sort(newest),
    });
  }

  // 4. Focus area — collection / season concentration in proposals.
  const focused = proposals.filter(
    (a) => typeof a.meta?.["collection"] === "string" && a.meta["collection"],
  );
  const collections = tally(focused.map((a) => String(a.meta!["collection"])));
  if (collections.length && collections[0][1] >= 2) {
    const [collection, count] = collections[0];
    const supporting = focused
      .filter((a) => String(a.meta!["collection"]) === collection)
      .sort(newest);
    insights.push({
      id: `focus-${collection}`,
      kind: "focus",
      title: `Your work is concentrating in ${titleize(collection)}`,
      narrative: `${count} proposals target the same collection. Depth beats spread — this is close to a capsule, not a set of one-offs.`,
      strength: clamp01(0.35 + count / 10),
      evidence: `${count} proposals · ${titleize(collection)}`,
      artifacts: supporting,
    });
  }

  // 5. Craft tier — share of premium/signature quality work.
  const tiered = proposals.filter((a) => typeof a.meta?.["tier"] === "string");
  const highTier = tiered.filter((a) =>
    ["signature", "premium"].includes(String(a.meta!["tier"])),
  );
  if (tiered.length >= 3 && highTier.length / tiered.length >= 0.5) {
    insights.push({
      id: "craft-tier",
      kind: "craft",
      title: "You build at the premium end by default",
      narrative: `${highTier.length} of ${tiered.length} proposals sit in signature or premium tiers. Your instinct is quality-first — price and positioning should follow it.`,
      strength: clamp01(highTier.length / tiered.length),
      evidence: `${pct(highTier.length / tiered.length)} premium or signature`,
      artifacts: highTier.sort(newest),
    });
  }

  // 6. Opportunity — approved ideas that never became a proposal.
  const usedSloganIds = new Set(
    proposals
      .map((a) => a.meta?.["sloganId"])
      .filter((v): v is string => typeof v === "string"),
  );
  const idleApproved = slogans
    .filter(
      (a) =>
        String(a.meta?.["status"]) === "approved" && !usedSloganIds.has(a.id),
    )
    .sort(newest);
  if (idleApproved.length >= 2) {
    insights.push({
      id: "opportunity-idle-slogans",
      kind: "opportunity",
      title: `${idleApproved.length} approved ideas are waiting on a product`,
      narrative:
        "These cleared review but never made it onto a blank. The hardest part is already done — each one is a proposal away from existing.",
      strength: clamp01(0.4 + idleApproved.length / 15),
      evidence: `${idleApproved.length} approved, unused slogans`,
      artifacts: idleApproved,
    });
  }

  // 7. Reach — affiliate links actually pulling traffic.
  const clicked = links
    .filter((a) => Number(a.meta?.["clicks"] ?? 0) > 0)
    .sort((a, b) => Number(b.meta?.["clicks"] ?? 0) - Number(a.meta?.["clicks"] ?? 0));
  if (clicked.length) {
    const total = clicked.reduce((s, a) => s + Number(a.meta?.["clicks"] ?? 0), 0);
    const top = clicked[0];
    const topShare = Number(top.meta?.["clicks"] ?? 0) / total;
    insights.push({
      id: "reach-links",
      kind: "reach",
      title:
        topShare >= 0.5
          ? `One link is carrying most of your reach`
          : `Your reach is spread across ${clicked.length} links`,
      narrative:
        topShare >= 0.5
          ? `"${top.label}" accounts for ${pct(topShare)} of ${total} clicks. Whatever placement is driving it, that's the channel worth repeating.`
          : `${total} clicks across ${clicked.length} live links. No single channel is doing the work — steady distribution.`,
      strength: clamp01(0.3 + Math.min(total, 200) / 400),
      evidence: `${total} clicks · ${clicked.length} links`,
      artifacts: clicked,
    });
  }

  // 8. Rhythm — creation cadence over the last 8 weeks.
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const recent = artifacts.filter((a) => now - new Date(a.createdAt).getTime() < 8 * WEEK);
  if (recent.length >= 4) {
    const weeks = new Set(
      recent.map((a) => Math.floor((now - new Date(a.createdAt).getTime()) / WEEK)),
    );
    const consistency = weeks.size / 8;
    insights.push({
      id: "cadence-recent",
      kind: "cadence",
      title:
        consistency >= 0.5
          ? `You've created in ${weeks.size} of the last 8 weeks`
          : `Your work arrives in bursts`,
      narrative:
        consistency >= 0.5
          ? `${recent.length} artifacts across ${weeks.size} active weeks. Consistency like this is what compounds into a body of work.`
          : `${recent.length} artifacts landed in ${weeks.size} of the last 8 weeks. You build in concentrated sessions — worth planning around rather than fighting.`,
      strength: clamp01(0.3 + consistency * 0.6),
      evidence: `${recent.length} artifacts · ${weeks.size}/8 active weeks`,
      artifacts: recent.slice().sort(newest).slice(0, 12),
    });
  }

  // 9. Exploration — try-on looks as taste signal.
  if (looks.length >= 3) {
    insights.push({
      id: "signature-looks",
      kind: "signature",
      title: `${looks.length} looks say something about your taste`,
      narrative:
        "Every look you styled is a data point on the silhouette and palette you actually reach for. Frassy uses these to sharpen what it puts in front of you.",
      strength: clamp01(0.3 + looks.length / 20),
      evidence: `${looks.length} styled looks`,
      artifacts: looks.slice().sort(newest).slice(0, 12),
    });
  }

  return insights.sort((a, b) => b.strength - a.strength);
}
