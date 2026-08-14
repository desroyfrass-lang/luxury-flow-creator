// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0524 — Founder Guided Platform Audit.
// "Every Page. Every Feature. Every Promise."
//
// Here's what this means: the Founder says "Frassy, let's audit Frass" and the two of
// them walk the platform together, one page at a time — does it work, what does
// it do, what does it cost, and does it still keep the promises we made? This
// is not a separate app; it extends Founder Mode and Frassy.
// ─────────────────────────────────────────────────────────────────────────────

import { COST_IMPACT_REGISTER, auditFeature, type MemberCost } from "@/lib/finance/sustainability";

// ── The pages, in walking order ─────────────────────────────────────────────

export type FeatureStatus = "active" | "in_development" | "disabled" | "experimental";

export type PageFeature = {
  name: string;
  status: FeatureStatus;
  /** Links to a Cost Impact Statement in the financial register, when it costs anything. */
  costId?: string;
  memberCost: MemberCost;
  plain: string;
};

export type AuditPage = {
  id: string;
  label: string;
  path: string;
  /** Why this page exists, in one line. */
  purpose: string;
  /** The promises this page is personally responsible for keeping. */
  promises: string[];
  features: PageFeature[];
};

export const AUDIT_PAGES: AuditPage[] = [
  {
    id: "welcome-hall",
    label: "Welcome Hall",
    path: "/welcome-hall",
    purpose: "The front door. Nobody should ever be told to type a URL to get in.",
    promises: ["Free to build", "Simplicity", "Accessibility", "No surprise charges"],
    features: [
      { name: "Start My Journey", status: "active", memberCost: "free", plain: "One prominent button into onboarding." },
      { name: "The Frass Promise", status: "active", memberCost: "free", plain: "What we commit to, in everyday language." },
      { name: "Visitor agreement", status: "active", memberCost: "free", plain: "Level 1 agreement before anything is stored." },
      { name: "Frassy greeting", status: "active", costId: "frassy-voice", memberCost: "free", plain: "She speaks only once the page is genuinely ready." },
    ],
  },
  {
    id: "onboarding",
    label: "Onboarding with Frassy",
    path: "/onboarding",
    purpose: "The Intelligent Builder Journey — discovery, never a form.",
    promises: ["Free to build", "Build before monetize", "Simplicity"],
    features: [
      { name: "Discovery Interview", status: "active", costId: "frassy-conversation", memberCost: "free", plain: "Frassy finds the business already inside the person." },
      { name: "Builder agreement", status: "active", memberCost: "free", plain: "Level 2 agreement, everyday language first." },
      { name: "Blueprint assignment", status: "active", memberCost: "free", plain: "Entrepreneurial or knowledge-economy Daily." },
    ],
  },
  {
    id: "daily",
    label: "The Daily",
    path: "/room",
    purpose: "One winnable day. Every Daily must end better than it began.",
    promises: ["Free to build", "Simplicity", "No surprise charges"],
    features: [
      { name: "Today's Money Move", status: "active", costId: "daily", memberCost: "free", plain: "One move, sized to the time the member actually has." },
      { name: "Daily customization", status: "active", memberCost: "free", plain: "Rearranging by conversation; layout changes organisation, never capability." },
      { name: "Simplified View", status: "active", memberCost: "free", plain: "Conversation-first layout for anyone who wants it." },
      { name: "Voice", status: "active", costId: "frassy-voice", memberCost: "free", plain: "Hands-free Daily with the one official Frassy voice." },
    ],
  },
  {
    id: "frassy",
    label: "Frassy",
    path: "/room",
    purpose: "One Frassy everywhere, with unlimited expertise and one voice.",
    promises: ["Free to build", "No surprise charges", "Accessibility"],
    features: [
      { name: "Conversation", status: "active", costId: "frassy-conversation", memberCost: "free", plain: "Unlimited, free, everywhere." },
      { name: "Voice identity", status: "active", costId: "frassy-voice", memberCost: "free", plain: "One approved voice; tone changes, identity never does." },
      { name: "Repair Engine", status: "active", memberCost: "free", plain: "She fixes what she safely can and escalates the rest." },
      { name: "Navigation", status: "active", memberCost: "free", plain: "She takes the member there; they never type a URL." },
    ],
  },
  {
    id: "money-moves",
    label: "Money Moves",
    path: "/money-moves",
    purpose: "Learn → Build → Monetize, with every move labelled by financial layer.",
    promises: ["Free to build", "Build before monetize", "Transparent pricing"],
    features: [
      { name: "Money Move engine", status: "active", costId: "money-moves", memberCost: "free", plain: "Ranked by return on the member's available time." },
      { name: "Three-layer labelling", status: "active", memberCost: "free", plain: "Immediate Income, Business Builder, Financial Freedom." },
      { name: "Employment paths", status: "active", memberCost: "free", plain: "A job as a stepping stone, inside Money Moves." },
    ],
  },
  {
    id: "business-vaults",
    label: "Business Vaults",
    path: "/business-vaults",
    purpose: "A complete entrepreneurial pathway per trade, not a feature list.",
    promises: ["Free to build", "Build before monetize"],
    features: [
      { name: "Vault library", status: "active", memberCost: "free", plain: "Discover → Build → Monetize for each trade." },
      { name: "Future Business Vaults", status: "active", memberCost: "free", plain: "Shelved ideas generate nothing until activated." },
      { name: "Manufacturing hand-off", status: "active", costId: "manufacturing", memberCost: "free", plain: "Costs only appear alongside a real order." },
    ],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    path: "/marketplace",
    purpose: "Products and services in one place; the Frass Economy Principle applies.",
    promises: ["Transparent pricing", "No surprise charges", "Free to build"],
    features: [
      { name: "Browsing", status: "active", costId: "marketplace-browsing", memberCost: "free", plain: "Always free to look, always free to list a first offer." },
      { name: "Selling", status: "active", memberCost: "free", plain: "Funded by a small commission only when the member earns." },
      { name: "Checkout", status: "in_development", memberCost: "free", plain: "Disabled during Partner Launch Mode with clear labels." },
    ],
  },
  {
    id: "financial-center",
    label: "Financial Center",
    path: "/workspace/wallet",
    purpose: "Every dollar traceable, explainable and auditable.",
    promises: ["Transparent pricing", "No surprise charges", "No hidden costs"],
    features: [
      { name: "Financial timeline", status: "active", memberCost: "free", plain: "Everyday-language receipts, immutable once written." },
      { name: "Credit balance", status: "active", memberCost: "free", plain: "What's left, what it costs, how to earn more." },
      { name: "Payment requests", status: "active", memberCost: "free", plain: "The customer always pays on their own trusted device." },
      { name: "Tax & tariff intelligence", status: "active", memberCost: "free", plain: "Records and configured rules, clearly labelled — never invented advice." },
    ],
  },
  {
    id: "workshops",
    label: "Workshops & Academy",
    path: "/academy",
    purpose: "Project-based building, never a course catalogue.",
    promises: ["Free to build", "Accessibility", "Build before monetize"],
    features: [
      { name: "Builder Paths", status: "active", memberCost: "free", plain: "Six identity-led paths, all free." },
      { name: "Image generation in projects", status: "active", costId: "image-generation", memberCost: "credits", plain: "Credits, priced before use, with a free written fallback." },
      { name: "Certificates", status: "active", memberCost: "free", plain: "Evidence of what was actually built." },
    ],
  },
  {
    id: "navigation",
    label: "Navigation & Shell",
    path: "/",
    purpose: "The Closed Eyes Test — one world, no maze.",
    promises: ["Simplicity", "Accessibility"],
    features: [
      { name: "Core route registry", status: "active", memberCost: "free", plain: "One list of destinations shared by Frassy, menus and the pre-publish audit." },
      { name: "Shop vs Hill modes", status: "active", memberCost: "free", plain: "Two clear worlds, never a mixed menu." },
      { name: "View mode toggle", status: "active", memberCost: "free", plain: "Standard or Simplified, remembered per member." },
    ],
  },
  {
    id: "founder-mode",
    label: "Founder Mode",
    path: "/control-room",
    purpose: "Oversight without a parallel platform: the Founder walks the same front door.",
    promises: ["Transparency", "Simplicity"],
    features: [
      { name: "Change Advisor", status: "active", memberCost: "free", plain: "Sorts ideas before any engineering is requested." },
      { name: "Design Authority", status: "active", memberCost: "free", plain: "Conversational interface edits with preview and revert." },
      { name: "Repair Center & Platform Intelligence", status: "active", memberCost: "free", plain: "What broke, why, and what stops it recurring." },
      { name: "Financial Sustainability Dashboard", status: "active", memberCost: "free", plain: "What the platform costs to run, at every scale." },
      { name: "Guided Platform Audit", status: "active", memberCost: "free", plain: "This walkthrough." },
    ],
  },
];

