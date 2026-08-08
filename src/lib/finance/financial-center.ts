// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0301 / FRASS-0302 (+ Amendment A) — Frass Financial Center
//
// Constitutional volume: Commerce & Finance.
//
//   • One Financial Center for every member. Never separate wallets per role.
//   • The full tab architecture exists from Version 1; role/permission decides
//     visibility only. Adding a capability must never require a redesign.
//   • Available Balance = immediately withdrawable. No settlement notice ever
//     appears there. Settlement language belongs to Pending Balance alone.
//   • Every monetary number is traceable: gross → allocations → net, with the
//     records behind it and a plain-language explanation.
//   • Zeros are honest. Nothing is invented while a ledger is not yet wired.
// ─────────────────────────────────────────────────────────────────────────────

import type { AppRole } from "@/lib/roles";

/* ── Constitutional platform allocation ──────────────────────────────────── */

export const PLATFORM_ALLOCATION = {
  total: 8,
  infrastructure: 3,
  reserve: 3,
  foundation: 2,
} as const;

export type Allocation = {
  gross: number;
  infrastructure: number;
  reserve: number;
  foundation: number;
  platformTotal: number;
  net: number;
};

/** Apply the constitutional 8% allocation. Recipient always keeps 92%. */
export function allocate(gross: number): Allocation {
  const round = (n: number) => Math.round(n * 100) / 100;
  const infrastructure = round((gross * PLATFORM_ALLOCATION.infrastructure) / 100);
  const reserve = round((gross * PLATFORM_ALLOCATION.reserve) / 100);
  const foundation = round((gross * PLATFORM_ALLOCATION.foundation) / 100);
  const platformTotal = round(infrastructure + reserve + foundation);
  return { gross: round(gross), infrastructure, reserve, foundation, platformTotal, net: round(gross - platformTotal) };
}

/**
 * Credits are a payment mechanism only — they never reduce the payout.
 * A gift of N credits settles at the same monetary value as a card gift.
 */
export const CREDIT_VALUE_USD = 1;
export function creditsToMoney(credits: number): number {
  return Math.round(credits * CREDIT_VALUE_USD * 100) / 100;
}

/* ── Money formatting ────────────────────────────────────────────────────── */

