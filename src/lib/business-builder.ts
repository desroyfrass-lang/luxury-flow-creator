// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0419 — Frass Business Builder (powered by Frass Vision Studios)
// FRASS-0419A — Hosting & Cost Constitution
//
// Other builders ask "what website do you want?". Frassy asks "what business
// are you trying to build?" — and then builds the whole operating business.
//
// Constitutional rule (0419A): Frass never silently absorbs third-party
// operating costs. Every external cost is shown, attributed to its provider,
// and approved by the customer before anything is published.
// ─────────────────────────────────────────────────────────────────────────────

export type BuildPathId = "inside" | "independent";

export type BuildPath = {
  id: BuildPathId;
  label: string;
  tagline: string;
  detail: string;
  plain: string;
  connects: string[];
};

export const BUILD_PATHS: BuildPath[] = [
  {
    id: "inside",
    label: "Build inside Frass",
    tagline: "A destination that lives in the ecosystem",
    detail:
      "Your business gets a home inside Frass — shop.frass, creator.frass, portfolio.frass — wired into the marketplace, wallet, affiliate system and community from the first day.",
    plain:
      "What this means in plain English: it's like opening a store inside a busy shopping centre. The building, the traffic and the till are already there.",
    connects: [
      "Marketplace",
      "Frass Wallet",
      "Affiliate System",
      "Brand Partnerships",
      "FV Studios",
      "Frass Radio",
      "The Daily",
      "Financial Center",
      "Projects",
      "Search",
    ],
  },
  {
    id: "independent",
    label: "Build an independent website",
    tagline: "Your own domain, your own hosting",
    detail:
      "Frassy generates a complete standalone website you can point at your own domain, host with Frass, host elsewhere, or export entirely. You keep control of where it lives.",
    plain:
      "What this means in plain English: it's like building your own shop on your own street. More freedom, and the rent is yours.",
    connects: ["Frass Wallet (optional)", "Marketplace (optional)", "Affiliate System (optional)"],
  },
];

export type BuildMode = { id: string; label: string; note: string };

export const BUILD_MODES: BuildMode[] = [
  { id: "prompt", label: "Prompt builder", note: "Describe it once, Frassy drafts the whole business." },
  { id: "conversation", label: "Conversation builder", note: "One question at a time, guided end to end." },
  { id: "visual", label: "Visual builder", note: "Drag, drop and rearrange on the page itself." },
  { id: "code", label: "Manual code editing", note: "For advanced builders who want the controls." },
  { id: "screenshot", label: "Import from screenshots", note: "Show Frassy a picture of what you want." },
  { id: "pdf", label: "Import from a PDF", note: "Brochures, menus and decks become pages." },
  { id: "figma", label: "Import from Figma", note: "Bring a design straight across." },
  { id: "site", label: "Import an existing site", note: "Where it is legally yours to bring." },
];

export type BusinessType = {
  id: string;
  label: string;
  emoji: string;
  summary: string;
  modules: string[];
};