// ── The five checks, per page ───────────────────────────────────────────────

export type AuditDimension =
  | "promise"
  | "financial"
  | "ease"
  | "accessibility"
  | "performance"
  | "security"
  | "constitution";

export const AUDIT_DIMENSIONS: Array<{ id: AuditDimension; label: string; plain: string }> = [
  { id: "promise", label: "Promise fulfilled", plain: "The page delivers what we told members it would." },
  { id: "financial", label: "Financial transparency", plain: "Free is free; anything that costs is labelled before use." },
  { id: "ease", label: "Ease of use", plain: "A first-timer gets through it without help." },
  { id: "accessibility", label: "Accessibility", plain: "Readable, operable, and kind to every device and ability." },
  { id: "performance", label: "Performance", plain: "It loads and responds without making anyone wait." },
  { id: "security", label: "Security", plain: "Nothing is exposed that shouldn't be." },
  { id: "constitution", label: "Constitutional consistency", plain: "It obeys the Frass Constitution as written." },
];

export type DimensionScores = Partial<Record<AuditDimension, number>>; // 0–5

export type PageAuditResult = {
  pageId: string;
  scores: DimensionScores;
  findings: string[];
  /** Founder's own words, unedited. */
  notes: string;
};

/**
 * The Trust Score is a private Founder instrument: a fast read on which parts
 * of the platform need attention first. It is never shown to members and never
 * used as a ranking or a badge.
 */
