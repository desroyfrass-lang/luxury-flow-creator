// ─────────────────────────────────────────────────────────────────────────────
// FAST TRACK IDENTITY (Step 2)
//
// A Fast Track is a guided step inside a Vault's Money Move. Its identity must
// survive a reload, a new device and a wording change of the list around it,
// so it is derived from the Vault key plus a slug of the step title:
//
//     ft.<vault-key>.<step-slug>
//
// The legacy browser-only id was `<vault-key>-<index>` (position based). We keep
// a function for it so old localStorage ticks can be migrated once, but it is
// never written again.
//
// Parent Money Move: only recorded where the Step 1 catalogue gives a SAFE,
// unambiguous match for the whole Vault. Where a Vault spans several canonical
// moves (music, culinary, books, seamstress, footwear…) the parent stays null
// rather than manufacturing a false link.
// ─────────────────────────────────────────────────────────────────────────────

import { moveById } from "@/lib/business/money-move-catalogue";

export function slugifyStep(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** The stable, account-persisted key for a Fast Track. */
export function fastTrackKey(vaultKey: string, title: string): string {
  return `ft.${vaultKey}.${slugifyStep(title)}`;
}

/** The old browser-only id — read once for migration, never written again. */
export function legacyFastTrackId(vaultKey: string, index: number): string {
  return `${vaultKey}-${index}`;
}

/**
 * Vault → Step 1 catalogue Money Move, only where the whole Vault clearly is
 * that one permanent move. Anything ambiguous is deliberately absent.
 */
const VAULT_PARENT_MOVE: Record<string, string> = {
  "visual-creator": "mm.art.originals-prints-commissions",
  wellness: "mm.services.wellness-practice",
  beauty: "mm.services.beauty-appointments",
  photography: "mm.services.photography-bookings",
  freight: "mm.services.freight-brokerage",
  software: "mm.services.software-builds",
  tradesperson: "mm.services.trade-jobs",
  woodworking: "mm.manufacturing.made-to-order-craft",
};

/** Returns the catalogue Money Move id for a Vault, or null when unknown. */
export function parentMoveIdForVault(vaultKey: string): string | null {
  const id = VAULT_PARENT_MOVE[vaultKey];
  if (!id) return null;
  // Never return an id the catalogue does not actually contain.
  return moveById(id) ? id : null;
}

export const FAST_TRACK_LEGACY_STORAGE_KEY = "frass.fasttrack.done.v1";
