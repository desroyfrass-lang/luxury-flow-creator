// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0433 — Financial Integrity & Audit Constitution
//
// Constitutional principle:
//   "No money becomes mystery money."
//
// Every dollar that enters or leaves the Frass ecosystem produces a permanent
// receipt. A member should always be able to answer four questions without
// accounting knowledge: where did it come from, why did I receive it, where did
// it go, and why was it deducted.
//
// What this means in plain English: every movement of money leaves a paper
// trail, written in words a person can read — not a bank statement code.
// ─────────────────────────────────────────────────────────────────────────────

import { money, PLATFORM_ALLOCATION } from "./financial-center";

export const AUDIT_PRINCIPLES = [
  {
    id: "receipt",
    title: "Every transaction receives a receipt",
    explain:
      "Each financial event writes an immutable receipt row carrying gross, allocations, fees, net, status and counterparty.",
    plain: "Nothing happens silently. If money moved, there is a record of it.",
  },
  {
    id: "explain",
    title: "Every dollar is explained",
    explain:
      "Receipts render a gross → deductions → net breakdown with a plain-language line for every deduction.",
    plain: "You see the sale price, what Frass kept, what the card processor kept, and what landed with you.",
  },
  {
    id: "reconcile",
    title: "Balances reconcile to receipts",
    explain: "Available, pending and lifetime balances are computed from receipts, never stored as loose totals.",
    plain: "Your balance is just the receipts added up. It can never drift.",
  },
  {
    id: "immutable",
    title: "Settled records are immutable",
    explain:
      "The database refuses updates and deletes on settled, refunded or withdrawn receipts. Corrections are separate adjustment entries.",
    plain: "History is never rewritten. A mistake is fixed by adding a correction, not by erasing the past.",
  },
  {
    id: "assistant",
    title: "Frassy can explain any movement",
    explain: "Receipt history is available to the assistant so any transaction can be narrated on request.",
    plain: "You can just ask: “where did this payment come from?” and get a straight answer.",
  },
] as const;

/* ── The catalogue of financial events ───────────────────────────────────── */

export type ReceiptDirection = "in" | "out";

export type ReceiptKindId =
  | "marketplace_sale"
  | "quick_sell"
  | "gift_received"
  | "gift_sent"
  | "tip_received"
  | "direct_payment"
  | "affiliate_commission"
  | "recruitment_bonus"
  | "brand_partnership"
  | "radio_royalty"
  | "studio_revenue"
  | "course_sale"
  | "refund"
  | "chargeback"
  | "withdrawal"
  | "deposit"
  | "founder_allocation"
  | "business_distribution"
  | "adjustment";

export type ReceiptKind = {
  id: ReceiptKindId;
  label: string;
  direction: ReceiptDirection;
  icon: string;
  /** Technical description of the event. */
  explain: string;
  /** Frassy's "what that means is…" layer. */
  plain: string;
  /** Whether the constitutional 90/10 split applies to this event. */
  allocated: boolean;
};

