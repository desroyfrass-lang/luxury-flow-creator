// ─────────────────────────────────────────────────────────────────────────────
// FV Studios — credit truth (commissioning pass 1).
//
// A forecast is a quote. Approving a quote is not the same as work happening.
// The only thing that may ever finalise a charge is a verified output produced
// by a real engine.
//
//   forecast → approval → job → real processing → verified output → charge → complete
//
// Anything short of a verified output means: no final charge, and never the
// word "complete".
// ─────────────────────────────────────────────────────────────────────────────

export type JobLifecycle =
  | "forecast"
  | "approved"
  | "queued"
  | "running"
  | "verified"
  | "failed"
  | "awaiting_engine";

/** Proof that something real came out of a machine. */
export type VerifiedOutput = {
  /** Where the produced media actually lives. */
  fileUrl: string;
  /** Which engine produced it. */
  engineSlug: string;
  /** Frass-native or an outside fallback. */
  ownership: "frass_native" | "external_fallback";
  verifiedAt: string;
};

export function isVerifiedOutput(output: unknown): output is VerifiedOutput {
  const o = output as VerifiedOutput | null;
  return Boolean(
    o &&
      typeof o.fileUrl === "string" &&
      o.fileUrl.trim().length > 5 &&
      typeof o.engineSlug === "string" &&
      o.engineSlug.trim().length > 0 &&
      typeof o.verifiedAt === "string" &&
      o.verifiedAt.trim().length > 0,
  );
}

export type ChargeInput = {
  /** What the approved forecast said the work would cost. */
  forecastCredits: number;
  lifecycle: JobLifecycle;
  output?: unknown;
  /** Has this exact job already been billed? */
  alreadyCharged?: boolean;
  /** Free or manual work — always allowed, always zero. */
  free?: boolean;
};

export type ChargeDecision = {
  /** Credits to take now. Zero unless a verified output exists. */
  charge: number;
  /** The status the operation may honestly claim. */
  status: "complete" | "waiting" | "blocked" | "failed";
  /** Plain-language reason, safe to show a member. */
  reason: string;
};

/**
 * The single place that decides whether money moves.
 *
 * It never trusts an approval, a forecast, a queue position or an engine's
 * optimism — only a verified output.
 */
export function decideCharge(input: ChargeInput): ChargeDecision {
  if (input.free || input.forecastCredits <= 0) {
    return {
      charge: 0,
      status: "complete",
      reason: "Free work — nothing to charge. Manual editing is always free.",
    };
  }

  if (input.lifecycle === "awaiting_engine") {
    return {
      charge: 0,
      status: "blocked",
      reason:
        "The engine this needs is NOT INSTALLED, so nothing was produced. Nothing has been charged.",
    };
  }

  if (input.lifecycle === "failed") {
    return {
      charge: 0,
      status: "failed",
      reason: "The engine did not return a finished result. Nothing has been charged.",
    };
  }

  if (input.lifecycle !== "verified" || !isVerifiedOutput(input.output)) {
    return {
      charge: 0,
      status: "waiting",
      reason:
        "Approved and queued. No credits are taken until a real engine returns a finished, verified result.",
    };
  }

  if (input.alreadyCharged) {
    return {
      charge: 0,
      status: "complete",
      reason: "Already charged once for this job. A repeat cannot bill twice.",
    };
  }

  return {
    charge: Math.round(input.forecastCredits),
    status: "complete",
    reason: "A verified result was produced. Charged once, at the approved forecast.",
  };
}

/** One stable key per job so a replay can never bill a second time. */
export function chargeIdempotencyKey(jobId: string): string {
  return `studio-job:${jobId}`;
}

/**
 * Phone Content Mode wording. Analysis and forecasting are real today;
 * enhancement is not, until a restoration/finishing engine returns media.
 */
export function phoneEnhancementHeadline(decision: ChargeDecision): string {
  switch (decision.status) {
    case "complete":
      return decision.charge > 0
        ? "Enhanced — verified result produced."
        : "Nothing to charge for this pass.";
    case "waiting":
      return "Waiting on the engine — not enhanced yet, nothing charged.";
    case "failed":
      return "The enhancement did not complete. Nothing charged.";
    default:
      return "Enhancement is NOT AVAILABLE yet — the engine is not installed. Nothing charged.";
  }
}
