// ─────────────────────────────────────────────────────────────────────────────
// MONEY MOVES V1 — the bridge between the decision and the work.
//
// Money Moves decides. The Workshop item carries the decision. Quick Sell (the
// Frass Card selling tool) executes it. Central finance stays the only place
// that may ever say money has cleared — nothing here declares an earning.
// ─────────────────────────────────────────────────────────────────────────────

/** Work items born in Money Moves carry this source. */
export const MONEY_MOVE_SOURCE = "money-move";

/** The existing Frass Card selling tool, already live in the Wallet. */
export const SALE_TOOL_PATH = "/workspace/wallet";

export function saleToolHref(workItemId?: string | null): string {
  const q = new URLSearchParams({ section: "sell" });
  if (workItemId) q.set("work", workItemId);
  return `${SALE_TOOL_PATH}?${q.toString()}`;
}

export type SaleState = "not-listed" | "listed" | "awaiting" | "seller-declared";

export type SaleStatus = {
  state: SaleState;
  /** Short badge wording. Never says "earned" or "cleared". */
  label: string;
  /** One plain sentence a member with limited English can read. */
  note: string;
};

type OrderLike = { listing_id: string | null; status: string | null };

/**
 * Truthful status of a Money Move sale, worked out from records that already
 * exist. A seller ticking "paid" is reported as seller-declared only — Frass
 * has not verified it and central finance has not cleared it.
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
  if (mine.some((o) => o.status === "pending")) {
    return {
      state: "awaiting",
      label: "Awaiting payment confirmation",
      note: "Someone started buying. The money is not confirmed yet, so nothing is counted as earned.",
    };
  }
  if (mine.some((o) => o.status === "paid")) {
    return {
      state: "seller-declared",
      label: "Marked paid by you — not verified",
      note: "You marked this paid. Frass has not verified it, so it stays awaiting in your Financial Center.",
    };
  }
  return {
    state: "listed",
    label: "Live on your card",
    note: "No open order right now.",
  };
}

/** The one Money Move V1 can actually carry all the way through. */
export const FIRST_SALE_MOVE = {
  title: "Put one thing up for sale on your Frass Card",
  detail:
    "Add a photo, a price and how many you have. It goes live on your card straight away, and anyone with your link can buy it.",
};