export const RECEIPT_KINDS: ReceiptKind[] = [
  {
    id: "marketplace_sale",
    label: "Marketplace Sale",
    direction: "in",
    icon: "🏪",
    explain: "A buyer completed an order against one of your listings.",
    plain: "Someone bought something from you.",
    allocated: true,
  },
  {
    id: "quick_sell",
    label: "Quick Sell",
    direction: "in",
    icon: "⚡",
    explain: "A sale taken directly from your Frass Card terminal.",
    plain: "You sold something on the spot from your card.",
    allocated: true,
  },
  {
    id: "gift_received",
    label: "Gift Received",
    direction: "in",
    icon: "🎁",
    explain: "A community gift sent to you, after the constitutional gift allocation.",
    plain: "Someone sent you money because they liked what you're doing.",
    allocated: true,
  },
  {
    id: "gift_sent",
    label: "Gift Sent",
    direction: "out",
    icon: "💝",
    explain: "A gift you sent to another member.",
    plain: "You sent someone a gift.",
    allocated: false,
  },
  {
    id: "tip_received",
    label: "Tip Received",
    direction: "in",
    icon: "🙏",
    explain: "A tip left on your Frass Card.",
    plain: "A thank-you for your work.",
    allocated: true,
  },
  {
    id: "direct_payment",
    label: "Payment Received",
    direction: "in",
    icon: "💳",
    explain: "A direct payment made through the Pay door on your Frass Card.",
    plain: "Someone paid you directly.",
    allocated: true,
  },
  {
    id: "affiliate_commission",
    label: "Affiliate Commission",
    direction: "in",
    icon: "🔗",
    explain: "Commission on a sale attributed to your Frass Link.",
    plain: "You sent a buyer to a product and earned a share of the sale.",
    allocated: false,
  },
  {
    id: "recruitment_bonus",
    label: "Recruitment Bonus",
    direction: "in",
    icon: "🌱",
    explain: "A one-time bonus paid when someone you invited reached an activation milestone.",
    plain: "Somebody you brought in got going, and you were paid for it.",
    allocated: false,
  },
  {
    id: "brand_partnership",
    label: "Brand Partnership",
    direction: "in",
    icon: "🤝",
    explain: "Contracted brand partnership revenue.",
    plain: "A brand paid for work you did with them.",
    allocated: true,
  },
  {
    id: "radio_royalty",
    label: "Radio Royalties",
    direction: "in",
    icon: "📻",
    explain: "Play-based royalty accrued on Frass Radio.",
    plain: "Your music got played, so you got paid.",
    allocated: true,
  },
  {
    id: "studio_revenue",
    label: "FV Studios Revenue",
    direction: "in",
    icon: "🎬",
    explain: "Revenue from work produced or licensed through Frass Vision Studios.",
    plain: "Money from what you made in the studio.",
    allocated: true,
  },
  {
    id: "course_sale",
    label: "Course Sale",
    direction: "in",
    icon: "🎓",
    explain: "An Academy enrolment against a course you own.",
    plain: "Someone paid to learn from you.",
    allocated: true,
  },
  {
    id: "refund",
    label: "Refund",
    direction: "out",
    icon: "↩️",
    explain: "A completed sale returned to the buyer. Allocations are reversed with it.",
    plain: "A sale was given back, so the money came back out.",
    allocated: false,
  },
  {
    id: "chargeback",
    label: "Chargeback",
    direction: "out",
    icon: "⚠️",
    explain: "A buyer's bank reversed a payment. Funds and fees are withdrawn pending dispute.",
    plain: "A buyer's bank pulled the payment back while it's disputed.",
    allocated: false,
  },
  {
    id: "withdrawal",
    label: "Withdrawal",
    direction: "out",
    icon: "🏦",
    explain: "Available balance moved to your own bank or payout account.",
    plain: "You moved your money out to your bank.",
    allocated: false,
  },
  {
    id: "deposit",
    label: "Deposit",
    direction: "in",
    icon: "⬇️",
    explain: "Funds added into your Frass balance from an outside account.",
    plain: "You put money in.",
    allocated: false,
  },
  {
    id: "founder_allocation",
    label: "Founder Allocation",
    direction: "in",
    icon: "👑",
    explain:
      "The constitutional Founder / Co-Founder share, taken from inside the 10% platform allocation — never on top of it.",
    plain: "The owner's share of a sale. It comes out of the platform's 10%, not out of the creator's 90%.",
    allocated: false,
  },
  {
    id: "business_distribution",
    label: "Business Distribution",
    direction: "in",
    icon: "💼",
    explain: "A capped share of end-of-day distributable surplus. Ownership, not payroll.",
    plain: "A share of what the business had left over after everything was paid.",
    allocated: false,
  },
  {
    id: "adjustment",
    label: "Adjustment",
    direction: "in",
    icon: "🧮",
    explain: "A correction entry. Settled history is never rewritten — a correction is its own record.",
    plain: "A fix for an earlier mistake, recorded openly instead of quietly changing the old entry.",
    allocated: false,
  },
];

export function receiptKind(id: string): ReceiptKind {
  return (
    RECEIPT_KINDS.find((k) => k.id === id) ?? {
      id: "adjustment",
      label: "Transaction",
      direction: "in",
      icon: "•",
      explain: "A financial movement on your account.",
      plain: "Money moved on your account.",
      allocated: false,
    }
  );
}

/* ── Status vocabulary ───────────────────────────────────────────────────── */

export type ReceiptStatus = "pending" | "settled" | "refunded" | "withdrawn" | "cancelled";

export const RECEIPT_STATUS: Record<ReceiptStatus, { label: string; plain: string; tone: string }> = {
  pending: {
    label: "Pending",
    plain: "The payment has been made but hasn't finished clearing yet. It can't be withdrawn until it settles.",
    tone: "amber",
  },
  settled: {
    label: "Settled",
    plain: "Cleared and counted. This money is yours and available.",
    tone: "emerald",
  },
  refunded: {
    label: "Refunded",
    plain: "This went back to the buyer, so it no longer counts towards your balance.",
    tone: "rose",
  },
  withdrawn: {
    label: "Withdrawn",
    plain: "This money has already been paid out to your own account.",
    tone: "sky",
  },
  cancelled: {
    label: "Cancelled",
    plain: "This transaction never completed, so no money changed hands.",
    tone: "zinc",
  },
};

