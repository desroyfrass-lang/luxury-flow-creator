// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — THE WORK HANDOFF CONTRACT.
//
// One work identity travels from Daily/Workshop into the specialist tool that
// actually does the job. Nothing here declares completion, income, payment or
// verification — it only carries WHO is working on WHAT.
//
// Carried, and only when it genuinely exists:
//   work  — the member_actions row id (the shared work spine). Always preferred.
//   move  — the stable Master Money Move id from the Step 1 catalogue.
//   vault — the Vault this work belongs to.
//   track — the account-backed Fast Track key from Step 2.
// A field that does not exist is simply absent. No false or null relationships.
// ─────────────────────────────────────────────────────────────────────────────

export type WorkHandoff = {
  workItemId?: string;
  moveId?: string;
  vaultId?: string;
  trackKey?: string;
};

export const HANDOFF_PARAMS = {
  work: "work",
  move: "move",
  vault: "vault",
  track: "track",
} as const;

/**
 * Reads a handoff out of a route's search object. Both the short URL names
 * (?work=) and the parsed names the router round-trips (?workItemId=) are
 * accepted, so a link built by hand and a link built by the router behave the
 * same after a reload. Unknown shapes are ignored.
 */
export function parseWorkHandoff(search: Record<string, unknown>): WorkHandoff {
  const one = (k: string) => (typeof search[k] === "string" && search[k] ? (search[k] as string) : undefined);
  const str = (...keys: string[]) => keys.map(one).find(Boolean);
  const out: WorkHandoff = {};
  const w = str(HANDOFF_PARAMS.work, "workItemId");
  const m = str(HANDOFF_PARAMS.move, "moveId");
  const v = str(HANDOFF_PARAMS.vault, "vaultId");
  const t = str(HANDOFF_PARAMS.track, "trackKey");
  if (w) out.workItemId = w;
  if (m) out.moveId = m;
  if (v) out.vaultId = v;
  if (t) out.trackKey = t;
  return out;
}

/** True when the destination actually carries something to recognise. */
export function hasWorkHandoff(h: WorkHandoff): boolean {
  return Boolean(h.workItemId || h.moveId || h.vaultId || h.trackKey);
}

/**
 * Builds the specialist link. The destination path may already carry its own
 * query (e.g. the Wallet's `?section=sell`); that is preserved exactly.
 */
export function buildHandoffHref(path: string, handoff: WorkHandoff): string {
  const [base, existing] = path.split("?");
  const q = new URLSearchParams(existing ?? "");
  if (handoff.workItemId) q.set(HANDOFF_PARAMS.work, handoff.workItemId);
  if (handoff.moveId) q.set(HANDOFF_PARAMS.move, handoff.moveId);
  if (handoff.vaultId) q.set(HANDOFF_PARAMS.vault, handoff.vaultId);
  if (handoff.trackKey) q.set(HANDOFF_PARAMS.track, handoff.trackKey);
  const s = q.toString();
  return s ? `${base}?${s}` : (base as string);
}

/**
 * The specialist routes that genuinely read an incoming work identity today.
 * Anything not listed here is left honestly unwired rather than pretending.
 */
export const WIRED_SPECIALIST_PATHS: string[] = [
  "/workspace/wallet",
  "/workspace/first-venture",
  "/workspace/link",
  "/gallery/studio",
  "/studios/create",
  "/services",
];

/** Does this destination path recognise a work identity when it arrives? */
export function destinationAcceptsWork(path: string | null | undefined): boolean {
  if (!path) return false;
  const base = path.split("?")[0] ?? "";
  return WIRED_SPECIALIST_PATHS.includes(base);
}
