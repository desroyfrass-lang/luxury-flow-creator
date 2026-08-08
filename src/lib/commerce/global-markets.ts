/**
 * FRASS-0305 / FRASS-0306 — Global Commerce Architecture.
 *
 * Constitutional principle: Frass is global from day one, but it grows
 * intentionally. Primary Operating Markets provide the commercial foundation;
 * campaigns are free to reach people anywhere in the world.
 *
 * This module is the ONE source of truth for markets, currencies, regional
 * capability and Founder market configuration. It extends `@/lib/region`
 * (the shopper-facing country switcher) rather than duplicating it — a Market
 * is a Region that Frass actively operates in.
 */
import { ALL_REGIONS, findRegion, type Region } from "@/lib/region";

/* ── Markets ─────────────────────────────────────────────────────────────── */

export type MarketTier =
  /** Fully supported commercial region: campaigns, pricing, tax, payouts, analytics. */
  | "primary"
  /** Approved for shipping and sales, managed from a primary market. */
  | "supported"
  /** Reachable by campaigns; commerce follows a primary market's rules. */
  | "reach";

export type MarketId = "CA" | "GB" | "US" | "JM" | "AU" | "NZ" | "SG" | "AE";

export type Market = {
  id: MarketId;
  /** ISO country code — matches `Region.code` so the shopper switcher stays in sync. */
  region: string;
  name: string;
  short: string;
  flag: string;
  currency: string;
  currencyName: string;
  symbol: string;
  tier: MarketTier;
  /** Sub-territories the Founder can target inside the market. */
  territories: string[];
  taxLabel: string;
  taxNote: string;
  shippingNote: string;
  /** Enabled markets appear in Regional Operations; others await Founder approval. */
  enabled: boolean;
};

export const MARKETS: Market[] = [
  {
    id: "CA",
    region: "CA",
    name: "Canada",
    short: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    currencyName: "Canadian Dollar",
    symbol: "$",
    tier: "primary",
    territories: ["Ontario", "Quebec", "British Columbia", "Alberta", "Atlantic Canada", "Prairies", "The North"],
    taxLabel: "GST / HST / QST",
    taxNote:
      "Sales tax varies by province. Frass records tax separately from platform fees and never treats a fee as a tax.",
    shippingNote: "Domestic Canada Post / courier rules, with cross-border US lanes.",
    enabled: true,
  },
  {
    id: "GB",
    region: "GB",
    name: "United Kingdom",
    short: "UK",
    flag: "🇬🇧",
    currency: "GBP",
    currencyName: "British Pound Sterling",
    symbol: "£",
    tier: "primary",
    territories: ["England", "Scotland", "Wales", "Northern Ireland"],
    taxLabel: "VAT",
    taxNote:
      "UK VAT is recorded as a jurisdiction obligation, held separately from revenue. Registration thresholds and filing require professional advice.",
    shippingNote: "UK domestic rules plus Northern Ireland handling; EU lanes treated as export.",
    enabled: true,
  },
  {
    id: "US",
    region: "US",
    name: "United States",
    short: "US",
    flag: "🇺🇸",
    currency: "USD",
    currencyName: "United States Dollar",
    symbol: "$",
    tier: "primary",
    territories: ["Northeast", "South", "Midwest", "West", "Puerto Rico"],
    taxLabel: "State & local sales tax",
    taxNote: "Economic nexus is state by state. Obligations are tracked per jurisdiction, never merged.",
    shippingNote: "Domestic US carriers, with Canada and UK export lanes.",
    enabled: true,
  },
  {
    id: "JM",
    region: "JM",
    name: "Jamaica",
    short: "Jamaica",
    flag: "🇯🇲",
    currency: "JMD",
    currencyName: "Jamaican Dollar",
    symbol: "$",
    tier: "supported",
    territories: ["Kingston", "St. Andrew", "Montego Bay", "Ocho Rios", "Frass Hill parishes"],
    taxLabel: "GCT",
    taxNote: "Home ground. Commerce runs through a primary market until Jamaica is promoted by Founder approval.",
    shippingNote: "Caribbean lanes; consolidation from a primary market.",
    enabled: false,
  },
  {
    id: "AU",
    region: "AU",
    name: "Australia",
    short: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    currencyName: "Australian Dollar",
    symbol: "$",
    tier: "reach",
    territories: ["New South Wales", "Victoria", "Queensland", "Western Australia"],
    taxLabel: "GST",
    taxNote: "Reach market — campaigns can land here, commerce settles through a primary market.",
    shippingNote: "Export lane from a primary market.",
    enabled: false,
  },
  {
    id: "NZ",
    region: "NZ",
    name: "New Zealand",
    short: "New Zealand",
    flag: "🇳🇿",
    currency: "NZD",
    currencyName: "New Zealand Dollar",
    symbol: "$",
    tier: "reach",
    territories: ["North Island", "South Island"],
    taxLabel: "GST",
    taxNote: "Reach market — eligible for promotion to Primary Operating Market by Founder approval.",
    shippingNote: "Export lane from a primary market.",
    enabled: false,
  },
  {
    id: "SG",
    region: "SG",
    name: "Singapore",
    short: "Singapore",
    flag: "🇸🇬",
    currency: "SGD",
    currencyName: "Singapore Dollar",
    symbol: "$",
    tier: "reach",
    territories: ["Singapore"],
    taxLabel: "GST",
    taxNote: "Reach market — eligible for promotion to Primary Operating Market by Founder approval.",
    shippingNote: "Export lane from a primary market.",
    enabled: false,
  },
  {
    id: "AE",
    region: "AE",
    name: "United Arab Emirates",
    short: "UAE",
    flag: "🇦🇪",
    currency: "AED",
    currencyName: "UAE Dirham",
    symbol: "د.إ",
    tier: "reach",
    territories: ["Dubai", "Abu Dhabi", "Sharjah"],
    taxLabel: "VAT",
    taxNote: "Reach market — eligible for promotion to Primary Operating Market by Founder approval.",
    shippingNote: "Export lane from a primary market.",
    enabled: false,
  },
];

