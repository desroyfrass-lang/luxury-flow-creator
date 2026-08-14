// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0484 — Frassy Tax Intelligence · "Taxes Without Stress"
//
// Constitutional position: this is NOT a second financial system. There is no
// new ledger, no new receipt store, no parallel reporting. Every number below
// is derived from the receipts the Financial Center already owns
// (`src/lib/finance/receipts.ts` + `receipts.functions.ts`), which in turn
// already absorb orders, marketplace sales, service income, affiliate
// commissions, recruitment bonuses and creator earnings.
//
// Constitutional rule: every financial transaction inside Frass automatically
// becomes part of the member's financial history. Frassy organises all year —
// taxes are a year-round process, never a yearly panic.
//
// Confidence rule (the safeguard): Frassy never invents tax advice. Every
// statement is labelled by where it came from:
//   • "records"      — arithmetic on the member's own receipts. Reliable.
//   • "configured"   — a rate/threshold from the country config below.
//   • "verify"       — requires current professional or official confirmation.
// ─────────────────────────────────────────────────────────────────────────────

import { money } from "@/lib/finance/financial-center";
import type { Receipt } from "@/lib/finance/receipts";

/* ── Where a statement comes from ────────────────────────────────────────── */

export type Confidence = "records" | "configured" | "verify";

export const CONFIDENCE_LABEL: Record<Confidence, { label: string; plain: string; tone: string }> = {
  records: {
    label: "From your records",
    plain: "This is simply your own receipts added up. Nothing was assumed.",
    tone: "emerald",
  },
  configured: {
    label: "From configured tax rules",
    plain: "This uses a rate Frass has on file for your country. Rates change — treat it as a planning estimate.",
    tone: "amber",
  },
  verify: {
    label: "Needs professional confirmation",
    plain: "Frassy will not guess here. Confirm this with a qualified tax professional or your tax authority.",
    tone: "rose",
  },
};

/* ── Constitutional boundary ─────────────────────────────────────────────── */

export const TAX_CONSTITUTION = [
  "Every transaction inside Frass automatically enters the member's financial history — no separate bookkeeping.",
  "Frassy organises, categorises and prepares all year long, not at year end.",
  "Frassy prepares taxes. She is never the legal tax authority.",
  "Members remain responsible for reviewing and filing under the laws of their country.",
  "Frassy never invents tax advice — she separates records, configured rules and things needing confirmation.",
  "Where a filing needs it, members are encouraged to have a qualified tax professional review.",
] as const;

export const PROFESSIONAL_NOTICE =
  "Frassy is an intelligent organizer and preparer — not a substitute for licensed professional advice. " +
  "Review your package, and where your country requires it, have a qualified tax professional confirm before filing.";

/* ── Categories (income + deductible expense) ────────────────────────────── */

export type TaxFlow = "income" | "expense";

export type TaxCategory = {
  id: string;
  label: string;
  flow: TaxFlow;
  /** Everyday-language description shown to the member. */
  plain: string;
  /** Receipt kinds that map here automatically. */
  kinds: string[];
};

export const TAX_CATEGORIES: TaxCategory[] = [
  // Income
  { id: "marketplace_sales", label: "Marketplace sales", flow: "income", plain: "Money from things you sold in the marketplace.", kinds: ["marketplace_sale", "quick_sell", "direct_payment"] },
  { id: "service_income", label: "Service income", flow: "income", plain: "Money from services you performed for someone.", kinds: ["service_booking", "service_payment", "booking_payment"] },
  { id: "affiliate_income", label: "Affiliate commissions", flow: "income", plain: "Money earned for sending customers to a product.", kinds: ["affiliate_commission", "recruitment_bonus"] },
  { id: "creator_income", label: "Creator income", flow: "income", plain: "Money from broadcasts, gifts, tips and creative work.", kinds: ["gift_received", "tip_received", "studio_revenue", "radio_royalty", "brand_partnership"] },
  { id: "digital_products", label: "Digital product sales", flow: "income", plain: "Money from downloads, templates, presets and other digital goods.", kinds: ["digital_sale", "course_sale"] },
  { id: "subscription_income", label: "Subscription income", flow: "income", plain: "Recurring money from members or subscribers.", kinds: ["subscription", "membership"] },
  // Expense
  { id: "platform_fees", label: "Platform fees", flow: "expense", plain: "The Frass ecosystem allocation and processing fees taken from your sales.", kinds: ["platform_fee", "processing_fee"] },
  { id: "refunds", label: "Refunds issued", flow: "expense", plain: "Money you gave back to a customer.", kinds: ["refund", "chargeback"] },
  { id: "shipping_costs", label: "Shipping & freight", flow: "expense", plain: "What it cost to get goods to your customer.", kinds: ["shipping_cost", "freight_cost", "customs_duty"] },
  { id: "advertising", label: "Advertising & promotion", flow: "expense", plain: "What you spent to get seen.", kinds: ["ad_spend", "promotion"] },
  { id: "equipment", label: "Equipment & supplies", flow: "expense", plain: "Cameras, tools, materials and other gear bought for the business.", kinds: ["equipment", "supplies"] },
  { id: "software", label: "Software & credits", flow: "expense", plain: "Tools and AI credits used to run the business.", kinds: ["credit_purchase", "software"] },
  { id: "other_expense", label: "Other business expenses", flow: "expense", plain: "Anything else you spent to run the business.", kinds: ["business_expense"] },
];

