---
name: Frass Card Wallet & action bar (FRASS-0429)
description: Frass Card Wallet hub at /workspace/wallet (Quick Sell merged in) and the public card action bar (Follow, Message, Buy, Book, Send money, Gift, Tip, Listen, Website, Save contact)
type: feature
---

FRASS-0429 — the Frass Card becomes a two-sided object.

**Public side (buyer):** `CardActionBar` under the hero on `/card/$handle`.
Doors only appear when the member has actually opened them: Follow (kept on the
visitor's device, no account needed), Message (only when a contact channel is
published in `social_links`), Buy (anchors to `#card-shop`), Book, Send money /
Send gift / Tip (only when commerce is on), Listen (music links), Website, Save
contact (vCard download).

**Owner side (seller):** Wallet hub at `/workspace/wallet` with sections
Balance, Quick Sell, My items, Money in, Payment account, Statements (CSV).
Quick Sell was removed from the Card Studio — the studio now links to the Wallet.

Money never touches Frass: direct payments create a `card_orders` row with
`listing_id = null` and a `reference` prefixed `money:` / `gift:` / `tip:`, then
open the member's own payout URL. Server fn: `startCardPayment`.

Quick Sell photos upload to the private `card-media` storage bucket (member's own
folder) and are surfaced through a ten-year signed URL.