export function trustScore(scores: DimensionScores): number {
  const values = AUDIT_DIMENSIONS.map((d) => scores[d.id]).filter(
    (v): v is number => typeof v === "number",
  );
  if (!values.length) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round((avg / 5) * 100);
}

export function trustBand(score: number): { label: string; tone: "good" | "watch" | "urgent" } {
  if (score >= 85) return { label: "Keeping its promises", tone: "good" };
  if (score >= 65) return { label: "Needs attention", tone: "watch" };
  return { label: "Priority", tone: "urgent" };
}

/**
 * The financial half of the walkthrough, derived automatically so the Founder
 * never has to remember what a page costs.
 */
export function pageFinancials(page: AuditPage) {
  const rows = page.features.map((f) => {
    const statement = f.costId ? COST_IMPACT_REGISTER.find((s) => s.id === f.costId) : undefined;
    const audit = statement ? auditFeature(statement) : null;
    return {
      feature: f.name,
      status: f.status,
      memberCost: f.memberCost,
      free: f.memberCost === "free",
      usesCredits: f.memberCost === "credits",
      creditsPerUse: statement?.creditsPerUse ?? null,
      funding: audit?.answers.sustainedBy ?? "No measurable platform cost.",
      costsFrass: audit?.answers.costsFrass ?? "Negligible.",
      degradesTo: statement?.degradesTo ?? "Nothing to degrade.",
      warnings: audit?.warnings ?? [],
    };
  });
  return {
    rows,
    /** A Critical Trust Issue means a member could be surprised by a cost. */
    criticalTrustIssues: rows.flatMap((r) =>
      r.warnings.filter((w) => w.startsWith("CRITICAL")).map((w) => `${r.feature}: ${w}`),
    ),
  };
}

// ── The report ──────────────────────────────────────────────────────────────

// FRASS-0528 — Every audit ends with one question: are we ready to invite a new
// member onto Frass? Anything other than "Yes" keeps the unresolved findings
// visible until they are addressed.
export type InvitationVerdict = "yes" | "yes_with_issues" | "not_yet";

export const INVITATION_VERDICTS: Array<{
  id: InvitationVerdict;
  icon: string;
  label: string;
  plain: string;
}> = [
  {
    id: "yes",
    icon: "✅",
    label: "Yes",
    plain: "A new member can arrive today and have a good experience.",
  },
  {
    id: "yes_with_issues",
    icon: "⚠️",
    label: "Yes, with known issues",
    plain: "They can come in, but we know what still isn't right.",
  },
  {
    id: "not_yet",
    icon: "❌",
    label: "Not yet",
    plain: "We hold the door until these are fixed.",
  },
];

export const INVITATION_QUESTION =
  "Based on today's audit, are you comfortable inviting a new member onto Frass?";

export type InvitationReadiness = {
  verdict: InvitationVerdict;
  answeredAt: string;
  note: string;
  /** Findings that must stay visible until they are addressed. */
  unresolved: string[];
};

export function invitationLabel(verdict: InvitationVerdict): string {
  const v = INVITATION_VERDICTS.find((x) => x.id === verdict);
  return v ? `${v.icon} ${v.label}` : verdict;
}