const KIND_INDEX: Record<string, TaxCategory> = (() => {
  const map: Record<string, TaxCategory> = {};
  for (const c of TAX_CATEGORIES) for (const k of c.kinds) map[k] = c;
  return map;
})();

/** Automatic categorisation. Returns null when a human still needs to decide. */
export function categorize(receipt: Pick<Receipt, "kind" | "direction">): TaxCategory | null {
  const direct = KIND_INDEX[String(receipt.kind)];
  if (direct) return direct;
  if (receipt.direction === "in") return null; // uncategorised income needs a decision
  return null;
}

/* ── Country awareness (expandable by configuration, never redesign) ─────── */

export type CountryTaxRules = {
  code: string;
  flag: string;
  name: string;
  currency: string;
  /** Planning reserve rate applied to estimated taxable income. */
  reserveRate: number;
  /** Sales/consumption tax the member may need to register for. */
  salesTax: { label: string; registrationThreshold: number | null } | null;
  /** Whether instalments/quarterlies commonly apply. */
  instalments: { label: string; months: number[] } | null;
  /** Annual filing month (1-12) for a typical self-employed individual. */
  filingMonth: number;
  /** Things Frassy must never state without confirmation for this country. */
  verifyFirst: string[];
};

export const COUNTRY_TAX_RULES: CountryTaxRules[] = [
  {
    code: "CA", flag: "🇨🇦", name: "Canada", currency: "CAD",
    reserveRate: 0.3,
    salesTax: { label: "GST/HST", registrationThreshold: 30000 },
    instalments: { label: "Quarterly instalments", months: [3, 6, 9, 12] },
    filingMonth: 4,
    verifyFirst: ["Provincial rate differences", "Home-office and vehicle claims", "GST/HST registration timing"],
  },
  {
    code: "US", flag: "🇺🇸", name: "United States", currency: "USD",
    reserveRate: 0.3,
    salesTax: { label: "State sales tax / nexus", registrationThreshold: null },
    instalments: { label: "Estimated quarterly payments", months: [4, 6, 9, 1] },
    filingMonth: 4,
    verifyFirst: ["Self-employment tax", "State and local obligations", "Sales-tax nexus by state", "1099-K thresholds"],
  },
  {
    code: "GB", flag: "🇬🇧", name: "United Kingdom", currency: "GBP",
    reserveRate: 0.28,
    salesTax: { label: "VAT", registrationThreshold: 90000 },
    instalments: { label: "Payments on account", months: [1, 7] },
    filingMonth: 1,
    verifyFirst: ["VAT registration threshold changes", "Making Tax Digital requirements", "Allowable expense rules"],
  },
  {
    code: "JM", flag: "🇯🇲", name: "Jamaica", currency: "JMD",
    reserveRate: 0.25,
    salesTax: { label: "GCT", registrationThreshold: null },
    instalments: { label: "Quarterly estimated income tax", months: [3, 6, 9, 12] },
    filingMonth: 3,
    verifyFirst: ["Income tax threshold and rates", "GCT registration", "NIS/NHT/education tax contributions"],
  },
];

export function countryRules(code?: string | null): CountryTaxRules | null {
  if (!code) return null;
  return COUNTRY_TAX_RULES.find((c) => c.code === code.toUpperCase()) ?? null;
}

/* ── The year package ────────────────────────────────────────────────────── */

export type TaxLine = { category: TaxCategory; total: number; count: number };

export type TaxYear = {
  year: number;
  currency: string;
  country: CountryTaxRules | null;
  income: TaxLine[];
  expenses: TaxLine[];
  totalIncome: number;
  totalExpenses: number;
  taxableIncome: number;
  reserve: number;
  reserveConfidence: Confidence;
  /** Receipts Frassy could not categorise — the "still needed" list. */
  needsCategory: Receipt[];
  nextSteps: string[];
  verifyFirst: string[];
};

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

