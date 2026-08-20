// FRASS-0573 — one commit path for the Founder Audit Ledger.
// Writes the local mirror first (instant, survives refresh) and then the
// permanent database record. A network hiccup can never erase a review.
import { appendAuditLedgerLocal, mergeAuditLedger } from "@/lib/founder/audit-ledger";
import { appendAuditLedgerEntry, listAuditLedger } from "@/lib/founder/audit-ledger.functions";

export type CommitInput = {
  cardKey: string;
  cardNumber: number;
  cardTitle: string;
  cardPath: string;
  role: "user" | "assistant";
  content: string;
};

export function commitAuditTurn(entry: CommitInput) {
  const local = appendAuditLedgerLocal(entry);
  void appendAuditLedgerEntry({ data: { ...entry, createdAt: local.createdAt } }).catch(() => {
    /* offline or not signed in — the local mirror still holds the review */
  });
  return local;
}

/** Pull the permanent record down and merge it into the local journal. */
export async function syncAuditLedger() {
  try {
    const rows = await listAuditLedger();
    mergeAuditLedger(
      rows.map((r) => ({
        id: r.id,
        cardKey: r.card_key,
        cardNumber: r.card_number,
        cardTitle: r.card_title,
        cardPath: r.card_path,
        role: r.role,
        content: r.content,
        createdAt: r.created_at,
      })),
    );
  } catch {
    /* not the Founder, or offline — the local journal stands on its own */
  }
}