/** Frassy starts with business types, never with blank templates. */
export const BUSINESS_TYPES: BusinessType[] = [
  { id: "restaurant", label: "Restaurant", emoji: "🍽️", summary: "Menu, bookings, ordering and local reach.", modules: ["payments", "appointments", "blog", "seo", "crm"] },
  { id: "fashion", label: "Fashion brand", emoji: "👗", summary: "Catalog, drops, lookbooks and affiliates.", modules: ["payments", "catalog", "marketplace", "affiliate", "brand-partnerships", "email"] },
  { id: "label", label: "Record label", emoji: "🎵", summary: "Roster, releases, radio and royalties.", modules: ["radio", "podcast", "payments", "affiliate", "analytics"] },
  { id: "film", label: "Film studio", emoji: "🎬", summary: "Slate, screenings and production partners.", modules: ["fv-studios", "live", "payments", "brand-partnerships"] },
  { id: "church", label: "Church", emoji: "⛪", summary: "Services, giving, community and live streams.", modules: ["payments", "live", "for-us", "email"] },
  { id: "charity", label: "Charity or foundation", emoji: "💛", summary: "Causes, donations and impact reporting.", modules: ["payments", "for-us", "analytics", "email"] },
  { id: "coach", label: "Coach", emoji: "🧭", summary: "Programmes, sessions and client progress.", modules: ["appointments", "memberships", "courses", "payments", "crm"] },
  { id: "doctor", label: "Doctor or clinic", emoji: "🩺", summary: "Practice information and appointments.", modules: ["appointments", "crm", "seo"] },
  { id: "therapist", label: "Therapist", emoji: "🌿", summary: "Quiet, private practice presence.", modules: ["appointments", "crm", "seo"] },
  { id: "law", label: "Law firm", emoji: "⚖️", summary: "Practice areas, credibility and enquiries.", modules: ["appointments", "crm", "seo", "blog"] },
  { id: "contractor", label: "Contractor", emoji: "🛠️", summary: "Portfolio of work, quotes and jobs.", modules: ["appointments", "crm", "payments"] },
  { id: "wedding", label: "Wedding planner", emoji: "💍", summary: "Packages, vendors and couples' portals.", modules: ["appointments", "marketplace", "payments", "crm"] },
  { id: "hotel", label: "Hotel or stay", emoji: "🏝️", summary: "Rooms, rates and direct bookings.", modules: ["appointments", "payments", "seo", "analytics"] },
  { id: "creator", label: "Creator", emoji: "✨", summary: "Content hub, sponsorship and memberships.", modules: ["fv-studios", "memberships", "brand-partnerships", "affiliate", "live"] },
  { id: "musician", label: "Musician", emoji: "🎤", summary: "Music, dates, merch and radio.", modules: ["radio", "payments", "catalog", "live"] },
  { id: "photographer", label: "Photographer", emoji: "📷", summary: "Portfolio, sessions and print sales.", modules: ["appointments", "payments", "catalog"] },
  { id: "dj", label: "DJ", emoji: "🎧", summary: "Mixes, bookings and live sets.", modules: ["radio", "appointments", "live"] },
  { id: "farm", label: "Farm", emoji: "🌾", summary: "Produce, boxes and local delivery.", modules: ["catalog", "payments", "marketplace"] },
  { id: "marketplace", label: "Marketplace", emoji: "🏬", summary: "Many sellers, one trusted storefront.", modules: ["marketplace", "payments", "affiliate", "crm", "analytics"] },
  { id: "school", label: "School", emoji: "🏫", summary: "Programmes, admissions and families.", modules: ["courses", "memberships", "email", "crm"] },
  { id: "courses", label: "Course platform", emoji: "🎓", summary: "Lessons, cohorts and certificates.", modules: ["courses", "memberships", "payments", "email"] },
  { id: "community", label: "Membership community", emoji: "🤝", summary: "Members, spaces and recurring support.", modules: ["memberships", "for-us", "live", "payments"] },
  { id: "portfolio", label: "Personal portfolio", emoji: "🗂️", summary: "One beautiful page that opens doors.", modules: ["seo", "analytics"] },
];

export type BusinessModule = {
  id: string;
  label: string;
  question: string;
  plain: string;
  /** true when switching this on can introduce a real third-party cost later. */
  externalCost: boolean;
};

/** Everything is modular — added or removed at any point in the business's life. */
export const BUSINESS_MODULES: BusinessModule[] = [
  { id: "payments", label: "Online payments", question: "Would you like to take payments?", plain: "Customers can pay you on the site.", externalCost: true },
  { id: "appointments", label: "Appointments", question: "Would you like a booking calendar?", plain: "People choose a time; you get the diary.", externalCost: false },
  { id: "memberships", label: "Memberships", question: "Would you like recurring memberships?", plain: "Supporters pay monthly for access.", externalCost: true },
  { id: "courses", label: "Courses", question: "Would you like to teach?", plain: "Lessons, progress and certificates.", externalCost: false },
  { id: "marketplace", label: "Marketplace", question: "Would you like to sell inside the Frass Marketplace?", plain: "Your products appear where buyers already are.", externalCost: false },
  { id: "catalog", label: "Product catalog", question: "Would you like a product catalog?", plain: "A proper shelf for what you sell.", externalCost: false },
  { id: "affiliate", label: "Affiliate program", question: "Would you like others to sell for you?", plain: "People earn a share for bringing customers.", externalCost: false },
  { id: "blog", label: "Blog", question: "Would you like to publish articles?", plain: "Writing that brings people in from search.", externalCost: false },
  { id: "for-us", label: "For Us integration", question: "Would you like a community page?", plain: "Your story lives inside the Frass community.", externalCost: false },
  { id: "live", label: "Live streaming", question: "Would you like to go live?", plain: "Broadcast to your people in real time.", externalCost: true },
  { id: "podcast", label: "Podcast", question: "Would you like a podcast?", plain: "Episodes, feeds and listeners.", externalCost: true },
  { id: "radio", label: "Frass Radio", question: "Would you like to be on Frass Radio?", plain: "Your music or show on the station.", externalCost: false },
  { id: "brand-partnerships", label: "Brand Partnerships", question: "Would you like paid brand campaigns?", plain: "Brands pay you to make things.", externalCost: false },
  { id: "fv-studios", label: "FV Studios", question: "Would you like production tools?", plain: "Video, audio and motion, all in-house.", externalCost: true },
  { id: "crm", label: "Customer CRM", question: "Would you like to keep customer records?", plain: "One tidy place for every customer.", externalCost: false },
  { id: "email", label: "Email marketing", question: "Would you like to send email campaigns?", plain: "Newsletters and announcements.", externalCost: true },
  { id: "seo", label: "SEO", question: "Would you like to be found on Google?", plain: "The site is written so search engines understand it.", externalCost: false },
  { id: "analytics", label: "Analytics", question: "Would you like to see what's working?", plain: "Honest numbers, explained simply.", externalCost: false },
];

