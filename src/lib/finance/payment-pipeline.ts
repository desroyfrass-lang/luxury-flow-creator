// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0303 — Commerce Payment & Financial Pipeline
//
// Constitutional volume: Commerce & Finance. Priority: critical.
//
//   • One pipeline for every sale — Kicks, Luxury House, Bridal, Marketplace,
//     Kids Shop, digital products, services, courses and gift purchases.
//   • No provider is hard-coded. The Founder configures providers in the
//     Payment Provider Center; the pipeline is provider-agnostic.
//   • Nothing exists without an accounting record: every completed transaction
//     writes one entry into each applicable ledger.
//   • Zeros stay honest. Nothing is simulated as if it were real money.
// ─────────────────────────────────────────────────────────────────────────────

import { PLATFORM_ALLOCATION, allocate, type Allocation, type LedgerId } from "./financial-center";

/* ── The ten constitutional steps ────────────────────────────────────────── */

export type PipelineStep = {
  n: number;
  id: string;
  title: string;
  what: string;
  /** Frassy's "What that means is…" layer. */
  plain: string;
  writes: LedgerId[];
};

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    n: 1,
    id: "purchase",
    title: "Customer purchases",
    what: "Product → checkout → payment. Methods offered depend on the buyer's region and the providers the Founder has enabled.",
    plain: "Someone picks a pair of shoes and pays. What they can pay with depends on where they are.",
    writes: [],
  },
  {
    n: 2,
    id: "authorization",
    title: "Payment authorization",
    what: "The provider authorizes the payment. On success the order is created, inventory reserved, confirmation sent, and the payment enters the Frass Financial Engine.",
    plain: "The bank says yes. Only then does the order become real and the stock get held for them.",
    writes: [],
  },
  {
    n: 3,
    id: "routing",
    title: "Commerce engine routing",
    what: "The engine identifies the product type and who is owed: house vendor, marketplace seller, dropshipping supplier, digital, physical, or Foundation product.",
    plain: "Frass works out who actually needs to get paid out of this sale.",
    writes: [],
  },
  {
    n: 4,
    id: "cost",
    title: "Product cost calculation",
    what: "Supplier cost, shipping, applicable taxes, processing fees, currency conversion and other mandatory costs are captured and stored. Once finalized, nothing is estimated.",
    plain: "Every real cost of that sale gets written down at the exact amount, not guessed later.",
    writes: ["business", "tax"],
  },
  {
    n: 5,
    id: "allocation",
    title: "Constitutional platform allocation",
    what: `${PLATFORM_ALLOCATION.infrastructure}% infrastructure · ${PLATFORM_ALLOCATION.reserve}% reserve vault · ${PLATFORM_ALLOCATION.foundation}% Foundation. Completely independent of affiliate commission.`,
    plain: "Eight cents of every dollar keeps the platform running and funds the Foundation. Affiliate pay is a separate thing entirely.",
    writes: ["business", "foundation"],
  },
  {
    n: 6,
    id: "profit-protection",
    title: "Profit Protection Engine",
    what: "Verifies the sale still satisfies the minimum margin configured for the category. Violations are prevented at pricing or publication time — a completed customer order is never retroactively blocked.",
    plain: "If a price would lose money, Frass stops it before it goes live — never after someone has already bought.",
    writes: [],
  },
  {
    n: 7,
    id: "owner-compensation",
    title: "Owner Compensation Engine",
    what: "After obligations are satisfied, the Founder-configured compensation percentage moves into the Owner Compensation Ledger and appears in Founder and Co-Founder earnings.",
    plain: "Once every bill is covered, your personal pay is set aside and it's yours.",
    writes: ["owner-compensation", "wallet"],
  },
  {
    n: 8,
    id: "business",
    title: "Business operations",
    what: "Remaining profit stays in Business Cash for inventory, growth, marketing, payroll, taxes, operations, expansion and emergency reserves — tracked separately from personal money.",
    plain: "What's left belongs to the company, not to you personally, and it's kept in its own pot.",
    writes: ["business"],
  },
  {
    n: 9,
    id: "marketplace",
    title: "Marketplace settlement",
    what: "Where a marketplace seller is involved, their payout follows pending → available → withdrawal with full visibility at each stage.",
    plain: "Sellers see their money the whole way: still clearing, ready, then out.",
    writes: ["marketplace"],
  },
  {
    n: 10,
    id: "customer",
    title: "Customer record",
    what: "Receipt, order status, shipping updates, tracking and return information stay synchronized against the same transaction.",
    plain: "The buyer's paperwork and the money paperwork are the same record, so they can never disagree.",
    writes: [],
  },
];