export const PRIMARY_MARKETS = MARKETS.filter((m) => m.tier === "primary");
export const PRIMARY_MARKET_IDS = PRIMARY_MARKETS.map((m) => m.id);
export const PRIMARY_CURRENCIES = PRIMARY_MARKETS.map((m) => m.currency);

export function findMarket(id: string | null | undefined): Market {
  return MARKETS.find((m) => m.id === id) ?? PRIMARY_MARKETS[0]!;
}

/** The shopper-facing Region behind a Market, so both systems stay one truth. */
export function marketRegion(m: Market): Region {
  return findRegion(m.region);
}

/** Regions Frass can ship to that are not yet markets of their own. */
export function reachOnlyRegions(): Region[] {
  const claimed = new Set(MARKETS.map((m) => m.region));
  return ALL_REGIONS.filter((r) => !claimed.has(r.code));
}

export function marketMoney(amount: number, market: Market): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: market.currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/* ── Audience reach (separate concept from origin) ───────────────────────── */

export type AudienceId =
  | "global"
  | "north-america"
  | "uk-ireland"
  | "europe"
  | "caribbean"
  | "africa"
  | "asia"
  | "oceania"
  | "diaspora";

export type Audience = { id: AudienceId; label: string; flag: string; examples: string[] };

export const AUDIENCES: Audience[] = [
  { id: "global", label: "Global", flag: "🌍", examples: ["Everywhere Frass can be seen"] },
  { id: "north-america", label: "North America", flag: "🌎", examples: ["Canada", "United States", "Mexico"] },
  { id: "uk-ireland", label: "UK & Ireland", flag: "🇬🇧", examples: ["England", "Scotland", "Wales", "Northern Ireland", "Ireland"] },
  { id: "europe", label: "Europe", flag: "🇪🇺", examples: ["France", "Germany", "Netherlands", "Spain"] },
  { id: "caribbean", label: "Caribbean", flag: "🌴", examples: ["Jamaica", "Trinidad & Tobago", "Barbados"] },
  { id: "africa", label: "Africa", flag: "🌍", examples: ["Nigeria", "Ghana", "Kenya", "South Africa"] },
  { id: "asia", label: "Asia", flag: "🌏", examples: ["India", "Japan", "Singapore"] },
  { id: "oceania", label: "Oceania", flag: "🌊", examples: ["Australia", "New Zealand"] },
  { id: "diaspora", label: "Global diaspora", flag: "🕊️", examples: ["Caribbean and African diaspora, wherever they live"] },
];

export function findAudience(id: string): Audience {
  return AUDIENCES.find((a) => a.id === id) ?? AUDIENCES[0]!;
}

/* ── Regional capability register ────────────────────────────────────────── */

export type CapabilityStatus =
  /** Built in the platform and usable today. */
  | "live"
  /** Configurable now, but needs a provider or integration before it transacts. */
  | "configurable"
  /** Approved architecture, awaiting Founder commissioning. */
  | "planned";

export type Capability = {
  id: string;
  label: string;
  group: "Storefront" | "Commerce" | "Finance" | "Marketing" | "Network" | "Analytics";
  status: CapabilityStatus;
  note: string;
};

/**
 * Frassy must always distinguish verified capability from a recommendation.
 * This register is what she reads before answering "can we do that in the UK?".
 */