export function money(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

/* ── Traceability — no mysterious numbers ────────────────────────────────── */

export type AmountLine = { label: string; value: string; kind?: "gross" | "deduction" | "net" | "note" };
export type AmountRecord = { id: string; label: string; meta?: string; href?: string };

/** Every monetary figure on the platform carries one of these. */
export type TraceableAmount = {
  id: string;
  label: string;
  amount: number;
  currency?: string;
  /** Which ledger this figure belongs to. */
  ledger: LedgerId;
  /** Technical explanation. */
  explain: string;
  /** Frassy's "What that means is…" layer. */
  plain: string;
  /** Gross → deductions → net. */
  breakdown: AmountLine[];
  /** The transactions behind the number. */
  records: AmountRecord[];
  /** Available balances are withdrawable now; pending shows settlement language. */
  settlement?: "immediate" | "pending";
  actions?: Array<"withdraw" | "export" | "investigate">;
};

export type LedgerId =
  | "wallet"
  | "gifts"
  | "credits"
  | "marketplace"
  | "affiliate"
  | "owner-compensation"
  | "owner-distribution"
  | "owner-equity"
  | "business"
  | "foundation"
  | "tax";

export const LEDGERS: Record<LedgerId, { label: string; note: string }> = {
  wallet: { label: "Member Wallet", note: "Personal cash held for this member." },
  gifts: { label: "Gift Ledger", note: "Community gifts received, after the constitutional allocation." },
  credits: { label: "Credit Ledger", note: "Prepaid and earned Frass Credits. Tracked separately from cash." },
  marketplace: { label: "Marketplace Ledger", note: "Seller and vendor earnings from marketplace orders." },
  affiliate: { label: "Affiliate Ledger", note: "Commission earned on attributed sales." },
  "owner-compensation": {
    label: "Owner Compensation Ledger",
    note: "Founder & Co-Founder per-sale compensation, allocated only after all obligations are satisfied.",
  },
  "owner-distribution": {
    label: "Owner Distribution Ledger",
    note: "Capped share of end-of-day distributable surplus. Ownership, not payroll.",
  },
  "owner-equity": {
    label: "Owner Equity",
    note: "Accumulated ownership value over time. Never withdrawable, never compensation.",
  },
  business: { label: "Business Operations", note: "Company revenue, expenses, and cash position." },
  foundation: { label: "Foundation", note: "The 2% Foundation allocation and personal giving history." },
  tax: { label: "Tax Records", note: "Estimated obligations and withholding by jurisdiction." },
};


/* ── Viewer & role-aware visibility ──────────────────────────────────────── */

export type FinanceViewer = {
  roles: AppRole[];
  /** Founder / Co-Founder accounts unlock business-level tools. */
  founder: boolean;
};

export function viewerFrom(roles: AppRole[]): FinanceViewer {
  return { roles, founder: roles.includes("admin") || roles.includes("super_admin") };
}

export type FinanceTabId =
  | "overview"
  | "wallet"
  | "credits"
  | "gifts"
  | "marketplace"
  | "affiliate"
  | "taxes"
  | "withdrawals"
  | "business"
  | "statements"
  | "settings";

export type FinanceTab = {
  id: FinanceTabId;
  label: string;
  icon: string;
  blurb: string;
  /** Sections listed in FRASS-0302 Amendment A. Built once, revealed by permission. */
  sections: string[];
  visible: (v: FinanceViewer) => boolean;
};

const always = () => true;

export const FINANCE_TABS: FinanceTab[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "📊",
    blurb: "The complete financial summary.",
    sections: ["Balances", "This month", "Where money came from", "What needs attention"],
    visible: always,
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: "💰",
    blurb: "Cash balances. Available is withdrawable now; pending is still settling.",
    sections: ["Available balance", "Pending balance", "Lifetime earnings"],
    visible: always,
  },
  {
    id: "credits",
    label: "Credits",
    icon: "⭐",
    blurb: "Frass Credits — purchased, earned, and spent.",
    sections: ["Credit balance", "Purchases", "Earned credits", "Credit spending", "Credit history"],
    visible: always,
  },
  {
    id: "gifts",
    label: "Gifts",
    icon: "🎁",
    blurb: "Community gifts received, after the constitutional allocation.",
    sections: ["Gift earnings", "Gift history", "Gift messages", "Gift withdrawals", "Gift analytics"],
    visible: always,
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: "🏪",
    blurb: "Seller earnings, orders, and vendor payouts.",
    sections: ["Marketplace earnings", "Orders", "Sales", "Vendor payouts", "Performance"],
    visible: (v) => v.founder || v.roles.includes("partner") || v.roles.includes("designer"),
  },
  {
    id: "affiliate",
    label: "Affiliate",
    icon: "🔗",
    blurb: "Commission earned on attributed sales.",
    sections: ["Affiliate earnings", "Campaigns", "Clicks", "Conversions", "Commission history"],
    visible: (v) => v.founder || v.roles.includes("affiliate") || v.roles.includes("ambassador"),
  },
  {
    id: "taxes",
    label: "Taxes",
    icon: "🧾",
    blurb: "Estimated obligations and country-specific guidance.",
    sections: ["Tax summaries", "Estimated obligations", "Country guidance", "Reports", "Historical records"],
    visible: always,
  },
  {
    id: "withdrawals",
    label: "Withdrawals",
    icon: "🏦",
    blurb: "Move available money out. Only available balance can be withdrawn.",
    sections: ["Available withdrawals", "Withdrawal history", "Bank accounts", "Requests", "Settlement tracking"],
    visible: always,
  },
  {
    id: "business",
    label: "Business",
    icon: "💼",
    blurb: "Founder and eligible business accounts only.",
    sections: [
      "Revenue",
      "Expenses",
      "Owner compensation",
      "Business cash position",
      "Profit",
      "Reserve funds",
      "Foundation contributions",
      "Payroll",
      "Financial health",
    ],
    visible: (v) => v.founder,
  },
  {
    id: "statements",
    label: "Statements & Reports",
    icon: "📄",
    blurb: "Monthly and annual statements, exports, audit reports.",
    sections: ["Monthly reports", "Annual reports", "Transaction history", "CSV export", "PDF export", "Audit reports"],
    visible: always,
  },
  {
    id: "settings",
    label: "Settings",
    icon: "⚙️",
    blurb: "Bank accounts, tax details, payment methods, security.",
    sections: ["Bank accounts", "Tax information", "Payment methods", "Preferences", "Notifications", "Security"],
    visible: always,
  },
];

