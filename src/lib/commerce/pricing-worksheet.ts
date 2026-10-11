// Shape of a saved Pricing Room worksheet (Founder overrides only — derived
// numbers are always recalculated from live inputs, never trusted from storage).
import { z } from "zod";

export const COST_STATES = ["verified", "estimated", "missing", "not_applicable", "pending_policy"] as const;
const entry = z.object({ amount: z.string().max(20), state: z.enum(COST_STATES) });

export const worksheetInputsSchema = z.object({
  packagingCost: entry, otherCost: entry, processingFeePct: entry, processingFeeFixed: entry,
  discountPct: entry, commissionPct: entry,
  oversized: z.boolean(),
});
export type WorksheetInputs = z.infer<typeof worksheetInputsSchema>;

export const DEFAULT_INPUTS: WorksheetInputs = {
  packagingCost: { amount: "", state: "missing" }, otherCost: { amount: "", state: "missing" },
  processingFeePct: { amount: "", state: "missing" }, processingFeeFixed: { amount: "", state: "missing" },
  discountPct: { amount: "", state: "not_applicable" }, commissionPct: { amount: "", state: "pending_policy" },
  oversized: false,
};

export const saveWorksheetSchema = z.object({
  productId: z.string().uuid(),
  finalPrice: z.number().positive().max(1_000_000).nullable(),
  inputs: worksheetInputsSchema,
  summary: z.object({ status: z.string().max(40), marginPct: z.number().nullable(), approvable: z.boolean() }),
});

/** Parse stored inputs safely; anything malformed falls back to defaults (fail closed). */
export function parseStoredInputs(raw: unknown): WorksheetInputs {
  const r = worksheetInputsSchema.safeParse(raw);
  return r.success ? r.data : DEFAULT_INPUTS;
}
