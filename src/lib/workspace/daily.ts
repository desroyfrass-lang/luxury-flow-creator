// ─────────────────────────────────────────────────────────────────────────────
// FRASS MASTER REGISTRY — The Frass Daily (Universal Daily Command Center)
//
// One Daily across the entire ecosystem. Content adapts to the Builder's roles,
// projects and active work; the framework never changes.
// This module is the single source of truth for the Daily's shape.
// ─────────────────────────────────────────────────────────────────────────────

export type DailyAudience =
  | "founder"
  | "builder"
  | "artist"
  | "farmer"
  | "partner"
  | "affiliate"
  | "student";

export type DailyPriority = "critical" | "important" | "optional" | "completed";

export type DailyTask = {
  id: string;
  label: string;
  detail?: string;
  priority: DailyPriority;
  /** Minutes of Founder/Builder time this task costs if done personally. */
  minutes: number;
  /** Whether Frassy is allowed to carry this one for you. */
  delegable: boolean;
  /** Where "Open" takes you inside My Workspace. */
  projectId?: string;
};

export type DailyWin = { id: string; icon: string; label: string };
export type DailyLine = { label: string; value: string; trend?: string };
export type DailyApproval = { id: string; kind: string; label: string; projectId?: string };
export type DailyOpportunity = { id: string; icon: string; label: string; why: string };
export type DailyGoal = { id: string; label: string; pct: number; note: string };
export type DailyActivity = { id: string; icon: string; label: string; when: string };
export type DailyResume = { id: string; label: string; detail: string; projectId: string };

export type DailyModel = {
  audience: DailyAudience;
  greeting: string;
  subline: string;
  wins: DailyWin[];
  briefing: DailyLine[];
  alerts: string[];
  tasks: DailyTask[];
  approvals: DailyApproval[];
  opportunities: DailyOpportunity[];
  goals: DailyGoal[];
  performance: DailyLine[];
  activity: DailyActivity[];
  resume: DailyResume[];
  /** Founder-only executive panels. */
  executive: DailyLine[];
};

export const PRIORITY_LABEL: Record<DailyPriority, string> = {
  critical: "Critical",
  important: "Important",
  optional: "Optional",
  completed: "Completed",
};

