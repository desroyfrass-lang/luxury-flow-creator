// Try-On Phase B — planning metadata only. No AI calls, no generation.
// Maps a product's category to the try-on method it would need and whether
// that method may be approved yet. The database enforces the same limits.

export type TryOnMethod = "full_body_garment" | "feet_legs" | "head_shoulders";
export type TryOnSupport = "supported" | "extra_review" | "later" | "paused" | "excluded";
export type ReadinessStatus = "not_ready" | "in_review" | "ready" | "needs_rereview" | "not_supported";

export const READINESS_LABEL: Record<ReadinessStatus, string> = {
  not_ready: "Not ready",
  in_review: "In review",
  ready: "Try-On Ready",
  needs_rereview: "Needs re-review",
  not_supported: "Not supported",
};

export const SUPPORT_LABEL: Record<TryOnSupport, string> = {
  supported: "Full-body garment try-on — can be approved",
  extra_review: "Needs extra Founder review and testing first — cannot be approved yet",
  later: "Different method needed later — cannot be approved yet",
  paused: "Paused until a careful-content policy exists",
  excluded: "Excluded (child photo safety)",
};

export function tryOnAdapter(categoryKey: string | null | undefined): { method: TryOnMethod | null; support: TryOnSupport } {
  const k = (categoryKey ?? "").toLowerCase();
  if (/kids/.test(k)) return { method: null, support: "excluded" };
  if (/(shape|swim|intimate)/.test(k)) return { method: null, support: "paused" };
  if (/bridal/.test(k)) return { method: "full_body_garment", support: "extra_review" };
  if (/(kicks|shoe|sneaker|footwear)/.test(k)) return { method: "feet_legs", support: "later" };
  if (/(wig|hair)/.test(k)) return { method: "head_shoulders", support: "later" };
  return { method: "full_body_garment", support: "supported" };
}

/** Department = first segment of the category key, e.g. "drip". */
export function departmentOf(categoryKey: string | null | undefined): string {
  return (categoryKey ?? "uncategorised").split("/")[0] || "uncategorised";
}

export const STYLE_PREVIEW_NOTICE = "Style preview, not a fit guarantee.";
