// FRASS-0450 — Founder Daily OS.
//
// The Daily does not get bigger; it gets more intentional. Everything the
// Founder needs to run Frass is one tab away, and nothing is open at once.

export type FounderTabId =
  | "today"
  | "continue"
  | "goals"
  | "command"
  | "approvals"
  | "opportunities"
  | "feedback"
  | "studios"
  | "financial"
  | "recruitment"
  | "world"
  | "decisions"
  | "notes"
  | "registry"
  | "platform"
  | "partners"
  | "audit";

export type FounderTab = {
  id: FounderTabId;
  label: string;
  icon: string;
  blurb: string;
  founderOnly?: boolean;
};

// Amendment 1 — the administrative tabs sit at the end. Financial Audit is
// always the very last thing, because looking backwards is never the first
// thing a Founder does in a day.
export const FOUNDER_TABS: FounderTab[] = [
  { id: "today", label: "Today's Daily", icon: "☀", blurb: "What needs you today, in order." },
  { id: "continue", label: "Continue Working", icon: "▶", blurb: "Pick up exactly where you stopped." },
  { id: "goals", label: "Goals & Vision", icon: "🎯", blurb: "Where this is all going." },
  { id: "command", label: "Founder Control Room", icon: "⌘", blurb: "Run the platform's control surfaces." },
  { id: "approvals", label: "Pending Approvals", icon: "✔", blurb: "Things waiting on your word." },
  { id: "opportunities", label: "Opportunities", icon: "✦", blurb: "What's worth your attention next." },
  { id: "feedback", label: "Launch Feedback", icon: "💬", blurb: "What people are telling us." },
  { id: "studios", label: "FV Studios", icon: "🎬", blurb: "Production, credits and content." },
  { id: "financial", label: "Financial Center", icon: "◈", blurb: "Money in, money out, what's owed." },
  { id: "recruitment", label: "Recruitment", icon: "🤝", blurb: "Who's joining and who brought them." },
  { id: "world", label: "World Builder", icon: "🏗", blurb: "Districts, blueprints, construction." },
  { id: "decisions", label: "Decisions", icon: "🗂", blurb: "Everything decided, searchable." },
  { id: "notes", label: "Notes", icon: "✎", blurb: "Your own thinking, kept." },
  { id: "registry", label: "Registry", icon: "📜", blurb: "The constitution and its components." },
  {
    id: "partners",
    label: "Partner Progress",
    icon: "👥",
    blurb: "Every partner's launch readiness and today's Money Moves.",
    founderOnly: true,
  },
  { id: "platform", label: "Platform Audit", icon: "🏛", blurb: "Is the platform itself healthy?" },
  {
    id: "audit",
    label: "Financial Audit",
    icon: "🔍",
    blurb: "Every record, every event, reconciled. Observation only.",
    founderOnly: true,
  },
];

/** Quick launchers used by the lighter tabs — places, not features. */
export const FOUNDER_LAUNCHERS: Record<string, { label: string; href: string; plain: string }[]> = {
  continue: [
    { label: "My Workspace", href: "/room", plain: "Reopens on your last mode and project." },
    { label: "Control Room", href: "/control-room", plain: "Mission control for building." },
    { label: "Frassy", href: "/frassy", plain: "Pick up the last conversation." },
  ],
  goals: [
    { label: "Control Room", href: "/control-room", plain: "Goals, vision maps and construction." },
    { label: "Insights", href: "/workspace/insights", plain: "How close the numbers are to the goal." },
    { label: "Business Builder", href: "/business-builder", plain: "Turn a goal into a plan." },
    { label: "Launch Accelerator", href: "/launch-accelerator", plain: "Today's fastest route to income." },
    { label: "First 30 Days", href: "/first-30-days", plain: "The guided launch programme, day by day." },
    { label: "Money Moves", href: "/money-moves", plain: "The one action most likely to earn today." },
  ],
  approvals: [
    { label: "Approvals", href: "/admin/approvals", plain: "Things waiting on your word." },
    { label: "Visual review", href: "/visual-review", plain: "Imagery waiting to be approved." },
    { label: "Partner vendors", href: "/admin/partner-vendors", plain: "Scorecards before any supplier." },
  ],
  opportunities: [
    { label: "Opportunity Center", href: "/opportunity", plain: "Everything worth building next." },
    { label: "Creation", href: "/creation", plain: "Turn an opportunity into work." },
    { label: "Global operations", href: "/global-operations", plain: "Where Frass can expand." },
  ],
  feedback: [
    { label: "Launch feedback", href: "/admin/launch-feedback", plain: "Everything people told us." },
    { label: "Page feedback", href: "/admin/feedback", plain: "Notes left on specific pages." },
  ],
  recruitment: [
    { label: "My Frass Link", href: "/workspace/link", plain: "Your permanent link and its team." },
    { label: "Affiliate", href: "/workspace/affiliate", plain: "Commissions and campaigns." },
    { label: "My Frass Card", href: "/workspace/card", plain: "Identity people actually meet." },
  ],
  studios: [
    { label: "FV Studios", href: "/fv-studios", plain: "The production floor." },
    { label: "Music & Media", href: "/music-media", plain: "Radio, media, releases." },
    { label: "AI Credits", href: "/admin/ai-credits", plain: "Who is spending studio credits." },
  ],
  financial: [
    { label: "Financial Center", href: "/financial-center", plain: "Balances and payouts." },
    { label: "Wallet", href: "/workspace/wallet", plain: "Your Frass Card wallet and Quick Sell." },
    { label: "Commerce simulation", href: "/commerce-simulation", plain: "Prove the flows still work." },
  ],
  command: [
    { label: "Admin console", href: "/admin", plain: "Every operational tool." },
    { label: "Approvals", href: "/admin/approvals", plain: "Things waiting on your word." },
    { label: "Roles", href: "/admin/roles", plain: "Who can do what." },
    { label: "Link check", href: "/admin/link-check", plain: "Nothing broken in the world." },
  ],
  world: [
    { label: "Frass Hill", href: "/frass-hill", plain: "The town itself." },
    { label: "Control Room", href: "/control-room", plain: "Blueprint mode and construction." },
    { label: "The Walk", href: "/frass-hill-journey", plain: "The animated arrival." },
  ],
};

/* ── Founder notes (private, kept on this device) ────────────────────────── */

const NOTES_KEY = "frass.founder.notes";

export type FounderNote = { id: string; text: string; at: string };

export function loadFounderNotes(): FounderNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NOTES_KEY);
    return raw ? (JSON.parse(raw) as FounderNote[]) : [];
  } catch {
    return [];
  }
}

export function saveFounderNotes(notes: FounderNote[]): FounderNote[] {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes.slice(0, 300)));
    } catch {
      /* storage full or blocked — notes stay in memory for this session */
    }
  }
  return notes;
}
