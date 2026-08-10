// FRASS-0450 — Founder Daily OS.
//
// The Daily does not get bigger; it gets more intentional. Everything the
// Founder needs to run Frass is one tab away, and nothing is open at once.

export type FounderTabId =
  | "today"
  | "continue"
  | "studios"
  | "financial"
  | "audit"
  | "command"
  | "decisions"
  | "world"
  | "health"
  | "notes"
  | "registry";

export type FounderTab = {
  id: FounderTabId;
  label: string;
  icon: string;
  blurb: string;
  founderOnly?: boolean;
};

export const FOUNDER_TABS: FounderTab[] = [
  { id: "today", label: "Today's Daily", icon: "☀", blurb: "What needs you today, in order." },
  { id: "continue", label: "Continue Working", icon: "▶", blurb: "Pick up exactly where you stopped." },
  { id: "studios", label: "FV Studios", icon: "🎬", blurb: "Production, credits and content." },
  { id: "financial", label: "Financial Center", icon: "◈", blurb: "Money in, money out, what's owed." },
  {
    id: "audit",
    label: "Financial Audit",
    icon: "🔍",
    blurb: "Every record, every event, reconciled.",
    founderOnly: true,
  },
  { id: "command", label: "Command Center", icon: "⌘", blurb: "Run the platform's control surfaces." },
  { id: "decisions", label: "Decisions", icon: "🗂", blurb: "Everything decided, searchable." },
  { id: "world", label: "World Builder", icon: "🏗", blurb: "Districts, blueprints, construction." },
  { id: "health", label: "Platform Health", icon: "🩺", blurb: "What's live, what's watching." },
  { id: "notes", label: "Notes", icon: "✎", blurb: "Your own thinking, kept." },
  { id: "registry", label: "Registry", icon: "📜", blurb: "The constitution and its components." },
];

/** Quick launchers used by the lighter tabs — places, not features. */
export const FOUNDER_LAUNCHERS: Record<string, { label: string; href: string; plain: string }[]> = {
  continue: [
    { label: "My Workspace", href: "/room", plain: "Reopens on your last mode and project." },
    { label: "Control Room", href: "/founder", plain: "Mission control for building." },
    { label: "Frassy", href: "/frassy", plain: "Pick up the last conversation." },
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
    { label: "Control Room", href: "/founder", plain: "Blueprint mode and construction." },
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