export type AuditReport = {
  startedAt: string;
  completedAt: string;
  pagesAudited: number;
  featuresReviewed: number;
  overallTrustScore: number;
  weakest: Array<{ page: string; score: number }>;
  financialFindings: string[];
  uxFindings: string[];
  securityFindings: string[];
  improvements: string[];
  engineeringTasks: string[];
  constitutionalRecommendations: string[];
  invitationReadiness?: InvitationReadiness;
};


export function buildAuditReport(
  results: PageAuditResult[],
  startedAt: string,
  extras: {
    improvements?: string[];
    engineeringTasks?: string[];
    constitutionalRecommendations?: string[];
    invitationReadiness?: InvitationReadiness;
  } = {},
): AuditReport {
  const scored = results.map((r) => ({
    page: AUDIT_PAGES.find((p) => p.id === r.pageId)?.label ?? r.pageId,
    score: trustScore(r.scores),
    result: r,
  }));
  const overall = scored.length
    ? Math.round(scored.reduce((a, b) => a + b.score, 0) / scored.length)
    : 0;

  const financialFindings = results.flatMap((r) => {
    const page = AUDIT_PAGES.find((p) => p.id === r.pageId);
    if (!page) return [];
    const fin = pageFinancials(page);
    const low = (r.scores.financial ?? 5) < 4 ? [`${page.label}: financial transparency scored low.`] : [];
    return [...fin.criticalTrustIssues.map((c) => `${page.label} — ${c}`), ...low];
  });

  return {
    startedAt,
    completedAt: new Date().toISOString(),
    pagesAudited: results.length,
    featuresReviewed: results.reduce(
      (sum, r) => sum + (AUDIT_PAGES.find((p) => p.id === r.pageId)?.features.length ?? 0),
      0,
    ),
    overallTrustScore: overall,
    weakest: scored
      .slice()
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(({ page, score }) => ({ page, score })),
    financialFindings,
    uxFindings: results
      .filter((r) => (r.scores.ease ?? 5) < 4 || (r.scores.accessibility ?? 5) < 4)
      .map((r) => `${AUDIT_PAGES.find((p) => p.id === r.pageId)?.label ?? r.pageId}: usability or accessibility needs work.`),
    securityFindings: results
      .filter((r) => (r.scores.security ?? 5) < 4)
      .map((r) => `${AUDIT_PAGES.find((p) => p.id === r.pageId)?.label ?? r.pageId}: security observation raised.`),
    improvements: extras.improvements ?? results.flatMap((r) => r.findings),
    engineeringTasks: extras.engineeringTasks ?? [],
    constitutionalRecommendations: extras.constitutionalRecommendations ?? [],
    invitationReadiness: extras.invitationReadiness,
  };
}

export function reportToMarkdown(report: AuditReport): string {
  const list = (items: string[]) => (items.length ? items.map((i) => `- ${i}`).join("\n") : "- None.");
  return [
    `# Founder Platform Audit — ${new Date(report.completedAt).toLocaleDateString()}`,
    ``,
    `Pages audited: ${report.pagesAudited} · Features reviewed: ${report.featuresReviewed}`,
    `Overall Trust Score (private): ${report.overallTrustScore}/100`,
    ``,
    `## Needs attention first`,
    list(report.weakest.map((w) => `${w.page} — ${w.score}/100`)),
    ``,
    `## Financial findings`,
    list(report.financialFindings),
    ``,
    `## Experience findings`,
    list(report.uxFindings),
    ``,
    `## Security observations`,
    list(report.securityFindings),
    ``,
    `## Improvements`,
    list(report.improvements),
    ``,
    `## Engineering tasks`,
    list(report.engineeringTasks),
    ``,
    `## Constitutional recommendations`,
    list(report.constitutionalRecommendations),
    ``,
    `## Invitation readiness`,
    report.invitationReadiness
      ? [
          `${INVITATION_QUESTION}`,
          `Answer: ${invitationLabel(report.invitationReadiness.verdict)}`,
          report.invitationReadiness.note ? `Note: ${report.invitationReadiness.note}` : "",
          report.invitationReadiness.unresolved.length
            ? `Unresolved until addressed:\n${list(report.invitationReadiness.unresolved)}`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "- Not answered.",
  ].join("\n");
}

export const AUDIT_TRIGGER_PHRASES = [
  "let's audit frass",
  "lets audit frass",
  "audit frass",
  "start an audit",
  "platform audit",
  "walk the platform",
];

export function isAuditTrigger(text: string): boolean {
  const t = text.toLowerCase();
  return AUDIT_TRIGGER_PHRASES.some((p) => t.includes(p));
}
