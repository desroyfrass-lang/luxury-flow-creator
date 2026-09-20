// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0407 / A1 — The A1 Master Standard foundation.
//
// The canonical production chain:
//   CREATE → ENHANCE → PROFESSIONAL FINISH → A1 QC → MASTER → VERSIONS
//   → VAULT → DISTRIBUTION
//
// TRUTH RULE: nothing here inspects media, and nothing here may claim that a
// provider generated, enhanced or mastered anything. This module only records
// what is *known* and reports, in plain language, exactly what still blocks
// "A1 MASTER — APPROVED".
// ─────────────────────────────────────────────────────────────────────────────

export const A1_CHAIN = [
  { id: "create", label: "Create", everyday: "The raw work exists — footage, audio, words, images." },
  { id: "enhance", label: "Enhance", everyday: "Input cleaned up: noise, light, levels, framing." },
  { id: "finish", label: "Professional finish", everyday: "Grade, mix, titles, pacing — the craft pass." },
  { id: "qc", label: "A1 QC", everyday: "The quality gate. It either passes or names what blocks it." },
  { id: "master", label: "Master", everyday: "One approved master, produced from the finished work." },
  { id: "versions", label: "Versions", everyday: "Cuts and sizes made from that one master." },
  { id: "vault", label: "Vault", everyday: "The master and its versions stored as owned assets." },
  { id: "distribution", label: "Distribution", everyday: "Sent out — only ever with your word." },
] as const;

export type A1StageId = (typeof A1_CHAIN)[number]["id"];

/** Every check the gate knows about. Unknown is never treated as passed. */
export const A1_CHECKS = [
  { id: "source", stage: "create", label: "Source material present", blocks: "No finished source has been recorded for this production yet." },
  { id: "input-clean", stage: "enhance", label: "Input cleaned", blocks: "The recording has not been through an enhancement pass." },
  { id: "picture", stage: "finish", label: "Picture finish", blocks: "No colour/grade pass has been recorded." },
  { id: "sound", stage: "finish", label: "Sound finish", blocks: "No mix or loudness pass has been recorded." },
  { id: "rights", stage: "qc", label: "Rights and ownership clear", blocks: "Ownership of every element has not been confirmed." },
  { id: "master-file", stage: "master", label: "Master produced", blocks: "No master file has been produced by a connected, confirmed provider." },
] as const;

export type A1CheckId = (typeof A1_CHECKS)[number]["id"];

/** What we actually know about a check. "unknown" is the honest default. */
export type A1CheckState = "unknown" | "blocked" | "passed";

export type A1Evidence = Partial<Record<A1CheckId, { state: A1CheckState; note?: string }>>;

export type A1Verdict = {
  approved: boolean;
  /** "A1 MASTER — APPROVED" only when every check passed with evidence. */
  headline: string;
  passed: A1CheckId[];
  blocking: Array<{ id: A1CheckId; label: string; reason: string }>;
  /** Furthest chain stage the production can honestly claim. */
  reachedStage: A1StageId;
};

/**
 * The quality gate. It can only approve on recorded evidence; anything
 * unknown blocks and says why.
 */
export function evaluateA1(evidence: A1Evidence = {}): A1Verdict {
  const passed: A1CheckId[] = [];
  const blocking: A1Verdict["blocking"] = [];

  for (const check of A1_CHECKS) {
    const got = evidence[check.id];
    if (got?.state === "passed") {
      passed.push(check.id);
    } else {
      blocking.push({
        id: check.id,
        label: check.label,
        reason: got?.note?.trim() || check.blocks,
      });
    }
  }

  const approved = blocking.length === 0;
  const reachedStage = furthestStage(passed);

  return {
    approved,
    headline: approved
      ? "A1 MASTER — APPROVED"
      : blocking.length === A1_CHECKS.length
        ? "Not yet assessed — no A1 evidence recorded"
        : `Not approved — ${blocking.length} item${blocking.length === 1 ? "" : "s"} blocking`,
    passed,
    blocking,
    reachedStage,
  };
}

function furthestStage(passed: A1CheckId[]): A1StageId {
  let reached: A1StageId = "create";
  for (const stage of A1_CHAIN) {
    const checks = A1_CHECKS.filter((c) => c.stage === stage.id);
    if (checks.length === 0) continue;
    if (checks.every((c) => passed.includes(c.id))) reached = stage.id;
    else break;
  }
  return reached;
}

/** Plain sentence for the interface, never an overclaim. */
export function a1StatusLine(verdict: A1Verdict): string {
  if (verdict.approved) return "This production meets the A1 Master Standard.";
  if (verdict.passed.length === 0)
    return "Nothing has been produced or checked yet, so no quality claim can be made.";
  return "Some of the standard is met. The list below is exactly what is still missing.";
}