/* ── The receipt itself ──────────────────────────────────────────────────── */

export type Receipt = {
  id: string;
  kind: ReceiptKindId | string;
  direction: ReceiptDirection;
  source: string;
  title: string;
  description?: string | null;
  counterparty?: string | null;
  gross: number;
  platformAllocation: number;
  processingFee: number;
  otherDeductions: number;
  net: number;
  currency: string;
  status: ReceiptStatus;
  reference?: string | null;
  occurredAt: string;
  /** True when the row is derived from another table rather than stored directly. */
  derived?: boolean;
};

export type ReceiptLine = { label: string; value: string; kind: "gross" | "deduction" | "net" | "note" };

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Gross → deductions → net, in words anyone can follow. */
export function receiptBreakdown(receipt: Receipt): ReceiptLine[] {
  const c = receipt.currency;
  const lines: ReceiptLine[] = [
    {
      label: receipt.direction === "out" ? "Amount" : "Amount received",
      value: money(receipt.gross, c),
      kind: "gross",
    },
  ];

  if (receipt.platformAllocation > 0) {
    lines.push({
      label: `Platform allocation (${PLATFORM_ALLOCATION.total}%)`,
      value: `− ${money(receipt.platformAllocation, c)}`,
      kind: "deduction",
    });
  }
  if (receipt.processingFee > 0) {
    lines.push({
      label: "Payment processing fee",
      value: `− ${money(receipt.processingFee, c)}`,
      kind: "deduction",
    });
  }
  if (receipt.otherDeductions > 0) {
    lines.push({ label: "Other deductions", value: `− ${money(receipt.otherDeductions, c)}`, kind: "deduction" });
  }

  lines.push({
    label: receipt.direction === "out" ? "Net out" : "Net to you",
    value: money(receipt.net, c),
    kind: "net",
  });
  lines.push({ label: "Status", value: RECEIPT_STATUS[receipt.status].label, kind: "note" });
  return lines;
}

/** One paragraph Frassy can read aloud. */
export function explainReceipt(receipt: Receipt): string {
  const k = receiptKind(receipt.kind);
  const c = receipt.currency;
  const who = receipt.counterparty ? ` from ${receipt.counterparty}` : "";
  const parts: string[] = [`${k.label}${who}: ${k.plain}`];

  if (receipt.direction === "in") {
    parts.push(`The full amount was ${money(receipt.gross, c)}.`);
    if (receipt.platformAllocation > 0) {
      parts.push(
        `Frass kept ${money(receipt.platformAllocation, c)} — the constitutional ${PLATFORM_ALLOCATION.total}% platform allocation, which already includes the Founder and Co-Founder share.`,
      );
    }
    if (receipt.processingFee > 0) {
      parts.push(`The card processor charged ${money(receipt.processingFee, c)} to move the money.`);
    }
    parts.push(`That left ${money(receipt.net, c)} for you.`);
  } else {
    parts.push(`${money(receipt.gross, c)} left your balance.`);
  }

  parts.push(RECEIPT_STATUS[receipt.status].plain);
  return parts.join(" ");
}

/* ── Reconciliation: balances are receipts added up ──────────────────────── */

export type ReceiptTotals = {
  available: number;
  pending: number;
  lifetimeIn: number;
  lifetimeOut: number;
  allocation: number;
  processing: number;
  refunded: number;
  withdrawn: number;
  count: number;
  currency: string;
};