export const REGIONAL_CAPABILITIES: Capability[] = [
  { id: "storefront", label: "Regional storefront experience", group: "Storefront", status: "live", note: "Region switcher drives the shopping market across the site." },
  { id: "exclusive-launch", label: "Region-exclusive product launches", group: "Storefront", status: "configurable", note: "Products can be scoped to a market; requires inventory allocation." },
  { id: "exclusive-collection", label: "Region-exclusive collections", group: "Storefront", status: "configurable", note: "Collections carry a market scope." },
  { id: "banners", label: "Regional homepage banners", group: "Storefront", status: "configurable", note: "Site image and text slots resolve per market." },
  { id: "pricing", label: "Regional pricing & currency", group: "Commerce", status: "live", note: "CAD, GBP and USD are primary operating currencies." },
  { id: "shipping", label: "Regional shipping rules", group: "Commerce", status: "configurable", note: "Rules are configured per market; carrier accounts required to quote live rates." },
  { id: "marketplace-scope", label: "Marketplace seller region scope", group: "Commerce", status: "configurable", note: "Sell globally, sell in one market only, or exclude a market." },
  { id: "inventory", label: "Region-specific inventory", group: "Commerce", status: "planned", note: "Awaiting warehouse allocation per market." },
  { id: "tax", label: "Regional tax configuration", group: "Finance", status: "configurable", note: "VAT / GST / sales tax recorded separately from platform fees. Filing needs professional advice." },
  { id: "payouts", label: "Regional payout configuration", group: "Finance", status: "planned", note: "Withdrawal rails sit in the commissioning queue." },
  { id: "providers", label: "Regional payment providers", group: "Finance", status: "configurable", note: "Set per market in the Payment Provider Center — nothing is hard-coded." },
  { id: "campaigns", label: "Regional campaigns", group: "Marketing", status: "live", note: "Every campaign stores an origin market and its audience reach independently." },
  { id: "seasonal", label: "Regional seasonal events", group: "Marketing", status: "live", note: "Campaign calendar is per market." },
  { id: "email", label: "Regional email campaigns", group: "Marketing", status: "configurable", note: "Requires the email sending domain to be connected." },
  { id: "sms", label: "Regional SMS campaigns", group: "Marketing", status: "planned", note: "Needs an SMS provider per market where permitted." },
  { id: "push", label: "Regional push notifications", group: "Marketing", status: "planned", note: "Needs push delivery per market where permitted." },
  { id: "affiliate", label: "Regional affiliate campaigns", group: "Network", status: "live", note: "Affiliate Intelligence Engine clamps commission per product, per market." },
  { id: "creators", label: "Regional creator & influencer partnerships", group: "Network", status: "configurable", note: "Creator roster is scoped by market." },
  { id: "analytics", label: "Regional analytics", group: "Analytics", status: "live", note: "Revenue, orders, conversion, marketplace, affiliate and growth — filterable by market." },
  { id: "origin-vs-reach", label: "Origin vs audience reporting", group: "Analytics", status: "live", note: "Where a campaign launched from is never merged with where it landed." },
];

export const CAPABILITY_GROUPS = ["Storefront", "Commerce", "Finance", "Marketing", "Network", "Analytics"] as const;

/* ── Founder market configuration (per market, persisted locally) ────────── */

export type MarketConfig = {
  enabled: boolean;
  currency: string;
  /** Free-text price adjustment note; real pricing lives with the product. */
  priceNote: string;
  freeShippingThreshold: number;
  taxRegistered: boolean;
  taxNumber: string;
  supportHours: string;
  provider: string;
};

export function defaultMarketConfig(m: Market): MarketConfig {
  return {
    enabled: m.enabled,
    currency: m.currency,
    priceNote: "",
    freeShippingThreshold: 0,
    taxRegistered: false,
    taxNumber: "",
    supportHours: "",
    provider: "",
  };
}

export type MarketConfigMap = Partial<Record<MarketId, MarketConfig>>;

const CONFIG_KEY = "frass.markets.config.v1";

export function loadMarketConfigs(): MarketConfigMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    return raw ? (JSON.parse(raw) as MarketConfigMap) : {};
  } catch {
    return {};
  }
}

export function saveMarketConfigs(map: MarketConfigMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify(map));
  } catch {
    /* best effort */
  }
}

export function marketConfig(map: MarketConfigMap, m: Market): MarketConfig {
  return { ...defaultMarketConfig(m), ...(map[m.id] ?? {}) };
}

export const GLOBAL_COMMERCE_PRINCIPLE =
  "Frass is built globally from day one, but it grows intentionally. Primary Operating Markets provide the commercial foundation, while campaigns are free to inspire and reach people anywhere in the world. Every campaign knows where it started, who it was meant to reach, and where it ultimately made an impact.";
