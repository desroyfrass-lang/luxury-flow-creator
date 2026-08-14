// ─────────────────────────────────────────────────────────────────────────────
// FRASS MASTER REGISTRY — The Frass Daily (Universal Daily Control Room)
//
// One Daily across the entire ecosystem. Content adapts to the Builder's roles,
// projects and active work; the framework never changes.
// This module is the single source of truth for the Daily's shape.
//
// Architectural Amendment — the Daily is a command center, not a report:
//   • Every number is clickable and resolves to the records behind it.
//   • Every number carries a data-status badge (live / sample / projected / …).
//   • Every business metric can be explained by Frassy ("What does this mean?").
//   • Today's Daily is persisted, so reopening it restores it exactly as left.
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

/** Status badge shown beside every metric so nothing is ever ambiguous. */
export type DataStatus = "live" | "sample" | "projected" | "ai" | "awaiting";

export const DATA_STATUS: Record<DataStatus, { dot: string; label: string; note: string }> = {
  live: { dot: "🟢", label: "Live Data", note: "Read from real production records." },
  sample: {
    dot: "🟡",
    label: "Sample Data",
    note: "Development placeholder. Not real business activity yet.",
  },
  projected: { dot: "🔵", label: "Projected", note: "A forecast based on current pace." },
  ai: { dot: "🟣", label: "AI Recommendation", note: "Frassy's suggestion, not a measurement." },
  awaiting: {
    dot: "⚪",
    label: "Awaiting Integration",
    note: "The system that feeds this number isn't connected yet.",
  },
};

/** Where a Daily item opens. Either a project inside My Workspace, or a route. */
export type DailyTarget = { projectId?: string; href?: string };

export type DailyTask = DailyTarget & {
  id: string;
  label: string;
  detail?: string;
  priority: DailyPriority;
  /** Minutes of Founder/Builder time this task costs if done personally. */
  minutes: number;
  /** Whether Frassy is allowed to carry this one for you. */
  delegable: boolean;
};

export type DailyWin = { id: string; icon: string; label: string };

/** Where a number physically came from. Money must always explain itself. */
export type MetricSource = {
  label: string;
  value: string;
  status: DataStatus;
};

/** An underlying record behind a metric — the Daily shows data, not summaries. */
export type MetricRecord = DailyTarget & {
  id: string;
  label: string;
  meta?: string;
};

/** A clickable, badged, explainable number. No dead information. */
export type DailyMetric = DailyTarget & {
  label: string;
  value: string;
  trend?: string;
  status: DataStatus;
  /** Frassy's plain-language explanation — the dashboard teaches while it reports. */
  explain: string;
  /** Provenance — every part of the number, and where each part came from. */
  sources?: MetricSource[];
  /** The records behind the number, expandable inline. */
  records?: MetricRecord[];
};


export type DailyApproval = DailyTarget & { id: string; kind: string; label: string };
export type DailyOpportunity = DailyTarget & { id: string; icon: string; label: string; why: string };
export type DailyGoal = DailyTarget & { id: string; label: string; pct: number; note: string; status: DataStatus };
export type DailyActivity = DailyTarget & { id: string; icon: string; label: string; when: string };
export type DailyResume = DailyTarget & { id: string; label: string; detail: string };

export type DailyModel = {
  audience: DailyAudience;
  greeting: string;
  subline: string;
  wins: DailyWin[];
  briefing: DailyMetric[];
  alerts: string[];
  tasks: DailyTask[];
  approvals: DailyApproval[];
  opportunities: DailyOpportunity[];
  goals: DailyGoal[];
  performance: DailyMetric[];
  activity: DailyActivity[];
  resume: DailyResume[];
  /** Founder-only executive panels. */
  executive: DailyMetric[];
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

// ── Today's Daily state (survives reopening the Daily later in the day) ───────

export type DailyState = { day: string; done: string[]; delegated: string[] };

const STATE_KEY = "frass.daily.state";

export function loadDailyState(): DailyState {
  const empty: DailyState = { day: dayKey(), done: [], delegated: [] };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as DailyState;
    if (parsed.day !== dayKey()) return empty;
    return { day: parsed.day, done: parsed.done ?? [], delegated: parsed.delegated ?? [] };
  } catch {
    return empty;
  }
}

