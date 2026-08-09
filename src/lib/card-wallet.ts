// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0429 — The Frass Card Wallet
//
// Constitutional principle:
//   "One card. One wallet. Every way a member can be paid, and every way a
//    member can be reached, live in the same place."
//
// The Wallet is the seller's side of the Frass Card. Quick Sell, payment links,
// gifts, tips, sales, statements and the payout account are one hub — not
// scattered panels. The public card is the buyer's side: a single row of
// unmistakable actions.
//
// What this means in plain English: the card is the shopfront window, the
// wallet is the counter behind it. Same building, two doors.
// ─────────────────────────────────────────────────────────────────────────────

import type { CardOrder } from "@/lib/card-commerce.functions";

export const WALLET_PRINCIPLE =
  "Your Frass Card is your identity and your point of sale. The Wallet is where the money, the items you sell and the record of every transaction live together.";

/* ── The public action bar ───────────────────────────────────────────────── */
// Nine possible doors. A card only ever shows the ones the member has opened,
// so an empty card never lies about what it can do.

export const CARD_ACTIONS = [
  { id: "follow", label: "Follow", plain: "Keep this card on your device." },
  { id: "message", label: "Message", plain: "Reach them directly." },
  { id: "shop", label: "Shop", plain: "Their shop — one item or five hundred, same door." },
  { id: "book", label: "Book", plain: "Take a time in their calendar." },
  { id: "pay", label: "Pay", plain: "The universal payment door — pay them straight into their own account." },
  { id: "gift", label: "Send gift", plain: "A gift with a note attached." },
  { id: "tip", label: "Tip", plain: "A thank-you for their work." },
  { id: "listen", label: "Listen", plain: "Their music, radio or media." },
  { id: "portfolio", label: "Portfolio", plain: "Their work in full." },
  { id: "website", label: "Website", plain: "Their own site." },
  { id: "save", label: "Save contact", plain: "Add them to your phone." },
] as const;

export type CardActionId = (typeof CARD_ACTIONS)[number]["id"];

export function actionPlain(id: string): string {
  return CARD_ACTIONS.find((a) => a.id === id)?.plain ?? "";
}

/** Money that is sent, not bought: a payment, a gift or a tip. */
export const DIRECT_PAYMENT_KINDS = [
  { id: "money", label: "Pay", note: "A straight payment." },
  { id: "gift", label: "Send a gift", note: "A gift with a note." },
  { id: "tip", label: "Leave a tip", note: "A thank-you for their work." },
] as const;

export type DirectPaymentKind = (typeof DIRECT_PAYMENT_KINDS)[number]["id"];

export const SUGGESTED_AMOUNTS = [5, 10, 25, 50, 100];

/* ── Wallet hub sections ─────────────────────────────────────────────────── */
// FRASS-0429: everything financial lives in the Wallet. Quick Sell moved here
// from the Card Studio — the card is identity, the Wallet is money.

export const WALLET_SECTIONS = [
  { id: "balance", label: "Available balance", plain: "What has come in, and what is still owed to you." },
  { id: "withdraw", label: "Withdraw", plain: "How money reaches your bank." },
  { id: "deposit", label: "Deposit", plain: "How money arrives into your account." },
  { id: "history", label: "Payment history", plain: "Every movement, newest first." },
  { id: "sell", label: "Quick Sell", plain: "Photo, price, quantity — live on your card in seconds." },
  { id: "items", label: "My items", plain: "Everything currently for sale from your card." },
  { id: "invoices", label: "Invoices", plain: "Ask someone for a specific amount." },
  { id: "links", label: "Payment links", plain: "A link that opens your Pay door with the amount ready." },
  { id: "gifts", label: "Gifts", plain: "Gifts received, with their notes." },
  { id: "tips", label: "Tips", plain: "Thank-yous for your work." },
  { id: "taxes", label: "Taxes", plain: "The numbers your accountant will ask for." },
  { id: "statements", label: "Statements", plain: "Download the record for your books." },
  { id: "payouts", label: "Payment account", plain: "Where the money actually lands." },
] as const;

export type WalletSectionId = (typeof WALLET_SECTIONS)[number]["id"];

/* ── Balance maths ───────────────────────────────────────────────────────── */

export type WalletSummary = {
  settled: number;
  pending: number;
  allocation: number;
  processing: number;
  net: number;
  sales: number;
  gifts: number;
  tips: number;
  count: number;
  currency: string;
};

const round = (n: number) => Math.round(n * 100) / 100;

export function referenceKind(reference: string | null): "gift" | "tip" | "money" | "sale" {
  if (!reference) return "sale";
  if (reference.startsWith("gift")) return "gift";
  if (reference.startsWith("tip")) return "tip";
  if (reference.startsWith("money")) return "money";
  return "sale";
}