export function moduleById(id: string): BusinessModule | undefined {
  return BUSINESS_MODULES.find((m) => m.id === id);
}

// ── What Frassy actually builds — the business, not the website ─────────────

export const BUSINESS_DELIVERABLES = [
  "The website",
  "Brand kit & logo",
  "Copywriting",
  "Product catalog",
  "Marketplace presence",
  "Booking system",
  "Payment system",
  "Customer CRM",
  "Email marketing",
  "Social media assets",
  "For Us page",
  "Affiliate program",
  "SEO",
  "Analytics",
  "AI assistant",
  "Financial Center",
] as const;

/** The team Frassy becomes while the business is being built. */
export const AI_ARCHITECT_ROLES = [
  "Business Consultant",
  "UX Designer",
  "Brand Strategist",
  "Copywriter",
  "Developer",
  "SEO Specialist",
  "Accessibility Reviewer",
  "Marketing Advisor",
  "Analytics Consultant",
] as const;

export type ReviewItem = { id: string; label: string; plain: string };

/** Business Intelligence review — run before anything is ever published. */
export const PRE_LAUNCH_REVIEW: ReviewItem[] = [
  { id: "brand", label: "Brand consistency", plain: "Everything looks like the same business." },
  { id: "mobile", label: "Mobile responsiveness", plain: "It works properly on a phone." },
  { id: "a11y", label: "Accessibility", plain: "People with different abilities can use it." },
  { id: "seo", label: "SEO", plain: "Search engines can understand the pages." },
  { id: "perf", label: "Performance", plain: "Nothing is heavier than it needs to be." },
  { id: "speed", label: "Loading speed", plain: "Visitors don't wait around." },
  { id: "analytics", label: "Analytics", plain: "You'll be able to see what happens." },
  { id: "conversion", label: "Conversion", plain: "It's clear what a visitor should do next." },
  { id: "security", label: "Security", plain: "Customer details are protected." },
  { id: "legal", label: "Legal pages", plain: "The pages the law expects you to have." },
  { id: "cookies", label: "Cookie notice", plain: "Visitors are told what's stored." },
  { id: "privacy", label: "Privacy settings", plain: "You decide what is collected." },
  { id: "terms", label: "Terms of Service", plain: "The rules of doing business with you." },
];

// ── FRASS-0419A — hosting, domains and honest costs ─────────────────────────

export type CostLine = {
  label: string;
  /** What the outside provider actually charges. */
  providerCost: number;
  /** Frass's modest, transparent service fee. */
  frassFee: number;
  /** Who receives the provider payment. */
  payee: string;
  period: "month" | "year" | "once";
  note?: string;
};

export type HostingPlan = {
  id: string;
  label: string;
  who: string;
  providerCost: number;
  frassFee: number;
  includes: string[];
  limits: string;
};

/**
 * Building is free. Publishing has a real bill, and the customer pays it —
 * with Frass taking only enough to cover administration and keep improving.
 */
export const HOSTING_PLANS: HostingPlan[] = [
  {
    id: "frass-starter",
    label: "Frass hosting — Starter",
    who: "Frass-managed",
    providerCost: 3,
    frassFee: 1,
    includes: ["One published site", "Frass subdomain", "SSL certificate", "Daily backups"],
    limits: "Generous for a new business: roughly 25k visits and 10 GB transfer a month.",
  },
  {
    id: "frass-business",
    label: "Frass hosting — Business",
    who: "Frass-managed",
    providerCost: 9,
    frassFee: 3,
    includes: ["Custom domain", "CDN", "Staging preview", "Priority rebuilds", "Marketplace & wallet wiring"],
    limits: "Roughly 250k visits and 100 GB transfer a month; scales with usage at cost.",
  },
  {
    id: "external",
    label: "Your own hosting provider",
    who: "Your provider",
    providerCost: 0,
    frassFee: 0,
    includes: ["Full export of the project", "Deployment guide", "Frassy assists with setup"],
    limits: "You pay your provider directly. Frass charges nothing for this route.",
  },
];

