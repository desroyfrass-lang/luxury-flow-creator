/**
 * FRASS-0306 — Campaign architecture.
 *
 * A campaign has an ORIGIN (the primary market it is managed and accounted
 * from) and an AUDIENCE (everywhere it is meant to reach). The two are never
 * merged: reporting must always answer "where did this launch from?" and
 * "where did it actually land?" separately.
 */
import { AUDIENCES, findAudience, findMarket, PRIMARY_MARKET_IDS, type AudienceId, type MarketId } from "./global-markets";

export type CampaignKind =
  | "new-arrivals"
  | "seasonal"
  | "holiday"
  | "creator"
  | "community"
  | "foundation"
  | "launch";

export const CAMPAIGN_KINDS: { id: CampaignKind; label: string; plain: string }[] = [
  { id: "new-arrivals", label: "New arrivals", plain: "Telling people what just landed." },
  { id: "seasonal", label: "Seasonal promotion", plain: "A push tied to the time of year." },
  { id: "holiday", label: "Holiday campaign", plain: "Built around a specific holiday." },
  { id: "creator", label: "Creator collaboration", plain: "Run with a creator or influencer." },
  { id: "community", label: "Community initiative", plain: "Something for the people, not just for sales." },
  { id: "foundation", label: "Foundation campaign", plain: "Raising or directing money to the Foundation." },
  { id: "launch", label: "Product launch", plain: "One product or drop getting its own moment." },
];

export type CampaignStatus = "draft" | "scheduled" | "live" | "ended";

export type Campaign = {
  id: string;
  name: string;
  kind: CampaignKind;
  /** Where the campaign is managed and accounted from — always a primary market. */
  origin: MarketId;
  /** Optional territories inside the origin market (England, Ontario, …). */
  territories: string[];
  /** Where it is meant to reach. Independent of origin. */
  audiences: AudienceId[];
  startsOn: string;
  endsOn: string;
  status: CampaignStatus;
  notes: string;
  createdAt: string;
};

export function newCampaign(origin: MarketId = "GB"): Campaign {
  return {
    id: `cmp_${Math.random().toString(36).slice(2, 10)}`,
    name: "",
    kind: "new-arrivals",
    origin,
    territories: [],
    audiences: ["global"],
    startsOn: "",
    endsOn: "",
    status: "draft",
    notes: "",
    createdAt: new Date().toISOString(),
  };
}

const KEY = "frass.campaigns.v1";

export function loadCampaigns(): Campaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Campaign[]) : [];
    return list.filter((c) => PRIMARY_MARKET_IDS.includes(c.origin));
  } catch {
    return [];
  }
}

export function saveCampaigns(list: Campaign[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* best effort */
  }
}

/** One line the Founder can read back before launching. */
export function campaignSummary(c: Campaign): string {
  const origin = findMarket(c.origin);
  const reach = c.audiences.map((a) => findAudience(a).label).join(", ") || "no audience selected yet";
  const where = c.territories.length ? ` (${c.territories.join(", ")})` : "";
  return `Managed from ${origin.flag} ${origin.name}${where} in ${origin.currency}, meant to reach ${reach}.`;
}

export function campaignPlain(c: Campaign): string {
  const origin = findMarket(c.origin);
  return `What that means is… the money and the paperwork for this one belong to ${origin.name}, but the campaign itself is allowed to travel. If someone in Japan buys because of it, the sale still reports home to ${origin.short}, and the reach still counts as Japan.`;
}

/* ── Analytics scaffolding (honest zeros until orders exist) ─────────────── */

export type MarketMetric = {
  id: string;
  label: string;
  value: string;
  plain: string;
  /** Where the number comes from — never invented. */
  provenance: "live" | "awaiting-data" | "needs-integration";
};

export function marketMetrics(marketId: MarketId): MarketMetric[] {
  const m = findMarket(marketId);
  const zero = new Intl.NumberFormat("en", { style: "currency", currency: m.currency }).format(0);
  return [
    { id: "revenue", label: `${m.short} revenue`, value: zero, plain: `No ${m.short} orders have settled yet, so this is a true zero — not a loading state.`, provenance: "awaiting-data" },
    { id: "orders", label: `${m.short} orders`, value: "0", plain: "Order count starts moving the first time someone checks out in this market.", provenance: "awaiting-data" },
    { id: "conversion", label: `${m.short} conversion rate`, value: "—", plain: "Conversion needs both visits and orders before it means anything.", provenance: "awaiting-data" },
    { id: "customers", label: `${m.short} customer growth`, value: "0", plain: "New customers in this market over the period.", provenance: "awaiting-data" },
    { id: "marketplace", label: `${m.short} marketplace performance`, value: zero, plain: "Partner and curated brand sales attributed to this market.", provenance: "awaiting-data" },
    { id: "affiliate", label: `${m.short} affiliate performance`, value: zero, plain: "Commission earned by creators and affiliates working this market.", provenance: "awaiting-data" },
    { id: "campaigns", label: `${m.short} campaign results`, value: "0", plain: "Results appear once a campaign from this market goes live.", provenance: "awaiting-data" },
  ];
}

export type ReachRow = { audience: string; flag: string; sessions: string; orders: string; revenue: string };

/** Origin-vs-reach table: the same campaign reported two different ways. */
export function reachRows(marketId: MarketId, audiences: AudienceId[]): ReachRow[] {
  const m = findMarket(marketId);
  const zero = new Intl.NumberFormat("en", { style: "currency", currency: m.currency }).format(0);
  const list = audiences.length ? audiences : AUDIENCES.map((a) => a.id);
  return list.map((id) => {
    const a = findAudience(id);
    return { audience: a.label, flag: a.flag, sessions: "0", orders: "0", revenue: zero };
  });
}