export function saveDailyState(state: Omit<DailyState, "day">): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STATE_KEY, JSON.stringify({ day: dayKey(), ...state }));
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
    {
      label: "Orders",
      value: "18 placed",
      trend: "+4 vs yesterday",
      status: "sample",
      projectId: "product-population",
      explain:
        "An order is a completed checkout. Right now these are development placeholders — no real customer has paid. Once payments are connected, this counts paid orders only; pending and cancelled orders are tracked separately and do not count toward revenue. Your action is to fulfil paid orders and chase pending ones.",
      sources: [
        { label: "Storefront checkout", value: "0", status: "awaiting" },
        { label: "Marketplace vendors", value: "0", status: "awaiting" },
        { label: "Demonstration records", value: "18", status: "sample" },
      ],
      records: [
        { id: "o-1001", label: "Order #1001 · Frass Kicks Casual", meta: "Demonstration · Awaiting fulfilment", href: "/admin/approvals" },
        { id: "o-1002", label: "Order #1002 · Frass Drip Blazer", meta: "Demonstration · Paid", href: "/admin/approvals" },
        { id: "o-1003", label: "Order #1003 · Kids School Drip", meta: "Demonstration · Pending payment", href: "/admin/approvals" },
      ],
    },
    {
      label: "Revenue",
      value: "Tracking to plan",
      status: "awaiting",
      href: "/workspace/affiliate",
      explain:
        "Revenue is money actually collected, before product cost, shipping and fees. It becomes real once the payment processor is connected. What you keep after costs is margin — that is the number that matters for a dropshipping business.",
      sources: [
        { label: "Product sales", value: "$0.00", status: "awaiting" },
        { label: "Marketplace sales", value: "$0.00", status: "awaiting" },
        { label: "Affiliate-attributed sales", value: "$0.00", status: "awaiting" },
        { label: "Builder income share", value: "$0.00", status: "awaiting" },
        { label: "Luxury House", value: "$0.00", status: "awaiting" },
        { label: "Bridal", value: "$0.00", status: "awaiting" },
        { label: "Kids", value: "$0.00", status: "awaiting" },
        { label: "Subscriptions (Frass Plus+)", value: "$0.00", status: "awaiting" },
        { label: "Foundation contributions", value: "$0.00", status: "awaiting" },
        { label: "Vault contributions", value: "$0.00", status: "awaiting" },
        { label: "Fees", value: "-$0.00", status: "awaiting" },
        { label: "Refunds & returns", value: "-$0.00", status: "awaiting" },
        { label: "Pending payouts", value: "$0.00", status: "awaiting" },
        { label: "Available balance", value: "$0.00", status: "awaiting" },
      ],
    },
    {
      label: "Returns",
      value: "1 open",
      status: "sample",
      href: "/admin/approvals",
      explain:
        "A return is a customer sending a product back. Each one reverses revenue and usually costs shipping. A rising return rate on one supplier is the earliest warning that the supplier's quality is slipping.",
      records: [
        { id: "r-4401", label: "Return #4401 · size exchange", meta: "Demonstration · Awaiting inspection", href: "/admin/approvals" },
      ],
    },

    {
      label: "Messages",
      value: "6 unread",
      status: "sample",
      href: "/notifications",
      explain:
        "Unread messages from customers, vendors and Builders. Customer messages before purchase are the highest-value ones — answering quickly is the cheapest way to increase sales.",
    },
    {
      label: "Marketplace",
      value: "3 new listings",
      status: "sample",
      projectId: "marketplace",
      explain:
        "New products submitted by vendors into the Marketplace. They are not visible to shoppers until you approve them.",
    },
    {
      label: "Affiliate",
      value: "2 campaigns live",
      status: "sample",
      href: "/workspace/affiliate",
      explain:
        "Affiliates promote your products for a commission. Every commission comes out of your margin, which is why the platform allocation of 10% is protected before any commission is offered.",
    },
    {
      label: "Community",
      value: "9 Builder posts",
      status: "sample",
      projectId: "academy",
      explain: "Activity from Builders in the community. A healthy community lowers support cost and raises retention.",
    },
  ],
  alerts: ["A commission band for footwear is waiting on your approval."],
  tasks: [
    {
      id: "d0",
      label: "🎨 Continue Visual Excellence Review",
      detail:
        "FRASS-0226 · Brand Excellence. One image at a time — approve, enhance, redesign or replace. Progress is saved after every decision.",
      priority: "important",
      minutes: 30,
      delegable: false,
      href: "/visual-review",
    },
    {
      id: "d1",
      label: "Review the next five CJ vendors, one at a time",
      detail: "Product Population continues exactly where we paused — Vendor 4 of 12 · Product 87.",
      priority: "critical",
      minutes: 45,
      delegable: true,
      projectId: "product-population",
    },
    {
      id: "d2",
      label: "Approve the footwear commission band",
      detail: "Platform allocation stays protected at 10%.",
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
    { id: "a1", kind: "Product", label: "6 products awaiting catalog approval", href: "/admin/approvals" },
    { id: "a2", kind: "Vendor", label: "Vendor scorecard — Aurora Sourcing", href: "/admin/partner-vendors" },
    { id: "a3", kind: "Affiliate", label: "Autumn creator campaign", href: "/workspace/affiliate" },
    { id: "a4", kind: "Policy", label: "Commission floor amendment", href: "/admin/affiliate-policy" },
  ],
  opportunities: [
    {
      id: "o1",
      icon: "📈",
      label: "Chunky-sole silhouettes are trending",
      why: "Demand is rising in your two largest regions.",
      projectId: "product-population",
    },
    {
      id: "o2",
      icon: "🤝",
      label: "Three creators fit the affiliate profile",
      why: "Audience overlaps Frass Kicks buyers.",
      href: "/workspace/affiliate",
    },
    {
      id: "o3",
      icon: "👰",
      label: "Bridal season window opens soon",
      why: "Flagship destination is already scaffolded.",
      projectId: "bridal",
    },
    {
      id: "o4",
      icon: "🎓",
      label: "A sourcing lesson matches today's work",
      why: "Ten minutes, taught while we build.",
      href: "/academy",
    },
  ],
  goals: [
    { id: "g1", label: "Catalog to 250 products", pct: 34, note: "86 live", status: "sample", projectId: "product-population" },
    { id: "g2", label: "Launch readiness", pct: 62, note: "Phase 3 of 5", status: "live", href: "/control-room" },
    { id: "g3", label: "Foundation pledge", pct: 41, note: "On pace", status: "projected", projectId: "foundation" },
  ],
  performance: [
    {
      label: "Revenue",
      value: "Steady",
      trend: "▲",
      status: "awaiting",
      projectId: "finance",
      explain: "Daily revenue trend. Connects once payments are live.",
    },
    {
      label: "Orders",
      value: "18 today",
      status: "sample",
      projectId: "product-population",
      explain: "Today's orders. Development placeholders until the store takes real payments.",
    },
    {
      label: "Affiliate",
      value: "2 conversions",
      status: "sample",
      href: "/workspace/affiliate",
      explain: "A conversion is a sale credited to an affiliate link. Each one owes commission out of margin.",
    },
    {
      label: "Marketplace",
      value: "Healthy",
      status: "sample",
      projectId: "marketplace",
      explain: "A blended read of listings, vendor quality and buyer activity.",
    },
    {
      label: "Builders active",
      value: "27",
      status: "sample",
      projectId: "academy",
      explain: "Builders who worked inside Frass OS today. Real once accounts are in production use.",
    },
    {
      label: "Foundation impact",
      value: "3 families served",
      status: "sample",
      projectId: "foundation",
      explain: "Families supported through Foundation initiatives. Becomes live once impact records are logged.",
    },
  ],
  activity: [
    { id: "r1", icon: "📤", label: "You uploaded four product photos", when: "Yesterday", projectId: "product-population" },
    { id: "r2", icon: "📦", label: "Two products moved to Ready", when: "Yesterday", projectId: "product-population" },
    { id: "r3", icon: "💬", label: "Frassy logged a vendor decision", when: "Yesterday", projectId: "product-population" },
  ],
  resume: [
    { id: "c1", label: "Continue Product Population", detail: "Vendor 4 of 12 · Product 87", projectId: "product-population" },
    { id: "c2", label: "Continue Homepage & Districts", detail: "Hero locked, footer open", projectId: "homepage" },
    { id: "c3", label: "Continue Foundation planning", detail: "Pillar two drafting", projectId: "foundation" },
  ],
  executive: [
    {
      label: "Launch readiness",
      value: "Phase 3 of 5",
      status: "live",
      href: "/control-room",
      explain: "How much of the platform is commissioned and approved. Tracked inside the Founder Dashboard.",
    },
    {
      label: "Marketplace health",
      value: "Stable",
      status: "sample",
      projectId: "marketplace",
      explain: "Vendor quality, listing freshness and buyer trust, read together.",
    },
    {
      label: "Foundation",
      value: "3 initiatives active",
      status: "sample",
      projectId: "foundation",
      explain: "Active humanitarian initiatives funded by the business.",
    },
    {
      label: "Revenue snapshot",
      value: "Tracking to plan",
      status: "awaiting",
      projectId: "finance",
      explain: "Revenue against the plan you set. Connects with the payment processor.",
    },
    {
      label: "Vendor pipeline",
      value: "12 in review",
      status: "sample",
      href: "/admin/partner-vendors",
      explain: "Suppliers being scored before approval. No vendor ships for Frass without clearing the scorecard.",
    },
    {
      label: "Affiliate overview",
      value: "2 campaigns live",
      status: "sample",
      href: "/workspace/affiliate",
      explain: "Live creator campaigns and the commission they are drawing.",
    },
    {
      label: "Community health",
      value: "Warm",
      status: "sample",
      projectId: "academy",
      explain: "Tone and participation across Builder Circles.",
    },
    {
      label: "Critical decisions",
      value: "2 awaiting you",
      status: "live",
      href: "/admin/approvals",
      explain: "Decisions only the Founder can make. Everything else Frassy can carry.",
    },
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
    {
      label: "Messages",
      value: "2 unread",
      status: "sample",
      href: "/notifications",
      explain: "Messages waiting for you from Frassy, mentors and your Builder Circle.",
    },
    {
      label: "Community",
      value: "4 new posts",
      status: "sample",
      href: "/academy",
      explain: "New conversation in the Builder community since your last session.",
    },
    {
      label: "Academy",
      value: "1 lesson ready",
      status: "sample",
      href: "/academy",
      explain: "The next project-based lesson on your Builder Path is prepared.",
    },
  ],
  alerts: [],
  tasks: [
    { id: "b1", label: "Continue your Builder Path", priority: "critical", minutes: 30, delegable: false, projectId: "academy" },
    { id: "b2", label: "Add one artifact to your Vault", priority: "important", minutes: 15, delegable: true, href: "/vault" },
    { id: "b3", label: "Reply in your Builder Circle", priority: "optional", minutes: 10, delegable: false, projectId: "foundation" },
  ],
  approvals: [],
  opportunities: [
    { id: "o1", icon: "🤝", label: "A collaboration matches your skills", why: "Two Builders need what you already do.", href: "/opportunity" },
    { id: "o2", icon: "🎓", label: "A short course fits today", why: "Fifteen minutes, project-based.", href: "/academy" },
  ],
  goals: [
    { id: "g1", label: "Builder Path progress", pct: 28, note: "Stage 4 of 14", status: "live", href: "/academy" },
  ],
  performance: [
    {
      label: "Streak",
      value: "5 days",
      status: "sample",
      href: "/academy",
      explain: "Consecutive days you showed up and built something.",
    },
    {
      label: "Skills",
      value: "3 growing",
      status: "sample",
      href: "/academy",
      explain: "Skills strengthening through the projects you complete.",
    },
  ],
  activity: [{ id: "r1", icon: "📤", label: "You uploaded a project file", when: "Yesterday", href: "/vault" }],
  resume: [{ id: "c1", label: "Continue Builder Academy", detail: "Where we paused", projectId: "academy" }],
  executive: [],
};

export function dailyFor(audience: DailyAudience): DailyModel {
  return audience === "founder" ? FOUNDER : { ...BUILDER, audience };
}