export function visibleTabs(v: FinanceViewer): FinanceTab[] {
  return FINANCE_TABS.filter((t) => t.visible(v));
}

/* ── Credit economy (FRASS-0302) ─────────────────────────────────────────── */

export type CreditProgram = { id: string; label: string; how: string; approved: boolean };

export const CREDIT_PROGRAMS: CreditProgram[] = [
  { id: "purchase", label: "Purchased credits", how: "Bought directly and stored in the wallet.", approved: true },
  { id: "community", label: "Community participation", how: "Contributing in For Us and the Community Square.", approved: false },
  { id: "academy", label: "Educational achievements", how: "Completing Builder Paths and lessons in the Academy.", approved: false },
  { id: "challenges", label: "Platform challenges", how: "Founder-approved builder challenges and events.", approved: false },
  { id: "campaigns", label: "Promotional campaigns", how: "Seasonal campaigns and launch moments.", approved: false },
  { id: "referral", label: "Referral & loyalty", how: "Where enabled by the Founder.", approved: false },
  { id: "rewards", label: "Founder-approved reward events", how: "Recognition for contribution and impact.", approved: false },
];

export const CREDIT_USES = [
  "Sending gifts in For Us",
  "Eligible marketplace purchases",
  "Premium platform experiences",
  "Founder-approved services",
];

/* ── Tax intelligence ────────────────────────────────────────────────────── */

export const TAX_PRINCIPLES = [
  "Frassy identifies the jurisdiction that applies to each payout, gift, withdrawal, or sale.",
  "Platform allocation and taxes are always shown as separate lines — a fee is not a tax.",
  "Every withheld amount is explained: what it is, why it applied, and how it was calculated.",
  "Estimates are labelled as estimates. Final values are labelled as final.",
  "Where a country's rules require professional review, Frassy says so instead of guessing.",
];

export type TaxNotice = { level: "estimate" | "final" | "unknown"; message: string };

export function taxNotice(country?: string): TaxNotice {
  if (!country) {
    return {
      level: "unknown",
      message:
        "No tax jurisdiction on file yet. Add your country in Settings so obligations can be estimated correctly.",
    };
  }
  return {
    level: "estimate",
    message: `Estimated for ${country}. This is an estimate, not a filed figure — verify with a local tax professional before relying on it.`,
  };
}

/* ── Implementation audit (FRASS-0301 / 0302) ────────────────────────────── */

export type AuditState = "built" | "structure" | "missing";
export type AuditItem = { id: string; label: string; state: AuditState; note: string };

/**
 * Verification audit. Anything not "built" belongs in the Platform
 * Commissioning queue for Founder approval — never duplicated elsewhere.
 */
export const IMPLEMENTATION_AUDIT: AuditItem[] = [
  { id: "center", label: "Frass Financial Center", state: "built", note: "One role-aware Financial Center, all tabs present." },
  { id: "wallet", label: "Wallet balances", state: "structure", note: "Available / Pending / Lifetime rendered; ledger not yet wired." },
  { id: "credits", label: "Credit wallet", state: "structure", note: "Credit ledger + programs defined; purchasing not enabled." },
  { id: "credit-purchase", label: "Credit purchasing", state: "missing", note: "Requires payment provider." },
  { id: "gift-button", label: "Gift button on creator profiles", state: "missing", note: "For Us profiles need the Support action." },
  { id: "gift-direct", label: "Direct payment gifting", state: "missing", note: "Requires payment provider." },
  { id: "allocation", label: "Constitutional commerce allocation (8%)", state: "built", note: "3% infrastructure · 3% reserve · 2% Foundation. Commerce only." },
  { id: "gift-allocation", label: "Gift allocation (10%)", state: "built", note: "3% · 3% · 2% plus Founder-configured owner shares; recipient keeps 90%." },
  { id: "payout", label: "Recipient payout", state: "built", note: "allocate() for commerce, allocateGift() for community gifts." },
  { id: "owner-comp", label: "Owner Compensation Engine", state: "structure", note: "Per-sale percentage of clean profit; modelled, awaiting persisted ledgers." },
  { id: "owner-dist", label: "Owner Distribution Engine", state: "structure", note: "End-of-day surplus check with Founder cap; honest zeros until wired." },
  { id: "owner-equity", label: "Owner Equity ledger", state: "structure", note: "Visible, never withdrawable; accrues once ledgers persist." },
  { id: "earnings-ledgers", label: "Universal Earnings Ledger", state: "built", note: "Every income source keeps its own Available / Pending / Lifetime lines." },
  { id: "withdrawal", label: "Withdrawal workflow", state: "missing", note: "Requires payout rails and bank verification." },
  { id: "earnings", label: "Earnings dashboard", state: "structure", note: "Gift and owner cards render honest zeros." },
  { id: "history", label: "Transaction history", state: "structure", note: "Record lists present; awaiting ledger tables." },
  { id: "fraud", label: "Security & fraud protection", state: "missing", note: "Review holds route into Pending only." },
  { id: "tax", label: "Tax summaries by country", state: "structure", note: "Estimate labelling in place; rules per country pending." },
  { id: "founder", label: "Founder reporting & Daily cards", state: "built", note: "Financial snapshot in The Daily." },
];