export function buildTaxYear(receipts: Receipt[], opts: { year?: number; country?: string | null } = {}): TaxYear {
  const year = opts.year ?? new Date().getUTCFullYear();
  const country = countryRules(opts.country);
  const rows = receipts.filter((r) => {
    if (r.status === "cancelled") return false;
    const d = new Date(r.occurredAt);
    return !Number.isNaN(d.getTime()) && d.getUTCFullYear() === year;
  });

  const buckets = new Map<string, TaxLine>();
  const needsCategory: Receipt[] = [];

  for (const r of rows) {
    const cat = categorize(r);
    if (!cat) {
      needsCategory.push(r);
      continue;
    }
    const line = buckets.get(cat.id) ?? { category: cat, total: 0, count: 0 };
    // Income is recorded gross; the platform allocation and processing fee are
    // separately recognised as expenses so nothing is double counted.
    line.total = r2(line.total + (cat.flow === "income" ? r.gross : Math.abs(r.gross || r.net)));
    line.count += 1;
    buckets.set(cat.id, line);
  }

  // Deductions already withheld inside Frass become expense lines automatically.
  const fees = rows.reduce((s, r) => s + (r.platformAllocation || 0), 0);
  const processing = rows.reduce((s, r) => s + (r.processingFee || 0), 0);
  if (fees + processing > 0) {
    const cat = TAX_CATEGORIES.find((c) => c.id === "platform_fees")!;
    const line = buckets.get(cat.id) ?? { category: cat, total: 0, count: 0 };
    line.total = r2(line.total + fees + processing);
    line.count += rows.length;
    buckets.set(cat.id, line);
  }

  const all = [...buckets.values()].sort((a, b) => b.total - a.total);
  const income = all.filter((l) => l.category.flow === "income");
  const expenses = all.filter((l) => l.category.flow === "expense");
  const totalIncome = r2(income.reduce((s, l) => s + l.total, 0));
  const totalExpenses = r2(expenses.reduce((s, l) => s + l.total, 0));
  const taxableIncome = r2(Math.max(0, totalIncome - totalExpenses));
  const reserve = country ? r2(taxableIncome * country.reserveRate) : 0;

  const nextSteps: string[] = [];
  if (!country) nextSteps.push("Add your country in Financial Center → Settings so estimates can be calculated.");
  if (needsCategory.length) nextSteps.push(`Give ${needsCategory.length} record${needsCategory.length === 1 ? "" : "s"} a category — it takes a minute.`);
  if (country?.salesTax?.registrationThreshold && totalIncome >= country.salesTax.registrationThreshold * 0.8) {
    nextSteps.push(`You are close to the ${country.salesTax.label} registration threshold — confirm whether you must register.`);
  }
  if (country?.instalments) nextSteps.push(`Set aside ${money(reserve, country.currency)} for ${country.instalments.label.toLowerCase()}.`);
  if (!nextSteps.length) nextSteps.push("Nothing needed right now. Everything is organized.");

  return {
    year,
    currency: rows[0]?.currency ?? country?.currency ?? "USD",
    country,
    income,
    expenses,
    totalIncome,
    totalExpenses,
    taxableIncome,
    reserve,
    reserveConfidence: country ? "configured" : "verify",
    needsCategory,
    nextSteps,
    verifyFirst: country?.verifyFirst ?? ["Your country's rules are not configured yet — confirm everything with a local tax professional."],
  };
}

/* ── The Daily signal (quiet unless it matters) ──────────────────────────── */

export type ComplianceSignal = {
  tone: "green" | "yellow" | "orange" | "red";
  dot: string;
  message: string;
};

export function taxSignal(y: TaxYear, today = new Date()): ComplianceSignal {
  if (!y.country) {
    return { tone: "yellow", dot: "🟡", message: "Add your country so Frassy can organise your taxes properly." };
  }
  if (y.needsCategory.length > 2) {
    return { tone: "yellow", dot: "🟡", message: `${y.needsCategory.length} receipts still need categories.` };
  }
  const month = today.getUTCMonth() + 1;
  if (y.country.instalments?.months.includes(month) && y.reserve > 0) {
    return { tone: "orange", dot: "🟠", message: `${y.country.instalments.label} coming soon — about ${money(y.reserve, y.currency)} set aside.` };
  }
  if (month === y.country.filingMonth) {
    return { tone: "red", dot: "🔴", message: "Filing season — review your tax package before filing." };
  }
  if (y.needsCategory.length > 0) {
    return { tone: "yellow", dot: "🟡", message: `${y.needsCategory.length} receipt${y.needsCategory.length === 1 ? "" : "s"} still need${y.needsCategory.length === 1 ? "s" : ""} a category.` };
  }
  return { tone: "green", dot: "🟢", message: "Everything is organized." };
}

/** Frassy's answer to "how am I doing this year?" — records first, then rules. */
export function yearNarrative(y: TaxYear): string {
  const c = y.currency;
  const head =
    `So far in ${y.year} your records show ${money(y.totalIncome, c)} of income and ` +
    `${money(y.totalExpenses, c)} of business expenses, which leaves about ` +
    `${money(y.taxableIncome, c)} of taxable income.`;
  const reserve = y.country
    ? ` Using the ${y.country.name} planning rate on file, I'd keep roughly ${money(y.reserve, c)} aside.`
    : " I can't estimate a reserve until your country is on file.";
  const outstanding = y.needsCategory.length
    ? ` ${y.needsCategory.length} record${y.needsCategory.length === 1 ? "" : "s"} still need a category.`
    : " Nothing is missing.";
  return `${head}${reserve}${outstanding} ${PROFESSIONAL_NOTICE}`;
}