export function greetingFor(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** After 17:00 the Daily offers reflection instead of planning. */
export function isReflectionHour(date = new Date()): boolean {
  return date.getHours() >= 17;
}

export function formatWorkload(minutes: number): string {
  if (minutes <= 0) return "Nothing left today";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} minutes`;
  if (!m) return `${h} hour${h > 1 ? "s" : ""}`;
  return `${h} hour${h > 1 ? "s" : ""} ${m} minutes`;
}

/** Local calendar-day key — the Daily opens once per day, per Builder. */
export function dayKey(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// ── The Daily content, per audience ──────────────────────────────────────────

const FOUNDER: DailyModel = {
  audience: "founder",
  greeting: "Welcome back",
  subline: "I reviewed everything overnight. Here is the day, laid out.",
  wins: [
    { id: "w1", icon: "🎉", label: "12 products approved into the catalog" },
    { id: "w2", icon: "💰", label: "Marketplace revenue up week over week" },
    { id: "w3", icon: "⭐", label: "A five-star review landed on Frass Kicks" },
    { id: "w4", icon: "📦", label: "One vendor cleared the scorecard" },
    { id: "w5", icon: "❤️", label: "Foundation reached a giving milestone" },
  ],
  briefing: [
    { label: "Orders", value: "18 placed", trend: "+4 vs yesterday" },
    { label: "Revenue", value: "Tracking to plan" },
    { label: "Returns", value: "1 open" },
    { label: "Messages", value: "6 unread" },
    { label: "Marketplace", value: "3 new listings" },
    { label: "Affiliate", value: "2 campaigns live" },
    { label: "Community", value: "9 Builder posts" },
  ],
  alerts: ["A commission band for footwear is waiting on your approval."],
  tasks: [
    {
      id: "d1",
      label: "Review the next five CJ vendors, one at a time",
      detail: "Product Population continues exactly where we paused.",
      priority: "critical",
      minutes: 45,
      delegable: true,
      projectId: "product-population",
    },
    {
      id: "d2",
      label: "Approve the footwear commission band",
      detail: "Platform allocation stays protected at 8%.",
      priority: "critical",
      minutes: 10,
      delegable: false,
      projectId: "affiliate",
    },
    {
      id: "d3",
      label: "Choose the Luxury House autumn palette",
      priority: "important",
      minutes: 25,
      delegable: false,
      projectId: "luxury-house",
    },
    {
      id: "d4",
      label: "Draft the Kids World safety copy",
      priority: "important",
      minutes: 30,
      delegable: true,
      projectId: "kids-world",
    },
    {
      id: "d5",
      label: "Refresh three Marketplace listing photos",
      priority: "optional",
      minutes: 20,
      delegable: true,
      projectId: "marketplace",
    },
    {
      id: "d6",
      label: "Frass District hero locked",
      priority: "completed",
      minutes: 0,
      delegable: false,
      projectId: "homepage",
    },
  ],
  approvals: [
    { id: "a1", kind: "Product", label: "6 products awaiting catalog approval", projectId: "product-population" },
    { id: "a2", kind: "Vendor", label: "Vendor scorecard — Aurora Sourcing", projectId: "product-population" },
    { id: "a3", kind: "Affiliate", label: "Autumn creator campaign", projectId: "affiliate" },
    { id: "a4", kind: "Policy", label: "Commission floor amendment", projectId: "architecture" },
  ],
  opportunities: [
    { id: "o1", icon: "📈", label: "Chunky-sole silhouettes are trending", why: "Demand is rising in your two largest regions." },
    { id: "o2", icon: "🤝", label: "Three creators fit the affiliate profile", why: "Audience overlaps Frass Kicks buyers." },
    { id: "o3", icon: "👰", label: "Bridal season window opens soon", why: "Flagship destination is already scaffolded." },
    { id: "o4", icon: "🎓", label: "A sourcing lesson matches today's work", why: "Ten minutes, taught while we build." },
  ],
  goals: [
    { id: "g1", label: "Catalog to 250 products", pct: 34, note: "86 live" },
    { id: "g2", label: "Launch readiness", pct: 62, note: "Phase 3 of 5" },
    { id: "g3", label: "Foundation pledge", pct: 41, note: "On pace" },
  ],
  performance: [
    { label: "Revenue", value: "Steady", trend: "▲" },
    { label: "Orders", value: "18 today" },
    { label: "Affiliate", value: "2 conversions" },
    { label: "Marketplace", value: "Healthy" },
    { label: "Builders active", value: "27" },
    { label: "Foundation impact", value: "3 families served" },
  ],
  activity: [
    { id: "r1", icon: "📤", label: "You uploaded four product photos", when: "Yesterday" },
    { id: "r2", icon: "📦", label: "Two products moved to Ready", when: "Yesterday" },
    { id: "r3", icon: "💬", label: "Frassy logged a vendor decision", when: "Yesterday" },
  ],
  resume: [
    { id: "c1", label: "Continue Product Population", detail: "Vendor 4 of 12 · 86 reviewed", projectId: "product-population" },
    { id: "c2", label: "Continue Homepage & Districts", detail: "Hero locked, footer open", projectId: "homepage" },
    { id: "c3", label: "Continue Foundation planning", detail: "Pillar two drafting", projectId: "foundation" },
  ],
  executive: [
    { label: "Launch readiness", value: "Phase 3 of 5" },
    { label: "Marketplace health", value: "Stable" },
    { label: "Foundation", value: "3 initiatives active" },
    { label: "Revenue snapshot", value: "Tracking to plan" },
    { label: "Vendor pipeline", value: "12 in review" },
    { label: "Affiliate overview", value: "2 campaigns live" },
    { label: "Community health", value: "Warm" },
    { label: "Critical decisions", value: "2 awaiting you" },
  ],
};

const BUILDER: DailyModel = {
  audience: "builder",
  greeting: "Welcome back",
  subline: "Here is your day — small steps, real progress.",
  wins: [
    { id: "w1", icon: "🎓", label: "You finished a lesson yesterday" },
    { id: "w2", icon: "🌱", label: "Your Vision Map moved forward" },
  ],
  briefing: [
    { label: "Messages", value: "2 unread" },
    { label: "Community", value: "4 new posts" },
    { label: "Academy", value: "1 lesson ready" },
  ],
  alerts: [],
  tasks: [
    { id: "b1", label: "Continue your Builder Path", priority: "critical", minutes: 30, delegable: false, projectId: "academy" },
    { id: "b2", label: "Add one artifact to your Vault", priority: "important", minutes: 15, delegable: true, projectId: "architecture" },
    { id: "b3", label: "Reply in your Builder Circle", priority: "optional", minutes: 10, delegable: false, projectId: "foundation" },
  ],
  approvals: [],
  opportunities: [
    { id: "o1", icon: "🤝", label: "A collaboration matches your skills", why: "Two Builders need what you already do." },
    { id: "o2", icon: "🎓", label: "A short course fits today", why: "Fifteen minutes, project-based." },
  ],
  goals: [{ id: "g1", label: "Builder Path progress", pct: 28, note: "Stage 4 of 14" }],
  performance: [
    { label: "Streak", value: "5 days" },
    { label: "Skills", value: "3 growing" },
  ],
  activity: [{ id: "r1", icon: "📤", label: "You uploaded a project file", when: "Yesterday" }],
  resume: [{ id: "c1", label: "Continue Builder Academy", detail: "Where we paused", projectId: "academy" }],
  executive: [],
};

export function dailyFor(audience: DailyAudience): DailyModel {
  return audience === "founder" ? FOUNDER : { ...BUILDER, audience };
}