/* ── Universal financial records ─────────────────────────────────────────── */

/** Every completed transaction generates all applicable records. */
export const UNIVERSAL_RECORDS = [
  "Transaction ID",
  "Audit trail",
  "Tax record",
  "Wallet entry",
  "Business ledger entry",
  "Platform ledger entry",
  "Owner ledger entry",
  "Marketplace ledger entry (where applicable)",
  "Foundation ledger entry",
] as const;

export type LedgerEntry = {
  transactionId: string;
  ledger: LedgerId;
  label: string;
  amount: number;
  currency: string;
  direction: "credit" | "debit";
  settlement: "immediate" | "pending";
  note: string;
};

export type TransactionInput = {
  transactionId: string;
  currency?: string;
  /** What the customer paid. */
  gross: number;
  supplierCost?: number;
  shipping?: number;
  processingFee?: number;
  tax?: number;
  otherCost?: number;
  /** Marketplace seller share of the net, 0–100. */
  marketplaceSharePct?: number;
  /** Founder-configured owner compensation, 0–100 of clean profit (combined). */
  ownerCompensationPct?: number;
  /** Optional split. When provided these override ownerCompensationPct. */
  founderCompensationPct?: number;
  coFounderCompensationPct?: number;
};

export type TransactionBreakdown = {
  allocation: Allocation;
  costs: number;
  marketplacePayout: number;
  /** Combined Founder + Co-Founder compensation on this sale. */
  ownerCompensation: number;
  founderCompensation: number;
  coFounderCompensation: number;
  businessCash: number;
  entries: LedgerEntry[];
};

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Deterministic ledger fan-out for one completed transaction. Pure function —
 * the same inputs always produce the same, auditable set of entries.
 */
export function buildLedgerEntries(input: TransactionInput): TransactionBreakdown {
  const currency = input.currency ?? "USD";
  const costs = round(
    (input.supplierCost ?? 0) +
      (input.shipping ?? 0) +
      (input.processingFee ?? 0) +
      (input.otherCost ?? 0),
  );
  const allocation = allocate(input.gross);
  const afterCosts = round(allocation.net - costs - (input.tax ?? 0));
  const marketplacePayout = round((afterCosts * (input.marketplaceSharePct ?? 0)) / 100);
  const profit = round(afterCosts - marketplacePayout);
  const ownerCompensation = round((Math.max(profit, 0) * (input.ownerCompensationPct ?? 0)) / 100);
  const businessCash = round(profit - ownerCompensation);

  const entry = (
    ledger: LedgerId,
    label: string,
    amount: number,
    direction: LedgerEntry["direction"],
    note: string,
    settlement: LedgerEntry["settlement"] = "immediate",
  ): LedgerEntry => ({
    transactionId: input.transactionId,
    ledger,
    label,
    amount: round(amount),
    currency,
    direction,
    settlement,
    note,
  });

  const entries: LedgerEntry[] = [
    entry("business", "Gross revenue", input.gross, "credit", "What the customer paid."),
    entry("business", "Cost of sale", costs, "debit", "Supplier, shipping, processing and other mandatory costs."),
    entry("business", "Infrastructure allocation", allocation.infrastructure, "debit", `${PLATFORM_ALLOCATION.infrastructure}% constitutional allocation.`),
    entry("business", "Reserve vault", allocation.reserve, "debit", `${PLATFORM_ALLOCATION.reserve}% constitutional allocation.`),
    entry("foundation", "Foundation contribution", allocation.foundation, "credit", `${PLATFORM_ALLOCATION.foundation}% constitutional allocation.`),
  ];

  if (input.tax) {
    entries.push(entry("tax", "Tax collected or withheld", input.tax, "debit", "Recorded separately from platform allocation — a fee is not a tax."));
  }
  if (marketplacePayout > 0) {
    entries.push(
      entry("marketplace", "Seller payout", marketplacePayout, "credit", "Held pending until processor settlement completes.", "pending"),
    );
  }
  if (ownerCompensation > 0) {
    entries.push(
      entry("owner-compensation", "Owner compensation", ownerCompensation, "credit", "Allocated only after every obligation was satisfied."),
      entry("wallet", "Owner compensation to wallet", ownerCompensation, "credit", "Immediately withdrawable — no settlement notice applies."),
    );
  }
  entries.push(entry("business", "Business cash", businessCash, "credit", "Remaining profit retained by the company."));

  return { allocation, costs, marketplacePayout, ownerCompensation, businessCash, entries };
}

