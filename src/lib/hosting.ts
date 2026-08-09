// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0420 — Frass Hosting & Infrastructure Philosophy
//
// Model 2 (Founder approved): Frass offers hosting as a paid platform service.
// The customer buys hosting from Frass. Frass runs the service on mature cloud
// infrastructure underneath, covers that cost out of the hosting revenue, and
// keeps a reasonable operating margin.
//
// Constitutional principle:
//   Frass builds experiences, not commodity infrastructure. Where mature,
//   secure and scalable infrastructure already exists, Frass may use it so the
//   team can focus on creating exceptional products. Infrastructure should
//   never become a distraction from innovation.
//
// Plain English: when you buy Shopify you never ask who Shopify's cloud
// provider is. You just buy Shopify. That is exactly the experience Frass gives.
// ─────────────────────────────────────────────────────────────────────────────

export const FRASS_0420_PRINCIPLE =
  "Frass may provide hosting as a paid platform service. The cost of hosting is covered by the customer purchasing the hosting plan. Frass prices its hosting sustainably so that infrastructure costs are covered and the platform earns a reasonable operating margin.";

export const FRASS_0420_PLAIN =
  "What this means in plain English: yes, Frass offers hosting. No, Frass does not give it away or quietly absorb the ongoing cost. You buy a hosting plan from Frass, Frass runs the service and pays whatever infrastructure sits underneath, and keeps a fair margin to operate and improve the platform.";

// ── What happens when someone clicks Publish ────────────────────────────────

export type PublishOptionId = "frass" | "own" | "export";

export type PublishOption = {
  id: PublishOptionId;
  emoji: string;
  label: string;
  recommended?: boolean;
  tagline: string;
  plain: string;
  includes: string[];
  who: string;
};

export const PUBLISH_OPTIONS: PublishOption[] = [
  {
    id: "frass",
    emoji: "🏝",
    label: "Host with Frass",
    recommended: true,
    tagline: "One click. Your business is live.",
    plain:
      "What this means in plain English: Frass keeps your website switched on, safe and fast, and you pay Frass one monthly price for it — like paying rent on a shop that someone else maintains.",
    includes: [
      "Fast setup",
      "Automatic SSL",
      "Automatic updates",
      "Automatic backups",
      "Custom domains",
      "Security & monitoring",
      "Analytics",
      "Support",
    ],
    who: "Recommended for almost everyone.",
  },
  {
    id: "own",
    emoji: "🌍",
    label: "Connect your own hosting",
    tagline: "Point Frass at infrastructure you already pay for.",
    plain:
      "What this means in plain English: you already rent space somewhere else, so Frass just delivers the building to that address. Frass charges nothing, and your provider bills you directly.",
    includes: ["Deployment guide", "Domain configuration help", "Frassy walks you through it"],
    who: "Advanced builders and existing agencies.",
  },
  {
    id: "export",
    emoji: "📦",
    label: "Export your website",
    tagline: "Download everything and host it yourself.",
    plain:
      "What this means in plain English: you take the keys and the blueprints with you. Nothing is locked inside Frass.",
    includes: ["Full source export", "Assets and brand kit", "No lock-in, ever"],
    who: "Builders who want total control.",
  },
];

// ── The hosting shelf ───────────────────────────────────────────────────────

export type FrassHostingPlan = {
  id: string;
  label: string;
  /** What the customer pays Frass, per month. */
  price: number;
  /** Discounted equivalent when paid yearly (two months free). */
  yearlyPrice: number;
  /** Internal estimate of what the infrastructure actually costs Frass. */
  infrastructureCost: number;
  for: string;
  includes: string[];
  limits: string;
  recommended?: boolean;
};