export function summariseWallet(orders: CardOrder[]): WalletSummary {
  const s: WalletSummary = {
    settled: 0,
    pending: 0,
    allocation: 0,
    processing: 0,
    net: 0,
    sales: 0,
    gifts: 0,
    tips: 0,
    count: orders.length,
    currency: orders[0]?.currency ?? "USD",
  };

  for (const o of orders) {
    const gross = Number(o.subtotal) || 0;
    if (o.status === "cancelled" || o.status === "refunded") continue;
    if (o.status === "paid") {
      s.settled += gross;
      s.allocation += Number(o.platform_fee) || 0;
      s.processing += Number(o.processing_fee_estimate) || 0;
      s.net += Number(o.net_to_seller) || 0;
    } else {
      s.pending += gross;
    }
    const kind = referenceKind(o.reference);
    if (kind === "gift") s.gifts += gross;
    else if (kind === "tip") s.tips += gross;
    else s.sales += gross;
  }

  return {
    ...s,
    settled: round(s.settled),
    pending: round(s.pending),
    allocation: round(s.allocation),
    processing: round(s.processing),
    net: round(s.net),
    sales: round(s.sales),
    gifts: round(s.gifts),
    tips: round(s.tips),
  };
}

export function orderKindLabel(reference: string | null): string {
  switch (referenceKind(reference)) {
    case "gift":
      return "Gift";
    case "tip":
      return "Tip";
    case "money":
      return "Money sent";
    default:
      return "Sale";
  }
}

/* ── Statements ──────────────────────────────────────────────────────────── */

export function statementCsv(orders: CardOrder[]): string {
  const head = [
    "date",
    "type",
    "status",
    "quantity",
    "unit_price",
    "gross",
    "frass_allocation",
    "processing_estimate",
    "net_to_you",
    "currency",
    "buyer",
    "note",
  ].join(",");

  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const rows = orders.map((o) =>
    [
      o.created_at,
      orderKindLabel(o.reference),
      o.status,
      o.quantity,
      o.unit_price,
      o.subtotal,
      o.platform_fee,
      o.processing_fee_estimate,
      o.net_to_seller,
      o.currency,
      o.buyer_name || o.buyer_email || "",
      o.reference ?? "",
    ]
      .map(esc)
      .join(","),
  );

  return [head, ...rows].join("\n");
}

/* ── Cards a visitor has chosen to keep ──────────────────────────────────── */
// No account required. Following a card on Frass first means keeping it.

const FOLLOW_KEY = "frass.card.following";

export function readFollowing(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FOLLOW_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toggleFollowing(handle: string): boolean {
  if (typeof window === "undefined") return false;
  const list = readFollowing();
  const next = list.includes(handle) ? list.filter((h) => h !== handle) : [...list, handle];
  try {
    window.localStorage.setItem(FOLLOW_KEY, JSON.stringify(next.slice(0, 200)));
  } catch {
    /* private browsing — the card simply isn't kept */
  }
  return next.includes(handle);
}

/* ── Contact channels a member has actually published ────────────────────── */

export type ContactChannel = { id: string; label: string; href: string };

export function contactChannels(socialLinks: unknown): ContactChannel[] {
  const links = (socialLinks ?? {}) as Record<string, unknown>;
  const value = (k: string) => {
    const v = links[k];
    return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
  };

  const out: ContactChannel[] = [];
  const whatsapp = value("whatsapp");
  if (whatsapp)
    out.push({
      id: "whatsapp",
      label: "WhatsApp",
      href: whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
    });
  const email = value("email");
  if (email) out.push({ id: "email", label: "Email", href: `mailto:${email}` });
  const phone = value("phone");
  if (phone) out.push({ id: "phone", label: "Call", href: `tel:${phone}` });
  const sms = value("sms");
  if (sms) out.push({ id: "sms", label: "Text", href: `sms:${sms}` });
  return out;
}

/** Media channels — the "Listen" door. */
export function mediaChannels(socialLinks: unknown): ContactChannel[] {
  const links = (socialLinks ?? {}) as Record<string, unknown>;
  const keys = ["spotify", "applemusic", "apple_music", "soundcloud", "youtube", "radio", "music"];
  const labels: Record<string, string> = {
    spotify: "Spotify",
    applemusic: "Apple Music",
    apple_music: "Apple Music",
    soundcloud: "SoundCloud",
    youtube: "YouTube",
    radio: "Frass Radio",
    music: "Music",
  };
  return keys
    .map((k) => {
      const v = links[k];
      return typeof v === "string" && v.trim() ? { id: k, label: labels[k] ?? k, href: v.trim() } : null;
    })
    .filter((x): x is ContactChannel => x !== null);
}

/* ── Save to phone ───────────────────────────────────────────────────────── */

export function vCard(opts: {
  name: string;
  title?: string | null;
  company?: string | null;
  website?: string | null;
  cardUrl: string;
}): string {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${opts.name}`,
    opts.company ? `ORG:${opts.company}` : null,
    opts.title ? `TITLE:${opts.title}` : null,
    opts.website ? `URL:${opts.website}` : null,
    `URL:${opts.cardUrl}`,
    `NOTE:Frass Card — ${opts.cardUrl}`,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");
}