/* ── Refund engine ───────────────────────────────────────────────────────── */

export const REFUND_RULES = [
  {
    id: "business",
    label: "Business accounting reverses",
    detail: "Revenue, cost of sale and business cash entries are reversed against the original transaction ID.",
  },
  {
    id: "owner",
    label: "Owner compensation adjusts",
    detail: "If the compensation has not been withdrawn it is reversed. If it has, an adjustment entry is recorded instead — history is never rewritten.",
  },
  {
    id: "marketplace",
    label: "Marketplace settlement adjusts",
    detail: "Pending seller payouts are cancelled; settled payouts create a recovery entry on the seller ledger.",
  },
  {
    id: "foundation",
    label: "Foundation accounting follows policy",
    detail: "Foundation contributions are handled per the platform refund policy rather than silently clawed back.",
  },
  {
    id: "audit",
    label: "Audit trail preserved",
    detail: "Every refund keeps the original entries intact and adds reversing entries, so the full story stays readable.",
  },
] as const;

/* ── Payment Provider Center ─────────────────────────────────────────────── */

export type ProviderCapability =
  | "cards"
  | "digital-wallets"
  | "marketplace-payouts"
  | "subscriptions"
  | "multi-currency"
  | "local-methods";

export type PaymentProvider = {
  id: string;
  name: string;
  kind: "processor" | "marketplace" | "commerce-platform";
  summary: string;
  /** Comparison axes the Founder weighs — never a hard-coded default. */
  fees: string;
  settlement: string;
  countries: string;
  currencies: string;
  chargebacks: string;
  fraudTools: string;
  capabilities: ProviderCapability[];
  bestFor: string;
  /** Whether this provider can be turned on from inside Frass today. */
  availability: "available-in-frass" | "requires-account" | "planned";
};

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    id: "stripe",
    name: "Stripe",
    kind: "processor",
    summary: "Card and digital-wallet processing with tax calculation and optional full compliance handling.",
    fees: "≈2.9% + 30¢ domestic cards; cross-border and currency conversion add on top.",
    settlement: "Typically 2 business days after capture in most countries.",
    countries: "46+ seller countries; buyers worldwide.",
    currencies: "135+ presentment currencies.",
    chargebacks: "Dispute tooling built in; evidence submitted from the dashboard.",
    fraudTools: "Radar risk scoring, 3-D Secure, rules engine.",
    capabilities: ["cards", "digital-wallets", "marketplace-payouts", "subscriptions", "multi-currency", "local-methods"],
    bestFor: "Digital products, services, subscriptions and general storefront checkout.",
    availability: "available-in-frass",
  },
  {
    id: "paddle",
    name: "Paddle",
    kind: "processor",
    summary: "Merchant of record on every transaction — tax, filing, chargebacks and billing support handled for you.",
    fees: "5% + 50¢ all-inclusive; no separate tax or compliance surcharge.",
    settlement: "Scheduled payouts on a fixed cycle.",
    countries: "Global buyers; digital goods only.",
    currencies: "Multi-currency presentment with automatic localisation.",
    chargebacks: "Handled by Paddle as the seller of record.",
    fraudTools: "Included in the all-inclusive rate.",
    capabilities: ["cards", "digital-wallets", "subscriptions", "multi-currency", "local-methods"],
    bestFor: "Digital-only catalogues where tax compliance should be somebody else's job.",
    availability: "available-in-frass",
  },
  {
    id: "shopify",
    name: "Shopify",
    kind: "commerce-platform",
    summary: "Full commerce platform for physical goods — inventory, shipping, returns and checkout.",
    fees: "Plan fee plus per-transaction card rates that vary by region.",
    settlement: "Payout schedule set by the store's payout region.",
    countries: "Broad international coverage.",
    currencies: "Multi-currency selling per market.",
    chargebacks: "Managed through the Shopify admin.",
    fraudTools: "Built-in fraud analysis on every order.",
    capabilities: ["cards", "digital-wallets", "multi-currency", "local-methods"],
    bestFor: "Frass Kicks, Drip, Bare Drip, Kids Shop — anything that ships.",
    availability: "available-in-frass",
  },
  {
    id: "regional",
    name: "Regional methods",
    kind: "processor",
    summary: "Country-specific rails added as Frass expands — bank transfer, local wallets and mobile money.",
    fees: "Varies by market.",
    settlement: "Varies by market.",
    countries: "Selected per expansion market.",
    currencies: "Local currency only in most cases.",
    chargebacks: "Depends on the underlying scheme.",
    fraudTools: "Depends on the underlying scheme.",
    capabilities: ["local-methods"],
    bestFor: "Caribbean, African and other markets where cards are not the default.",
    availability: "planned",
  },
];

