// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0484 — Trade & Tariff Intelligence
//
// Extends Frass Services Marketplace (Freight Brokerage & Logistics) rather
// than creating a shipping system. Frass owns no trucks, ships or warehouses —
// only the customer experience: documentation, awareness, and preparation.
//
// Living knowledge rule: tariff and customs rules change constantly. Nothing
// here is presented as a current legal rate. Frassy organises what is known,
// flags what needs attention, and says plainly when something must be confirmed
// with the destination customs authority or a licensed customs broker.
// ─────────────────────────────────────────────────────────────────────────────

import type { ComplianceSignal } from "./tax-intelligence";

export const TRADE_CONSTITUTION = [
  "Frassy proactively identifies when a shipment may need extra attention, and explains what and why.",
  "Tariff and customs information is living knowledge — never treated as static fact.",
  "Duty and tariff figures are planning estimates only, never quoted as the amount that will be charged.",
  "When guidance cannot be confidently verified, Frassy says so and points to customs or a licensed broker.",
  "Trade guidance lives inside Freight Brokerage & Logistics in the Services Marketplace — never as a separate system.",
] as const;

export const TRADE_NOTICE =
  "Trade rules change frequently. Treat this as preparation, not a customs ruling — confirm duties, " +
  "classifications and restrictions with the destination customs authority or a licensed customs broker before shipping.";

/* ── What Frassy helps with ──────────────────────────────────────────────── */

export const TRADE_CAPABILITIES = [
  { id: "tariff", label: "Tariff awareness", plain: "Knowing that a charge may apply before it surprises you." },
  { id: "customs-docs", label: "Customs documentation", plain: "The paperwork that travels with the shipment." },
  { id: "import-export", label: "Import & export guidance", plain: "What each side of the border expects." },
  { id: "duty", label: "Duty estimates (where available)", plain: "A rough idea of the cost, clearly marked as an estimate." },
  { id: "restrictions", label: "Trade restrictions", plain: "Things a country will not let in — better to know now." },
  { id: "declarations", label: "Required declarations", plain: "What you must state, honestly, about the goods." },
  { id: "classification", label: "Shipping classifications", plain: "The code that describes what you are sending." },
  { id: "country", label: "Country-specific requirements", plain: "Rules that only apply at that destination." },
  { id: "mistakes", label: "Common shipping mistakes", plain: "The errors that hold shipments at the border." },
  { id: "checklist", label: "Documentation checklists", plain: "A simple list so nothing is forgotten." },
] as const;

/* ── Attention triggers ──────────────────────────────────────────────────── */

export type ShipmentFacts = {
  origin?: string | null;
  destination?: string | null;
  declaredValue?: number;
  currency?: string;
  commercial?: boolean;
  goods?: string;
  hasCommercialInvoice?: boolean;
  hasPackingList?: boolean;
  hasDeclaration?: boolean;
  recipientId?: boolean;
};

export type TradeFlag = {
  id: string;
  severity: "info" | "attention" | "blocking";
  title: string;
  why: string;
  action: string;
};

const REGULATED = [
  "food", "meat", "plant", "seed", "alcohol", "tobacco", "battery", "lithium", "cosmetic",
  "supplement", "medicine", "drug", "cbd", "aerosol", "perfume", "weapon", "knife", "drone",
];

export const HIGH_VALUE_THRESHOLD = 2500;

export function inspectShipment(f: ShipmentFacts): TradeFlag[] {
  const flags: TradeFlag[] = [];
  const goods = (f.goods ?? "").toLowerCase();

  if (!f.destination) {
    flags.push({ id: "destination", severity: "blocking", title: "Destination country missing", why: "Every customs requirement depends on where the shipment is going.", action: "Add the destination country." });
  }
  const hit = REGULATED.find((w) => goods.includes(w));
  if (hit) {
    flags.push({ id: `regulated:${hit}`, severity: "attention", title: `“${hit}” may be regulated or restricted`, why: "Many countries restrict or require permits for goods of this type, and rules differ by destination.", action: "Confirm admissibility with the destination customs authority before shipping." });
  }
  if ((f.declaredValue ?? 0) >= HIGH_VALUE_THRESHOLD) {
    flags.push({ id: "high-value", severity: "attention", title: "High-value shipment", why: "Higher declared values commonly trigger formal entry, duty assessment and closer inspection.", action: "Prepare a commercial invoice and consider a licensed customs broker." });
  }
  if (f.commercial) {
    flags.push({ id: "commercial", severity: "attention", title: "Commercial shipment", why: "Commercial goods are treated differently from personal effects and usually need a business identifier.", action: "Confirm your import/export identifiers and classification for the goods." });
  }
  if (f.commercial && !f.hasCommercialInvoice) {
    flags.push({ id: "invoice", severity: "blocking", title: "Commercial invoice missing", why: "Customs cannot value the shipment without it, so it will not clear.", action: "Attach a commercial invoice with a description, quantity, value and currency." });
  }
  if (!f.hasPackingList) {
    flags.push({ id: "packing-list", severity: "info", title: "No packing list attached", why: "A packing list speeds inspection and reduces disputes about contents.", action: "Add a simple list of what is in each box." });
  }
  if (!f.hasDeclaration) {
    flags.push({ id: "declaration", severity: "blocking", title: "Customs declaration incomplete", why: "The declaration is the legal statement about the goods being shipped.", action: "Complete the customs declaration before the shipment moves." });
  }
  flags.push({ id: "tariff-currency", severity: "info", title: "Tariff rates must be checked at ship time", why: "Duty rates and trade policies change and are set by the destination, not by Frass.", action: "Verify the current rate for your classification before quoting a landed cost." });
  return flags;
}

export function tradeSignal(flags: TradeFlag[]): ComplianceSignal {
  if (flags.some((f) => f.severity === "blocking")) {
    return { tone: "red", dot: "🔴", message: "Shipment cannot proceed until required information is completed." };
  }
  if (flags.some((f) => f.id.startsWith("regulated:") || f.id === "high-value")) {
    return { tone: "orange", dot: "🟠", message: "Trade or tariff conditions may affect this shipment." };
  }
  if (flags.some((f) => f.severity === "attention")) {
    return { tone: "yellow", dot: "🟡", message: "Customs documentation needs review." };
  }
  return { tone: "green", dot: "🟢", message: "No tariff or customs issues detected." };
}

/** Documentation checklist, shown in the Freight Brokerage & Logistics flow. */
export const CUSTOMS_CHECKLIST = [
  "Accurate description of the goods — never vague, never understated",
  "Declared value and currency",
  "Quantity and weight per item",
  "Commercial invoice (commercial shipments)",
  "Packing list",
  "Shipping classification code for the goods",
  "Sender and recipient details, including identification where required",
  "Reason for export (sale, gift, sample, return)",
  "Any permits, certificates or licences the destination requires",
] as const;
