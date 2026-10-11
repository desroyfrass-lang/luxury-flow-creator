// Shape of a saved Pricing Room worksheet (Founder overrides only — derived
// numbers are always recalculated from live inputs, never trusted from storage).
import { z } from "zod";
import { profitBreakdown, type BreakdownInput } from "./pricing-floor";

export const COST_STATES = ["verified", "estimated", "missing", "not_applicable", "pending_policy"] as const;
const entry = z.object({ amount: z.string().max(20), state: z.enum(COST_STATES) });

export const worksheetInputsSchema = z.object({
  packagingCost: entry, otherCost: entry, processingFeePct: entry, processingFeeFixed: entry,
  discountPct: entry, commissionPct: entry,
  oversized: z.boolean(),
  /** Founder-chosen standard CJ method for this destination; absent = not chosen (estimate only). */
  shippingMethod: z.string().max(120).optional(),
});
export type WorksheetInputs = z.infer<typeof worksheetInputsSchema>;

export const DEFAULT_INPUTS: WorksheetInputs = {
  packagingCost: { amount: "", state: "missing" }, otherCost: { amount: "", state: "missing" },
  processingFeePct: { amount: "", state: "missing" }, processingFeeFixed: { amount: "", state: "missing" },
  discountPct: { amount: "", state: "not_applicable" }, commissionPct: { amount: "", state: "pending_policy" },
  oversized: false,
};

// Illustrative planning placeholders ONLY: not Shopify's contracted fees and
// not supplier packaging prices. Actual verification states remain separate.
export const ILLUSTRATIVE_INPUTS: WorksheetInputs = {
  processingFeePct: { amount: "3", state: "estimated" },
  processingFeeFixed: { amount: "0.30", state: "estimated" },
  packagingCost: { amount: "0.50", state: "estimated" },
  otherCost: { amount: "0.50", state: "estimated" },
  discountPct: { amount: "", state: "not_applicable" },
  commissionPct: { amount: "0", state: "pending_policy" },
  oversized: false,
};

/** Upgrade empty legacy worksheets to visible estimates without replacing overrides. */
export function withPlanningEstimates(inputs: WorksheetInputs): WorksheetInputs {
  const result = structuredClone(inputs);
  for (const key of ["processingFeePct", "processingFeeFixed", "packagingCost", "otherCost"] as const) {
    if (result[key].amount === "" && result[key].state === "missing") result[key] = { ...ILLUSTRATIVE_INPUTS[key] };
  }
  if (result.commissionPct.amount === "" && result.commissionPct.state === "pending_policy") {
    result.commissionPct = { ...ILLUSTRATIVE_INPUTS.commissionPct };
  }
  return result;
}

/** Conditional no-commission scenario is planning only; never use it for approval.
 * Missing supplier/shipping/expenses refuse a projection instead of counting as zero. */
export function planningBreakdown(input: BreakdownInput) {
  const commission = input.commissionPct;
  const conditional = commission.state === "pending_policy" && commission.amount === 0;
  const planning: BreakdownInput = conditional
    ? { ...input, commissionPct: { amount: 0, state: "estimated" } }
    : input;
  const complete = [planning.supplierCost, planning.shippingCost, planning.packagingCost, planning.otherCost,
    planning.processingFeePct, planning.processingFeeFixed, planning.discountPct, planning.commissionPct]
    .every((e) => e.state === "not_applicable" || ((e.state === "verified" || e.state === "estimated") && e.amount != null && Number.isFinite(e.amount) && e.amount >= 0));
  const result = profitBreakdown(planning);
  return {
    result,
    conditionalCommission: conditional,
    preferred: complete ? result.provisional.targetPreferredOnKnown : null,
    acceptable: complete ? result.provisional.targetAcceptableOnKnown : null,
    minimum: complete ? result.floorPrice : null,
    profit: complete ? result.profit : null,
    marginPct: complete ? result.marginPct : null,
  };
}

export const DESTINATIONS = ["US", "CA", "GB", "JM"] as const;
export const destinationSchema = z.enum(DESTINATIONS);

export const saveWorksheetSchema = z.object({
  productId: z.string().uuid(),
  destination: destinationSchema.default("US"),
  /** Optimistic concurrency: refuse the save if someone else changed it first. */
  expectedRevision: z.number().int().positive().optional(),
  finalPrice: z.number().positive().max(1_000_000).nullable(),
  inputs: worksheetInputsSchema,
  summary: z.object({ status: z.string().max(40), marginPct: z.number().nullable(), approvable: z.boolean() }),
});

/** Parse stored inputs safely; anything malformed falls back to defaults (fail closed). */
export function parseStoredInputs(raw: unknown): WorksheetInputs {
  const r = worksheetInputsSchema.safeParse(raw);
  return r.success ? r.data : DEFAULT_INPUTS;
}
