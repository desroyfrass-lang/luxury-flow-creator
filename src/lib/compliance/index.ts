// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0484 — Financial & Compliance Intelligence
//
// The umbrella constitutional area. Taxes and trade are not separate systems;
// they are two lenses on one compliance layer that quietly keeps members
// organised while they build. Everything reads from the existing Financial
// Center, Orders, Marketplace, Money Moves, Business Vaults and Receipts.
// ─────────────────────────────────────────────────────────────────────────────

import { buildTaxYear, taxSignal, yearNarrative, PROFESSIONAL_NOTICE, TAX_CONSTITUTION, type ComplianceSignal, type TaxYear } from "./tax-intelligence";
import { TRADE_CONSTITUTION, TRADE_NOTICE } from "./trade-intelligence";
import type { Receipt } from "@/lib/finance/receipts";

export * from "./tax-intelligence";
export * from "./trade-intelligence";

export type ComplianceAreaId =
  | "taxes"
  | "tariffs"
  | "customs"
  | "reporting"
  | "reminders"
  | "registrations"
  | "renewals"
  | "deadlines";

export type ComplianceArea = {
  id: ComplianceAreaId;
  label: string;
  icon: string;
  plain: string;
  /** Where it already lives — compliance never builds a parallel home. */
  home: string;
  status: "live" | "structure";
};

export const COMPLIANCE_AREAS: ComplianceArea[] = [
  { id: "taxes", label: "Taxes", icon: "🧾", plain: "Your income, expenses and what to keep aside.", home: "Financial Center → Taxes", status: "live" },
  { id: "tariffs", label: "Tariffs", icon: "🚢", plain: "Charges that may apply when goods cross a border.", home: "Services → Freight Brokerage & Logistics", status: "live" },
  { id: "customs", label: "Customs", icon: "📋", plain: "The paperwork that travels with a shipment.", home: "Services → Freight Brokerage & Logistics", status: "live" },
  { id: "reporting", label: "Financial reporting", icon: "📊", plain: "Statements built from your receipts, not retyped.", home: "Financial Center → Statements", status: "live" },
  { id: "reminders", label: "Compliance reminders", icon: "⏰", plain: "A quiet nudge only when something is actually due.", home: "The Daily", status: "live" },
  { id: "registrations", label: "Business registrations", icon: "🏛", plain: "Registering the business once it earns enough to need it.", home: "Business Vault", status: "structure" },
  { id: "renewals", label: "Required renewals", icon: "🔁", plain: "Licences and permits that expire.", home: "Business Vault", status: "structure" },
  { id: "deadlines", label: "Regulatory deadlines", icon: "🗓", plain: "Dates you cannot miss, tracked for you.", home: "The Daily", status: "structure" },
];

export const COMPLIANCE_CONSTITUTION = [...TAX_CONSTITUTION, ...TRADE_CONSTITUTION] as const;

export const COMPLIANCE_NOTICE = `${PROFESSIONAL_NOTICE} ${TRADE_NOTICE}`;

export type ComplianceState = {
  year: TaxYear;
  signal: ComplianceSignal;
  narrative: string;
};

/** One derivation used by the Financial Center, The Daily and Frassy alike. */
export function complianceState(receipts: Receipt[], opts: { country?: string | null; year?: number } = {}): ComplianceState {
  const year = buildTaxYear(receipts, opts);
  return { year, signal: taxSignal(year), narrative: yearNarrative(year) };
}