export function reconcile(receipts: Receipt[]): ReceiptTotals {
  const t: ReceiptTotals = {
    available: 0,
    pending: 0,
    lifetimeIn: 0,
    lifetimeOut: 0,
    allocation: 0,
    processing: 0,
    refunded: 0,
    withdrawn: 0,
    count: receipts.length,
    currency: receipts[0]?.currency ?? "USD",
  };

  for (const r of receipts) {
    if (r.status === "cancelled") continue;
    if (r.status === "refunded") {
      t.refunded += r.gross;
      continue;
    }
    if (r.direction === "out") {
      t.lifetimeOut += r.gross;
      if (r.kind === "withdrawal" || r.status === "withdrawn") t.withdrawn += r.gross;
      if (r.status !== "pending") t.available -= r.net || r.gross;
      continue;
    }
    t.allocation += r.platformAllocation;
    t.processing += r.processingFee;
    if (r.status === "pending") {
      t.pending += r.net;
    } else if (r.status === "withdrawn") {
      t.lifetimeIn += r.net;
      t.withdrawn += r.net;
    } else {
      t.available += r.net;
      t.lifetimeIn += r.net;
    }
  }

  return {
    ...t,
    available: r2(Math.max(t.available, 0)),
    pending: r2(t.pending),
    lifetimeIn: r2(t.lifetimeIn),
    lifetimeOut: r2(t.lifetimeOut),
    allocation: r2(t.allocation),
    processing: r2(t.processing),
    refunded: r2(t.refunded),
    withdrawn: r2(t.withdrawn),
  };
}

/** Plain-English proof that a balance is nothing more than its receipts. */
export function reconciliationStatement(t: ReceiptTotals): string {
  return `${t.count} receipt${t.count === 1 ? "" : "s"} add up to ${money(t.available, t.currency)} available and ${money(
    t.pending,
    t.currency,
  )} still settling. ${money(t.allocation, t.currency)} went to the platform allocation and ${money(
    t.processing,
    t.currency,
  )} to payment processing. Nothing here is stored as a loose total — every figure is the receipts added up.`;
}

/* ── Timeline filters ────────────────────────────────────────────────────── */

export const TIMELINE_FILTERS = [
  { id: "all", label: "Everything" },
  { id: "in", label: "Money in" },
  { id: "out", label: "Money out" },
  { id: "pending", label: "Pending" },
  { id: "settled", label: "Settled" },
  { id: "refunded", label: "Refunded" },
  { id: "withdrawn", label: "Withdrawn" },
] as const;

export type TimelineFilterId = (typeof TIMELINE_FILTERS)[number]["id"];

export const TIMELINE_RANGES = [
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "90", label: "Last 90 days", days: 90 },
  { id: "365", label: "Last 12 months", days: 365 },
  { id: "all", label: "All time", days: 0 },
] as const;

export type TimelineRangeId = (typeof TIMELINE_RANGES)[number]["id"];

export function filterReceipts(
  receipts: Receipt[],
  opts: { filter?: TimelineFilterId; range?: TimelineRangeId; kind?: string | null; query?: string },
): Receipt[] {
  const { filter = "all", range = "all", kind = null, query = "" } = opts;
  const cutoff =
    range === "all" ? 0 : Date.now() - (TIMELINE_RANGES.find((r) => r.id === range)?.days ?? 0) * 86_400_000;
  const q = query.trim().toLowerCase();

  return receipts.filter((r) => {
    if (cutoff && new Date(r.occurredAt).getTime() < cutoff) return false;
    if (kind && r.kind !== kind) return false;
    if (filter === "in" && r.direction !== "in") return false;
    if (filter === "out" && r.direction !== "out") return false;
    if (["pending", "settled", "refunded", "withdrawn"].includes(filter) && r.status !== filter) return false;
    if (q) {
      const hay = `${r.title} ${r.counterparty ?? ""} ${receiptKind(r.kind).label} ${r.reference ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Group a timeline by month for a readable feed. */
export function groupByMonth(receipts: Receipt[]): Array<{ month: string; items: Receipt[]; net: number }> {
  const map = new Map<string, Receipt[]>();
  for (const r of receipts) {
    const key = new Date(r.occurredAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    map.set(key, [...(map.get(key) ?? []), r]);
  }
  return [...map.entries()].map(([month, items]) => ({
    month,
    items,
    net: r2(items.reduce((sum, r) => sum + (r.direction === "in" ? r.net : -r.gross), 0)),
  }));
}

/* ── Export ──────────────────────────────────────────────────────────────── */

export function receiptsCsv(receipts: Receipt[]): string {
  const head = [
    "date",
    "type",
    "direction",
    "title",
    "counterparty",
    "gross",
    "platform_allocation",
    "processing_fee",
    "other_deductions",
    "net",
    "currency",
    "status",
    "reference",
  ].join(",");
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = receipts.map((r) =>
    [
      r.occurredAt,
      receiptKind(r.kind).label,
      r.direction,
      r.title,
      r.counterparty ?? "",
      r.gross,
      r.platformAllocation,
      r.processingFee,
      r.otherDeductions,
      r.net,
      r.currency,
      r.status,
      r.reference ?? "",
    ]
      .map(esc)
      .join(","),
  );
  return [head, ...rows].join("\n");
}
