// ─────────────────────────────────────────────────────────────────────────────
// MONEY MOVES V1 — the bridge between the decision and the work.
//
// Money Moves decides. The Workshop item carries the decision. Quick Sell (the
// Frass Card selling tool) executes it. Central finance stays the only place
// that may ever say money has cleared — nothing here declares an earning.
// ─────────────────────────────────────────────────────────────────────────────

import { moveById } from "@/lib/business/money-move-catalogue";
import {
  AWAITING_VERIFICATION_LABEL,
  SELLER_DECLARED_LABEL,
  SELLER_DECLARED_NOTE,
} from "@/lib/finance/money-truth";
import { VERIFIED_LABEL, VERIFIED_NOTE, economicState } from "@/lib/finance/payment-verification";


/** Work items born in Money Moves carry this source. */
export const MONEY_MOVE_SOURCE = "money-move";

/** The existing Frass Card selling tool, already live in the Wallet. */
export const SALE_TOOL_PATH = "/workspace/wallet";

export function saleToolHref(workItemId?: string | null): string {
  const q = new URLSearchParams({ section: "sell" });
  if (workItemId) q.set("work", workItemId);
  return `${SALE_TOOL_PATH}?${q.toString()}`;
}

export type SaleState = "not-listed" | "listed" | "awaiting" | "seller-declared" | "verified";

export type SaleStatus = {
  state: SaleState;
  /** Short badge wording. Never says "earned" or "cleared". */
  label: string;
  /** One plain sentence a member with limited English can read. */
  note: string;
};

type OrderLike = { listing_id: string | null; status: string | null; verified_at?: string | null };

/**
 * Truthful status of a Money Move sale, worked out from records that already
 * exist. A seller ticking "paid" is reported as seller-declared only — Frass
 * has not verified it. Only a provider confirmation recorded by the payment
 * system reads as "Payment verified", and even that is not paid out yet.
 */
export function saleStatus(sourceRef: string | null | undefined, orders: OrderLike[]): SaleStatus {
  if (!sourceRef) {
    return {
      state: "not-listed",
      label: "Not listed yet",
      note: "Open the tool and put your item up for sale.",
    };
  }
  const mine = orders.filter((o) => o.listing_id === sourceRef);
  if (mine.length === 0) {
    return {
      state: "listed",
      label: "Live on your card",
      note: "Your item is for sale. Share your card link so someone can buy it.",
    };
  }
  if (mine.some((o) => economicState(o) === "verified")) {
    return { state: "verified", label: VERIFIED_LABEL, note: VERIFIED_NOTE };
  }
  if (mine.some((o) => o.status === "pending")) {
    return {
      state: "awaiting",
      label: AWAITING_VERIFICATION_LABEL,
      note: "Someone started buying. No payment provider has confirmed the money, so nothing is counted.",
    };
  }
  if (mine.some((o) => o.status === "paid")) {
    return {
      state: "seller-declared",
      label: SELLER_DECLARED_LABEL,
      note: SELLER_DECLARED_NOTE,
    };
  }

  return {
    state: "listed",
    label: "Live on your card",
    note: "No open order right now.",
  };
}

/**
 * The one Money Move V1 can actually carry all the way through.
 * Its wording now comes from the Master Money Moves Library so the same move
 * has one permanent identity everywhere. Behaviour is unchanged.
 */
export const FIRST_SALE_MOVE_ID = "mm.direct.frass-card-sale";

const FIRST_SALE_ENTRY = moveById(FIRST_SALE_MOVE_ID);

export const FIRST_SALE_MOVE = {
  id: FIRST_SALE_MOVE_ID,
  title: FIRST_SALE_ENTRY?.title ?? "Put one thing up for sale on your Frass Card",
  detail:
    FIRST_SALE_ENTRY?.purpose ??
    "Add a photo, a price and how many you have. It goes live on your card straight away, and anyone with your link can buy it.",
};