export const DOMAIN_COST: CostLine = {
  label: "Custom domain registration",
  providerCost: 14,
  frassFee: 2,
  payee: "Domain registrar",
  period: "year",
  note: "Registered in your name. Frass only assists with setup and configuration.",
};

/** Third-party services that only ever bill when a member switches them on. */
export const EXTERNAL_SERVICE_COSTS: CostLine[] = [
  { label: "Email delivery", providerCost: 2, frassFee: 0.5, payee: "Email provider", period: "month", note: "Only if email marketing is switched on." },
  { label: "SMS messaging", providerCost: 0, frassFee: 0, payee: "SMS provider", period: "month", note: "Charged per message sent, at provider rates." },
  { label: "Streaming infrastructure", providerCost: 5, frassFee: 1, payee: "Streaming provider", period: "month", note: "Only while live streaming is enabled." },
  { label: "Premium AI rendering", providerCost: 0, frassFee: 0, payee: "AI provider", period: "month", note: "Forecast per job by Frass AI Credits — never a surprise." },
  { label: "Large-scale cloud storage", providerCost: 0, frassFee: 0, payee: "Cloud provider", period: "month", note: "Charged only past the included allowance." },
];

export type Quote = {
  lines: CostLine[];
  monthlyProvider: number;
  monthlyFee: number;
  monthlyTotal: number;
  yearlyTotal: number;
  /** Cheaper route Frassy always offers when one exists. */
  alternative?: string;
};

const round = (n: number) => Math.round(n * 100) / 100;

/** Transparent publishing quote: provider cost, Frass fee, totals, alternative. */
export function quotePublish(planId: string, opts: { customDomain: boolean; modules: string[] }): Quote {
  const plan = HOSTING_PLANS.find((p) => p.id === planId) ?? HOSTING_PLANS[0]!;
  const lines: CostLine[] = [
    {
      label: plan.label,
      providerCost: plan.providerCost,
      frassFee: plan.frassFee,
      payee: plan.who,
      period: "month",
      note: plan.limits,
    },
  ];

  if (opts.customDomain) lines.push(DOMAIN_COST);

  if (opts.modules.includes("email")) lines.push(EXTERNAL_SERVICE_COSTS[0]!);
  if (opts.modules.includes("live") || opts.modules.includes("podcast")) lines.push(EXTERNAL_SERVICE_COSTS[2]!);

  const monthly = lines.filter((l) => l.period === "month");
  const monthlyProvider = round(monthly.reduce((n, l) => n + l.providerCost, 0));
  const monthlyFee = round(monthly.reduce((n, l) => n + l.frassFee, 0));
  const monthlyTotal = round(monthlyProvider + monthlyFee);
  const yearlyOnce = lines
    .filter((l) => l.period !== "month")
    .reduce((n, l) => n + l.providerCost + l.frassFee, 0);
  const yearlyTotal = round(monthlyTotal * 12 + yearlyOnce);

  const alternative =
    plan.id === "frass-business"
      ? "Starter hosting covers most new businesses for a fraction of this — you can move up the moment traffic asks for it."
      : plan.id === "frass-starter" && opts.customDomain
        ? "You can publish on a free Frass subdomain today and add the custom domain whenever you're ready."
        : undefined;

  return { lines, monthlyProvider, monthlyFee, monthlyTotal, yearlyTotal, alternative };
}

export const COST_CONSTITUTION = [
  "Frass never silently absorbs a third-party cost that belongs to an optional service.",
  "Every external cost is shown with its provider before you confirm anything.",
  "Frass adds only a modest, transparent platform service fee.",
  "Building, previewing and planning are always free — you pay when you publish.",
  "There are no hidden charges, no surprise invoices and no silent subsidies.",
] as const;

// ── The guided flow — one question at a time ────────────────────────────────

export type BuilderStep = { id: string; title: string; ask: string };

export const BUILDER_STEPS: BuilderStep[] = [
  { id: "idea", title: "The business", ask: "What business are you trying to build?" },
  { id: "type", title: "The kind", ask: "Which of these is closest to it?" },
  { id: "path", title: "The home", ask: "Where should this business live?" },
  { id: "systems", title: "The systems", ask: "What should your business be able to do?" },
  { id: "review", title: "The review", ask: "Everything Frassy checks before you launch." },
  { id: "publish", title: "The cost", ask: "Here is exactly what publishing costs." },
];