export const FRASS_HOSTING_PLANS: FrassHostingPlan[] = [
  {
    id: "frass-landing",
    label: "Frass Landing Page",
    price: 0,
    yearlyPrice: 0,
    infrastructureCost: 0.2,
    for: "Every Frass member — creators, musicians, DJs, builders, farmers, affiliates.",
    includes: [
      "Beautiful Frass profile",
      "About, portfolio and social links",
      "Contact button",
      "For Us integration",
      "Marketplace integration",
      "Frass Wallet",
      "Live streaming",
      "FV Studios integration",
    ],
    limits: "Always free. Lives on a Frass address.",
  },
  {
    id: "frass-starter",
    label: "Frass Hosting — Starter",
    price: 8,
    yearlyPrice: 80,
    infrastructureCost: 2.4,
    for: "A first real business website.",
    includes: [
      "Custom domain",
      "Unlimited pages",
      "Blog",
      "Automatic SSL, backups and updates",
      "Analytics",
      "Email support",
    ],
    limits: "Comfortable for a new business: around 25k visits and 10 GB transfer a month.",
    recommended: true,
  },
  {
    id: "frass-business",
    label: "Frass Hosting — Business",
    price: 19,
    yearlyPrice: 190,
    infrastructureCost: 6.5,
    for: "A business that is actually trading.",
    includes: [
      "Everything in Starter",
      "Online store and orders",
      "Bookings and appointments",
      "Customer accounts and CRM",
      "Memberships",
      "Email marketing",
      "AI chatbot trained on your business",
      "SEO tools",
      "Staging preview",
    ],
    limits: "Around 250k visits and 100 GB transfer a month.",
  },
  {
    id: "frass-commerce",
    label: "Frass Hosting — Commerce",
    price: 39,
    yearlyPrice: 390,
    infrastructureCost: 14,
    for: "Multi-product, multi-location and high-traffic operations.",
    includes: [
      "Everything in Business",
      "Inventory and invoicing",
      "Multiple storefronts and markets",
      "Advanced integrations",
      "Priority rebuilds and support",
      "Business email (coming)",
    ],
    limits: "High-traffic capacity; overages billed at cost with a warning first.",
  },
];

export type HostingMargin = {
  price: number;
  infrastructureCost: number;
  margin: number;
  marginPct: number;
  annualMargin: number;
};

/** Founder-facing sustainability maths — never shown as a cost to the customer. */
export function hostingMargin(plan: FrassHostingPlan): HostingMargin {
  const margin = Math.round((plan.price - plan.infrastructureCost) * 100) / 100;
  return {
    price: plan.price,
    infrastructureCost: plan.infrastructureCost,
    margin,
    marginPct: plan.price > 0 ? Math.round((margin / plan.price) * 100) : 0,
    annualMargin: Math.round(margin * 12 * 100) / 100,
  };
}

// ── Free landing page vs paid business website ──────────────────────────────

export type TierComparisonRow = { capability: string; free: boolean; paid: boolean };

export const TIER_COMPARISON: TierComparisonRow[] = [
  { capability: "Frass profile page", free: true, paid: true },
  { capability: "Portfolio, links and contact button", free: true, paid: true },
  { capability: "For Us, Marketplace, Wallet, Live, FV Studios", free: true, paid: true },
  { capability: "Custom domain (yourbrand.com)", free: false, paid: true },
  { capability: "Unlimited pages", free: false, paid: true },
  { capability: "Blog", free: false, paid: true },
  { capability: "Booking system and deposits", free: false, paid: true },
  { capability: "Customer accounts", free: false, paid: true },
  { capability: "Online store", free: false, paid: true },
  { capability: "Memberships", free: false, paid: true },
  { capability: "Email marketing", free: false, paid: true },
  { capability: "Analytics", free: false, paid: true },
  { capability: "AI chatbot", free: false, paid: true },
  { capability: "CRM", free: false, paid: true },
  { capability: "Inventory, orders and invoicing", free: false, paid: true },
  { capability: "Custom branding", free: false, paid: true },
  { capability: "SEO tools", free: false, paid: true },
  { capability: "Appointment scheduling", free: false, paid: true },
  { capability: "Advanced integrations", free: false, paid: true },
  { capability: "Business email (future)", free: false, paid: true },
];