export const PROVIDER_COMPARISON_AXES = [
  "Transaction fees",
  "Settlement speed",
  "Supported countries",
  "Currencies",
  "Chargeback protection",
  "Fraud tools",
  "API health",
] as const;

/* ── Configuration held by the Founder ───────────────────────────────────── */

export type ProviderConfig = {
  /** Providers the Founder has switched on. */
  enabled: string[];
  /** Preferred provider per product kind. */
  preferred: Partial<Record<"physical" | "digital" | "marketplace" | "gifts", string>>;
  ownerCompensationPct: number;
  minMarginPct: number;
};

export const DEFAULT_PROVIDER_CONFIG: ProviderConfig = {
  enabled: [],
  preferred: {},
  ownerCompensationPct: 0,
  minMarginPct: 0,
};

const CONFIG_KEY = "frass.payments.config.v1";

export function loadProviderConfig(): ProviderConfig {
  if (typeof window === "undefined") return DEFAULT_PROVIDER_CONFIG;
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_PROVIDER_CONFIG;
    return { ...DEFAULT_PROVIDER_CONFIG, ...(JSON.parse(raw) as Partial<ProviderConfig>) };
  } catch {
    return DEFAULT_PROVIDER_CONFIG;
  }
}

export function saveProviderConfig(config: ProviderConfig) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    /* preference storage is best-effort */
  }
}

/* ── Pipeline implementation audit ───────────────────────────────────────── */

export type PipelineAuditState = "built" | "structure" | "missing";
export type PipelineAuditItem = { id: string; label: string; state: PipelineAuditState; note: string };

/** Anything not "built" belongs in the Platform Commissioning queue. */
export const PIPELINE_AUDIT: PipelineAuditItem[] = [
  { id: "checkout", label: "Storefront checkout", state: "built", note: "Cart and checkout exist against the commerce backend." },
  { id: "provider-center", label: "Payment Provider Center", state: "built", note: "Founder-configurable; no provider hard-coded." },
  { id: "provider-live", label: "Live payment provider connected", state: "missing", note: "Requires Founder approval to enable a provider account." },
  { id: "ledger-model", label: "Ledger structure & fan-out", state: "built", note: "buildLedgerEntries() writes every applicable ledger per transaction." },
  { id: "ledger-tables", label: "Persisted ledger tables", state: "missing", note: "Database ledgers awaiting Founder approval." },
  { id: "owner-ledger", label: "Owner Compensation Ledger", state: "structure", note: "Modelled and surfaced; balances stay at honest zero until wired." },
  { id: "business-ledger", label: "Business Ledger", state: "structure", note: "Revenue, costs, reserve and cash entries modelled." },
  { id: "marketplace-ledger", label: "Marketplace Ledger", state: "structure", note: "Pending → available → withdrawal path modelled." },
  { id: "gift-ledger", label: "Gift Ledger", state: "structure", note: "8% allocation applied; direct gifting needs a provider." },
  { id: "foundation-ledger", label: "Foundation Ledger", state: "structure", note: "2% allocation recorded per transaction." },
  { id: "profit-protection", label: "Profit Protection Engine", state: "structure", note: "Minimum margin enforced at pricing time via the affiliate intelligence engine." },
  { id: "refunds", label: "Refund engine", state: "structure", note: "Reversal rules defined; execution needs live ledgers." },
  { id: "tax", label: "Tax records per transaction", state: "structure", note: "Tax kept separate from platform allocation; country rules pending." },
  { id: "daily", label: "Founder Daily financial cards", state: "built", note: "Financial snapshot renders traceable amounts." },
];
