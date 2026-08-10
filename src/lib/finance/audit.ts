// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0450 — Financial Audit Center (Founder only).
//
// One searchable ledger over the three places money is recorded: card orders,
// payment requests and financial receipts. Nothing here can be edited — the
// audit view only reads, reconciles and explains.
//
// In plain English: this is the accountant's binder. Every page is a photocopy
// of an original that can never be changed, and beside each page we write
// whether the numbers add up.
// ─────────────────────────────────────────────────────────────────────────────

export const PLATFORM_ALLOCATION_RATE = 0.1; // 90 / 10 constitutional split
export const FOUNDER_ALLOCATION_RATE = 0.01; // inside the 10%
export const COFOUNDER_ALLOCATION_RATE = 0.01; // inside the 10%

export type AuditSource = "order" | "payment_request" | "receipt";

export type ReconciliationState = "reconciled" | "pending" | "attention";

export type AuditEvent = {
  at: string;
  label: string;
  detail?: string | null;
};

export type AuditRow = {
  id: string;
  source: AuditSource;
  reference: string | null;
  title: string;
  counterparty: string | null;
  partyId: string | null;
  currency: string;
  gross: number;
  platformAllocation: number;
  processingFee: number;
  otherDeductions: number;
  net: number;
  status: string;
  occurredAt: string;
  settledAt: string | null;
  /** Immutable, ordered event history rebuilt from the record's own timestamps. */
  events: AuditEvent[];
  reconciliation: ReconciliationState;
  reconciliationNote: string;
};

export const SOURCE_LABEL: Record<AuditSource, string> = {
  order: "Card order",
  payment_request: "Payment request",
  receipt: "Receipt",
};

export const RECONCILIATION_LABEL: Record<ReconciliationState, { dot: string; label: string; plain: string }> = {
  reconciled: {
    dot: "🟢",
    label: "Reconciled",
    plain: "The money arrived and every line of the breakdown adds up.",
  },
  pending: {
    dot: "🟠",
    label: "Pending",
    plain: "Still moving. Nothing is wrong yet — it simply hasn't finished.",
  },
  attention: {
    dot: "🔴",
    label: "Needs attention",
    plain: "Something doesn't line up. A human should look at this record.",
  },
};

export const FINAL_ORDER_STATES = ["paid", "refunded", "cancelled"];
export const FINAL_REQUEST_STATES = ["paid", "refunded", "declined", "cancelled", "expired", "failed"];

const round2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

export function money(n: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

/** The constitutional split, shown for any gross amount. */
export function allocationOf(gross: number) {
  const platform = round2(gross * PLATFORM_ALLOCATION_RATE);
  return {
    platform,
    founder: round2(gross * FOUNDER_ALLOCATION_RATE),
    coFounder: round2(gross * COFOUNDER_ALLOCATION_RATE),
    ecosystem: round2(platform - gross * FOUNDER_ALLOCATION_RATE - gross * COFOUNDER_ALLOCATION_RATE),
    creator: round2(gross - platform),
  };
}

/** Does the breakdown actually add up, and is the platform share the lawful 10%? */
export function reconcile(input: {
  gross: number;
  platformAllocation: number;
  processingFee: number;
  otherDeductions: number;
  net: number;
  final: boolean;
  settled: boolean;
  extraProblem?: string | null;
}): { state: ReconciliationState; note: string } {
  const expectedNet = round2(
    input.gross - input.platformAllocation - input.processingFee - input.otherDeductions,
  );
  if (input.extraProblem) return { state: "attention", note: input.extraProblem };

  if (Math.abs(expectedNet - round2(input.net)) > 0.01) {
    return {
      state: "attention",
      note: `Net should be ${expectedNet.toFixed(2)} but the record says ${round2(input.net).toFixed(2)}.`,
    };
  }
  if (input.gross > 0) {
    const rate = input.platformAllocation / input.gross;
    if (rate > PLATFORM_ALLOCATION_RATE + 0.005 || rate < PLATFORM_ALLOCATION_RATE - 0.005) {
      return {
        state: "attention",
        note: `Platform allocation is ${(rate * 100).toFixed(2)}% — the constitution says 10%.`,
      };
    }
  }
  if (!input.final) return { state: "pending", note: "Still in flight — no final outcome yet." };
  if (input.settled) return { state: "reconciled", note: "Settled and balanced." };
  return { state: "reconciled", note: "Closed out with a final outcome." };
}

/** Totals across whatever the Founder has filtered to. */
export function summarise(rows: AuditRow[]) {
  const t = {
    count: rows.length,
    gross: 0,
    platform: 0,
    processing: 0,
    net: 0,
    founder: 0,
    coFounder: 0,
    reconciled: 0,
    pending: 0,
    attention: 0,
  };
  for (const r of rows) {
    if (r.status === "refunded" || r.status === "cancelled" || r.status === "declined") continue;
    t.gross += r.gross;
    t.platform += r.platformAllocation;
    t.processing += r.processingFee;
    t.net += r.net;
    t.founder += r.gross * FOUNDER_ALLOCATION_RATE;
    t.coFounder += r.gross * COFOUNDER_ALLOCATION_RATE;
  }
  for (const r of rows) t[r.reconciliation] += 1;
  return {
    ...t,
    gross: round2(t.gross),
    platform: round2(t.platform),
    processing: round2(t.processing),
    net: round2(t.net),
    founder: round2(t.founder),
    coFounder: round2(t.coFounder),
  };
}

export function filterRows(
  rows: AuditRow[],
  f: { query?: string; source?: AuditSource | "all"; state?: ReconciliationState | "all" },
): AuditRow[] {
  const q = (f.query ?? "").trim().toLowerCase();
  return rows.filter((r) => {
    if (f.source && f.source !== "all" && r.source !== f.source) return false;
    if (f.state && f.state !== "all" && r.reconciliation !== f.state) return false;
    if (!q) return true;
    return [r.title, r.reference, r.counterparty, r.status, r.id]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });
}