export const TIER_STORY = {
  free: {
    title: "Free Frass Landing Page",
    plain:
      "A beautiful place to be found. Perfect for creators, musicians, DJs, builders, farmers, affiliates and community members.",
  },
  paid: {
    title: "Frass Business Website",
    plain:
      "You are not paying for a page. You are paying for a business that runs: domain, bookings, payments, customers, marketing and reporting in one place.",
  },
  example: {
    who: "A DJ",
    free: ["Portfolio", "Music", "Videos", "Book Me button"],
    paid: [
      "djmichael.com",
      "Booking calendar",
      "Deposits",
      "Contracts",
      "Merchandise",
      "Music sales",
      "Fan memberships",
      "Email list",
      "Analytics",
    ],
  },
} as const;

// ── Infrastructure philosophy ───────────────────────────────────────────────

export const INFRASTRUCTURE_PHASES = [
  {
    phase: "Phase 1 — Now",
    title: "Use established cloud infrastructure",
    plain:
      "Rent the roads instead of building them. Frass spends its years on Frassy, FV Studios, Business Builder, Marketplace, Wallet and community — not on servers, firewalls and load balancers.",
  },
  {
    phase: "Phase 2 — Growth",
    title: "Optimise and negotiate",
    plain:
      "At tens of thousands of customers, Frass negotiates better pricing and moves the heaviest workloads to wherever they run cheapest.",
  },
  {
    phase: "Phase 3 — Scale",
    title: "Own more only when the maths demands it",
    plain:
      "Very few companies ever reach the point where owning everything beats using cloud providers. Frass will only cross that line when the numbers, not the ego, say so.",
  },
] as const;

// ── Legal readiness (not legal advice — a work list for a lawyer) ───────────

export const HOSTING_LEGAL_READINESS = [
  {
    key: "license",
    title: "No special hosting licence is required",
    plain:
      "Hosting websites is not a regulated profession like banking or law. Millions of companies provide or resell hosting without a government licence. What matters is operating like a proper company.",
  },
  { key: "entity", title: "A registered business entity", plain: "A corporation or LLC in your operating country." },
  { key: "tos", title: "Terms of Service", plain: "What Frass promises, and what happens when things go wrong." },
  { key: "privacy", title: "Privacy Policy", plain: "What data you hold, why, and for how long." },
  {
    key: "aup",
    title: "Acceptable Use Policy",
    plain: "What customers may and may not host — the single most important document for a hosting service.",
  },
  { key: "dmca", title: "Copyright / DMCA policy", plain: "How takedown complaints are received and handled." },
  {
    key: "dataprotection",
    title: "Data protection compliance",
    plain: "GDPR, PIPEDA and equivalents, depending on where you and your customers are.",
  },
  { key: "tax", title: "Tax registration", plain: "Recurring digital services are taxable in many markets." },
  { key: "payments", title: "Payment provider compliance", plain: "Stripe and card network rules for recurring billing." },
  { key: "insurance", title: "Business insurance", plain: "Recommended as the customer base grows." },
  { key: "sla", title: "Service level and backup commitments", plain: "Say what uptime and recovery you actually promise." },
] as const;

export const HOSTING_CONSTITUTION = [
  FRASS_0420_PRINCIPLE,
  "Frass builds experiences, not commodity infrastructure.",
  "The customer buys hosting from Frass and never has to know or care who the underlying provider is.",
  "Building and previewing stay free. Publishing to a Frass-hosted business website is a paid plan.",
  "Every Frass member keeps a free landing page, forever.",
  "Optional third-party services outside the hosting plan are still shown at cost before they are switched on.",
  "Nobody is locked in: connect your own hosting or export the whole website at any time.",
] as const;