/* ── Honest snapshot ─────────────────────────────────────────────────────── */

const NO_RECORDS: AmountRecord[] = [];

function zero(
  id: string,
  label: string,
  ledger: LedgerId,
  explain: string,
  plain: string,
  extra: Partial<TraceableAmount> = {},
): TraceableAmount {
  return {
    id,
    label,
    amount: 0,
    ledger,
    explain,
    plain,
    breakdown: [{ label: "No transactions recorded yet", value: money(0), kind: "note" }],
    records: NO_RECORDS,
    ...extra,
  };
}

export type FinanceSnapshot = {
  available: TraceableAmount;
  pending: TraceableAmount;
  lifetime: TraceableAmount;
  credits: TraceableAmount;
  gifts: TraceableAmount;
  foundation: TraceableAmount;
  taxes: TraceableAmount;
  /** Founder & Co-Founder compensation — one ledger, two cards, withdrawn together. */
  owner: TraceableAmount[];
  business: TraceableAmount[];
};

export function honestSnapshot(v: FinanceViewer): FinanceSnapshot {
  const base: FinanceSnapshot = {
    available: zero(
      "available",
      "Available balance",
      "wallet",
      "Sum of settled earnings with no remaining holds. Withdrawable immediately.",
      "This is money you can take out right now. Nothing is holding it.",
      { settlement: "immediate", actions: ["withdraw", "export"] },
    ),
    pending: zero(
      "pending",
      "Pending balance",
      "wallet",
      "Earned but not yet settled: processor settlement, refund windows, fraud review, or verification.",
      "This money is yours, it just hasn't finished clearing. When it clears it moves to Available on its own.",
      { settlement: "pending", actions: ["investigate"] },
    ),
    lifetime: zero(
      "lifetime",
      "Lifetime earnings",
      "wallet",
      "Historical gross earnings. Never reduced by withdrawals.",
      "This is everything you have ever earned here. Taking money out never lowers it.",
      { actions: ["export"] },
    ),
    credits: zero(
      "credits",
      "Frass Credits",
      "credits",
      "Prepaid and earned credits. Tracked separately from cash and never withdrawable as cash.",
      "Credits are spending power inside Frass. They aren't cash, but when you gift with them the person you send them to still gets real money.",
    ),
    gifts: zero(
      "gifts",
      "Gift earnings",
      "gifts",
      "Gifts received, after the constitutional 10% gift allocation (3% infrastructure, 3% reserve, 2% Foundation, 1% Founder, 1% Co-Founder — the owner shares are Founder-configured policy).",
      "When someone gifts you, Frass keeps 10 cents of every dollar: to run the platform, fund the Foundation, and pay the two owners who keep the place standing. You keep 90 cents.",
      { actions: ["withdraw", "export"] },
    ),
    foundation: zero(
      "foundation",
      "Foundation impact",
      "foundation",
      "The 2% Foundation allocation plus any personal giving.",
      "This is the part of the money that went to helping people, and what you personally gave.",
    ),
    taxes: zero(
      "taxes",
      "Pending taxes & settlements",
      "tax",
      "Estimated obligations by jurisdiction. Estimates only until finalised.",
      "This is roughly what may be owed in tax. It's an estimate — not a bill, and not filed for you.",
    ),
    owner: [],
    business: [],
  };

  if (v.founder) {
    base.owner = [
      zero(
        "owner-founder",
        "Founder Compensation · Available",
        "owner-compensation",
        "Per-sale owner compensation: a Founder-configured percentage of clean profit, allocated on every completed sale after cost, shipping, processing, taxes, the constitutional allocation and refund reserves.",
        "This is your paycheck. It's set aside on every single sale, and it's already yours to take out.",
        { settlement: "immediate", actions: ["withdraw", "export"] },
      ),
      zero(
        "owner-cofounder",
        "Co-Founder Compensation · Available",
        "owner-compensation",
        "The same per-sale compensation engine, held on its own ledger for the Co-Founder. Never merged with Founder compensation.",
        "The same paycheck rules, on its own line so you can both see exactly what's yours.",
        { settlement: "immediate", actions: ["withdraw", "export"] },
      ),
      zero(
        "owner-distribution-founder",
        "Founder Distribution · Available",
        "owner-distribution",
        "Capped share of end-of-day distributable surplus, offered only once reserve, operating and expansion requirements are verified.",
        "This is ownership money, not salary — what the business can safely spare at the end of a good day.",
        { settlement: "immediate", actions: ["withdraw", "export"] },
      ),
      zero(
        "owner-distribution-cofounder",
        "Co-Founder Distribution · Available",
        "owner-distribution",
        "The Co-Founder's share of the same end-of-day distributable surplus.",
        "Same ownership money, kept on its own line.",
        { settlement: "immediate", actions: ["withdraw", "export"] },
      ),
      zero(
        "owner-gift-founder",
        "Founder Gift Allocation",
        "gifts",
        "Founder-configured ownership allocation from eligible community gifts, taken inside the 10% gift allocation and recorded separately from the recipient's earnings.",
        "A small slice of every gift sent on Frass, because the platform is what made that gift possible.",
        { settlement: "immediate", actions: ["withdraw", "export"] },
      ),
      zero(
        "owner-gift-cofounder",
        "Co-Founder Gift Allocation",
        "gifts",
        "The Co-Founder's configured ownership allocation from eligible community gifts.",
        "The same slice, on the Co-Founder's own line.",
        { settlement: "immediate", actions: ["withdraw", "export"] },
      ),
      zero(
        "owner-equity",
        "Founder Equity",
        "owner-equity",
        "Accumulated ownership value: retained earnings, reinvestment and business growth over time. Not compensation, not business cash, never withdrawable.",
        "This isn't money you can take out today. It's what you've built — the value of owning Frass.",
        { actions: ["export"] },
      ),
    ];
    base.business = [
      zero("biz-revenue", "Business revenue", "business", "Gross revenue across all commerce channels.", "Everything the business sold, before any costs."),
      zero("biz-marketplace", "Marketplace revenue", "marketplace", "Revenue from marketplace orders.", "What the marketplace brought in."),
      zero("biz-digital", "Digital product revenue", "business", "Revenue from digital goods.", "Sales of things with no shipping."),
      zero("biz-physical", "Physical product revenue", "business", "Revenue from physical goods.", "Sales of things you ship."),
      zero("biz-gifts", "Gift revenue", "gifts", "Platform share of community gifts.", "The platform's slice of gifts sent in For Us."),
      zero("biz-cash", "Business cash position", "business", "Cash on hand after obligations.", "What the business actually has in the bank right now."),
      zero("biz-reserve", "Reserve vault", "business", "The 3% reserve allocation.", "The rainy-day fund."),
      zero("biz-expenses", "Operating expenses", "business", "Costs recorded against operations.", "What it costs to keep the doors open."),
      zero("biz-profit", "Net business profit", "business", "Clean profit less owner compensation. Business money, not personal money.", "What the company keeps after paying you both."),
      zero("biz-distributable", "Today's distributable surplus", "owner-distribution", "Business cash above reserve, operating and expansion requirements.", "What the business could safely spare today — and nothing more."),
    ];
  }
  return base;
}

/** The Daily's Financial Snapshot row — every figure clickable. */
export function dailySnapshot(v: FinanceViewer): TraceableAmount[] {
  const s = honestSnapshot(v);
  const rows = [s.available, s.gifts, s.credits, s.foundation, s.taxes];
  if (v.founder) rows.splice(3, 0, ...s.owner, s.business[0]!, s.business[5]!, s.business[8]!, s.business[9]!);
  return rows;
}

