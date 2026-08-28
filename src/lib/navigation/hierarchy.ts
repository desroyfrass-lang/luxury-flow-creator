// FRASS HILL navigation recovery — one intentional map for orientation.
// This does not replace TanStack Router. It gives existing navigation shells a
// shared answer to: where am I, which Hall owns this page, and where is Back?

export type NavigationAudience =
  | "PUBLIC"
  | "CUSTOMER"
  | "MEMBER"
  | "KIDS"
  | "CREATOR"
  | "ADMIN"
  | "FOUNDER"
  | "SYSTEM";

export type NavigationPlace = {
  match: string;
  label: string;
  hall: string;
  hallPath: string;
  parent: string;
  audience: NavigationAudience;
  exact?: boolean;
};

const PLACES: NavigationPlace[] = [
  // Founder Architecture Amendment — Founder Hall is the headquarters; the
  // Control Room is one of its protected rooms, not the front door.
  { match: "/founder", label: "Founder Hall Home", hall: "Founder Hall", hallPath: "/founder", parent: "/welcome-hall", audience: "FOUNDER", exact: true },
  { match: "/control-room", label: "Control Room", hall: "Founder Hall", hallPath: "/founder", parent: "/founder", audience: "FOUNDER", exact: true },
  { match: "/studios", label: "Frassy Studios", hall: "Founder Hall", hallPath: "/founder", parent: "/founder", audience: "FOUNDER", exact: true },
  { match: "/studios/production/", label: "Production", hall: "Frassy Studios", hallPath: "/studios", parent: "/studios/productions", audience: "FOUNDER" },
  { match: "/studios/engine/", label: "Production Studio", hall: "Frassy Studios", hallPath: "/studios", parent: "/studios/productions", audience: "FOUNDER" },
  { match: "/studios/distribution/", label: "Destination Matrix", hall: "Frassy Studios", hallPath: "/studios", parent: "/studios/distribution", audience: "FOUNDER" },
  { match: "/studios/", label: "Studio", hall: "Frassy Studios", hallPath: "/studios", parent: "/studios", audience: "FOUNDER" },
  { match: "/admin", label: "Site Management", hall: "Founder Hall", hallPath: "/founder", parent: "/founder", audience: "ADMIN" },
  { match: "/frass-hill", label: "Frass Hill", hall: "Frass Hill", hallPath: "/frass-hill", parent: "/welcome-hall", audience: "PUBLIC" },
  { match: "/town-square", label: "Town Square", hall: "Frass Hill", hallPath: "/frass-hill", parent: "/frass-hill", audience: "PUBLIC" },
  { match: "/for-us", label: "For Us", hall: "Community Hall", hallPath: "/for-us", parent: "/town-square", audience: "PUBLIC" },
  { match: "/for-me", label: "For Me", hall: "Frass Hill", hallPath: "/frass-hill", parent: "/town-square", audience: "MEMBER" },
  { match: "/academy", label: "Academy", hall: "Builders Village", hallPath: "/academy", parent: "/frass-hill", audience: "MEMBER" },
  { match: "/opportunity", label: "Opportunity Centre", hall: "Builders Village", hallPath: "/opportunity", parent: "/frass-hill", audience: "MEMBER" },
  { match: "/room", label: "My Workspace", hall: "Builders Village", hallPath: "/room", parent: "/welcome-hall", audience: "MEMBER" },
  { match: "/workspace", label: "My Workspace", hall: "Builders Village", hallPath: "/room", parent: "/room", audience: "MEMBER" },
  { match: "/builder-hall", label: "My Builder Hall", hall: "Builders Village", hallPath: "/builder-hall", parent: "/welcome-hall", audience: "MEMBER" },
  { match: "/studio", label: "FV Studios", hall: "Studio District", hallPath: "/studio", parent: "/frass-hill", audience: "CREATOR" },
  { match: "/fv-studios", label: "Frass Vision Studios", hall: "Studio District", hallPath: "/studio", parent: "/frass-hill", audience: "PUBLIC" },
  { match: "/frass-radio", label: "Frass Radio", hall: "Studio District", hallPath: "/studio", parent: "/studio", audience: "PUBLIC" },
  { match: "/kids-world", label: "Kids World", hall: "Children's Village", hallPath: "/kids-world", parent: "/welcome-hall", audience: "KIDS" },
  { match: "/kids-valley", label: "Kids Valley", hall: "Children's Village", hallPath: "/kids-world", parent: "/welcome-hall", audience: "KIDS" },
  { match: "/frass-kids", label: "Frass Kids", hall: "Frass District", hallPath: "/frass-district", parent: "/frass-district", audience: "CUSTOMER" },
  { match: "/frass-luxury-house", label: "Frass Luxury House", hall: "Frass District", hallPath: "/frass-district", parent: "/frass-district", audience: "CUSTOMER" },
  { match: "/bridal", label: "Frass Bridal", hall: "Frass District", hallPath: "/frass-district", parent: "/frass-district", audience: "CUSTOMER" },
  { match: "/afro-designers", label: "Afro Designers", hall: "Frass District", hallPath: "/frass-district", parent: "/frass-district", audience: "CUSTOMER" },
  { match: "/frass-plus", label: "Frass Plus+", hall: "Frass District", hallPath: "/frass-district", parent: "/frass-district", audience: "CUSTOMER" },
  { match: "/frass-kicks", label: "Frass Kicks", hall: "Frass District", hallPath: "/frass-district", parent: "/frass-district", audience: "CUSTOMER" },
  { match: "/frass-drip", label: "Frass Drip", hall: "Frass District", hallPath: "/frass-district", parent: "/frass-district", audience: "CUSTOMER" },
  { match: "/bare-drip", label: "Bare Drip", hall: "Frass District", hallPath: "/frass-district", parent: "/frass-district", audience: "CUSTOMER" },
  { match: "/social-media-virals", label: "Social Media Virals", hall: "Frass District", hallPath: "/frass-district", parent: "/frass-district", audience: "CUSTOMER" },
  { match: "/sales-clearance", label: "The Liquidation Room", hall: "Frass District", hallPath: "/frass-district", parent: "/frass-district", audience: "CUSTOMER" },
  { match: "/frass-district", label: "Frass District", hall: "Frass District", hallPath: "/frass-district", parent: "/welcome-hall", audience: "PUBLIC" },
  { match: "/health-wellness", label: "Health & Wellness", hall: "Frass Hill", hallPath: "/frass-hill", parent: "/frass-hill", audience: "PUBLIC" },
  { match: "/financial-center", label: "Financial Center", hall: "Builders Village", hallPath: "/room", parent: "/room", audience: "MEMBER" },
  { match: "/vaults", label: "My Vaults", hall: "Builders Village", hallPath: "/room", parent: "/room", audience: "MEMBER" },
  { match: "/vault", label: "Builder Vault", hall: "Builders Village", hallPath: "/room", parent: "/room", audience: "MEMBER" },
];

const normalize = (pathname: string) => pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

export function navigationPlace(pathname: string): NavigationPlace | null {
  const path = normalize(pathname);
  return PLACES.find((place) =>
    place.exact ? path === place.match : path === place.match || path.startsWith(`${place.match}/`),
  ) ?? null;
}

export function intentionalParent(pathname: string): string {
  const path = normalize(pathname);
  const place = navigationPlace(path);
  if (place) {
    if (path !== place.match && !place.exact && place.parent === place.match) return place.match;
    return place.parent;
  }
  return "/welcome-hall";
}

export function orientationFor(pathname: string) {
  const place = navigationPlace(pathname);
  if (!place) return null;
  const page = normalize(pathname) === place.match ? place.label : labelFromPath(pathname);
  return { hall: place.hall, hallPath: place.hallPath, page, audience: place.audience };
}

function labelFromPath(pathname: string): string {
  const last = normalize(pathname).split("/").filter(Boolean).at(-1) ?? "Page";
  if (/^[0-9a-f-]{20,}$/i.test(last)) return "Detail";
  return decodeURIComponent(last).replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0590 — Master Navigation Foundation.
//
// One authoritative destination registry for the whole ecosystem. Every visible
// menu (SiteShell, GatewayNav, Kids World, Founder Hall, Frassy Studios) and
// Frassy's own navigation tool read from THIS tree. One truth about where a
// place is — never one identical visual menu everywhere.
//
// Founder rule: FRASS DISTRICT *IS* the fashion / shopping district. There is
// no separate "Fashion & Shopping" world.
// ─────────────────────────────────────────────────────────────────────────────

export type NavLevel = "GLOBAL" | "AREA" | "SECTION";

export type NavNode = {
  /** Stable key, also used by Frassy's open_place. */
  key: string;
  /** What a member sees on screen. Never a route name. */
  label: string;
  path: string;
  audience: NavigationAudience;
  level: NavLevel;
  /** One plain line: what this place is for. */
  blurb?: string;
  /** Things a member might say that mean this place. */
  spoken?: string[];
  children?: NavNode[];
};

export const NAV_TREE: NavNode[] = [
  {
    key: "welcome-hall",
    label: "Welcome Hall",
    path: "/welcome-hall",
    audience: "PUBLIC",
    level: "GLOBAL",
    blurb: "Where every visit to Frass Hill begins.",
    spoken: ["welcome hall", "the front door", "arrival", "the gates"],
  },
  {
    key: "frass-district",
    label: "Frass District",
    path: "/frass-district",
    audience: "PUBLIC",
    level: "GLOBAL",
    blurb: "The fashion and shopping district — every storefront on one street.",
    spoken: ["frass district", "shopping", "go shopping", "the shops", "fashion", "the district"],
    children: [
      { key: "frass-kicks", label: "Frass Kicks", path: "/frass-kicks", audience: "CUSTOMER", level: "AREA", blurb: "Footwear — men and women.", spoken: ["frass kicks", "sneakers", "shoes", "kicks"] },
      { key: "frass-drip", label: "Frass Drip", path: "/frass-drip", audience: "CUSTOMER", level: "AREA", blurb: "Clothing floors — men and women.", spoken: ["frass drip", "clothing", "drip"] },
      { key: "frass-plus", label: "Plus Size — Frass Plus+", path: "/frass-plus", audience: "CUSTOMER", level: "AREA", blurb: "The full Plus Size house.", spoken: ["plus size", "frass plus", "curve"] },
      { key: "bridal", label: "Frass Bridal", path: "/bridal", audience: "CUSTOMER", level: "AREA", blurb: "The wedding village — bride, groom and wedding party.", spoken: ["bridal", "wedding", "frass bridal"] },
      { key: "luxury-house", label: "Frass Luxury House", path: "/frass-luxury-house", audience: "CUSTOMER", level: "AREA", blurb: "The premium house.", spoken: ["luxury house", "luxury", "premium"] },
      { key: "bare-drip", label: "Bare Drip", path: "/bare-drip", audience: "CUSTOMER", level: "AREA", blurb: "Swim and intimates." },
      { key: "frass-shape", label: "Frass Shape", path: "/frass-shape", audience: "CUSTOMER", level: "AREA", blurb: "Shapewear and body goals." },
      { key: "frass-kids-shop", label: "Frass Kids (Shop)", path: "/frass-kids", audience: "CUSTOMER", level: "AREA", blurb: "Children's retail — Kicks Kids and Drip Kids." },
      { key: "afro-designers", label: "Afro Designers", path: "/afro-designers", audience: "CUSTOMER", level: "AREA", blurb: "Independent houses from the continent and diaspora." },
      { key: "capsules", label: "Lookbooks & Capsules", path: "/capsules", audience: "CUSTOMER", level: "AREA", blurb: "Limited stories, styled end to end." },
      { key: "virals", label: "Social Media Virals", path: "/social-media-virals", audience: "CUSTOMER", level: "AREA", blurb: "Everything trending, in one store." },
      { key: "liquidation", label: "The Liquidation Room", path: "/sales-clearance", audience: "CUSTOMER", level: "AREA", blurb: "Real markdowns and flash drops." },
      { key: "visual-search", label: "Visual Search", path: "/visual-search", audience: "CUSTOMER", level: "SECTION", blurb: "Find it by picture." },
      { key: "rewards", label: "Rewards", path: "/rewards", audience: "CUSTOMER", level: "SECTION", blurb: "Your shopping rewards." },
    ],
  },
  {
    key: "kids-world",
    label: "Kids World",
    path: "/kids-world",
    audience: "KIDS",
    level: "GLOBAL",
    blurb: "The children's world — one door per age.",
    spoken: ["kids world", "kids", "frass kids", "children"],
    children: [
      { key: "kids-street", label: "Frass Street", path: "/kids-world/street", audience: "KIDS", level: "AREA" },
      { key: "kids-discover", label: "Discover", path: "/kids-world/discover", audience: "KIDS", level: "AREA" },
      { key: "kids-shop", label: "Shop Kids", path: "/frass-kids", audience: "KIDS", level: "AREA" },
      { key: "kids-parents", label: "Parent Dashboard", path: "/kids-world/parents", audience: "PUBLIC", level: "AREA" },
    ],
  },
  {
    key: "community",
    label: "Community",
    path: "/for-us",
    audience: "PUBLIC",
    level: "GLOBAL",
    blurb: "Where Frass people gather.",
    spoken: ["community", "socials", "for us", "the square"],
    children: [
      { key: "for-us", label: "For Us", path: "/for-us", audience: "PUBLIC", level: "AREA", blurb: "The community hall." },
      { key: "town-square", label: "Town Square", path: "/town-square", audience: "PUBLIC", level: "AREA" },
      { key: "for-me", label: "FOR ME", path: "/for-me", audience: "PUBLIC", level: "AREA", blurb: "Your own page." },
      { key: "live", label: "Frass Live", path: "/live", audience: "PUBLIC", level: "AREA", blurb: "Live broadcasts." },
      { key: "frass-radio", label: "Frass Radio", path: "/frass-radio", audience: "PUBLIC", level: "AREA" },
      { key: "music-media", label: "Music & Media", path: "/music-media", audience: "PUBLIC", level: "AREA" },
      { key: "blog", label: "Frass Blog", path: "/blog", audience: "PUBLIC", level: "AREA" },
      { key: "brand-partnerships", label: "Brand Partnerships", path: "/brand-partnerships", audience: "PUBLIC", level: "AREA" },
    ],
  },
  {
    key: "frass-hill",
    label: "Frass Hill",
    path: "/frass-hill",
    audience: "PUBLIC",
    level: "GLOBAL",
    blurb: "The town itself — where people build.",
    spoken: ["frass hill", "the hill", "the town"],
    children: [
      { key: "academy", label: "Academy", path: "/academy", audience: "MEMBER", level: "AREA" },
      { key: "opportunity", label: "Opportunity Centre", path: "/opportunity", audience: "MEMBER", level: "AREA" },
      { key: "creation", label: "Creation District", path: "/creation", audience: "MEMBER", level: "AREA" },
      { key: "marketplace", label: "Frass Services", path: "/services", audience: "PUBLIC", level: "AREA", spoken: ["marketplace", "frass services", "services"] },
      { key: "manufacturing", label: "Creator Manufacturing Network", path: "/manufacturing", audience: "MEMBER", level: "AREA", spoken: ["manufacturing", "find a manufacturer", "get my product made"] },
      { key: "health-wellness", label: "Health & Wellness Centre", path: "/health-wellness", audience: "PUBLIC", level: "AREA" },
      { key: "fv-studios", label: "Frass Vision Studios", path: "/fv-studios", audience: "PUBLIC", level: "AREA" },
      { key: "frass-hosting", label: "Frass Hosting", path: "/frass-hosting", audience: "PUBLIC", level: "AREA" },
    ],
  },
  {
    key: "my-space",
    label: "My Space",
    path: "/room",
    audience: "MEMBER",
    level: "GLOBAL",
    blurb: "Your own side of Frass Hill.",
    spoken: ["my space", "my workspace", "workspace", "my room"],
    children: [
      { key: "daily", label: "The Daily", path: "/daily", audience: "MEMBER", level: "AREA", spoken: ["the daily", "my day", "today"] },
      { key: "room", label: "My Workspace", path: "/room", audience: "MEMBER", level: "AREA" },
      { key: "money-moves", label: "Money Moves", path: "/money-moves", audience: "MEMBER", level: "AREA", spoken: ["money moves", "income"] },
      { key: "frass-card", label: "My Frass Card", path: "/workspace/card", audience: "MEMBER", level: "AREA", spoken: ["frass card", "my card", "my storefront"] },
      { key: "financial-center", label: "Financial Center", path: "/financial-center", audience: "MEMBER", level: "AREA", spoken: ["financial center", "my money", "earnings"] },
      { key: "wallet", label: "Frass Card Wallet", path: "/workspace/wallet", audience: "MEMBER", level: "AREA" },
      { key: "vault", label: "Builder Vault", path: "/vault", audience: "MEMBER", level: "AREA", spoken: ["builder vault", "my files", "my assets"] },
      { key: "journal", label: "My Journal", path: "/journal", audience: "MEMBER", level: "AREA" },
      { key: "notifications", label: "Notifications", path: "/notifications", audience: "MEMBER", level: "SECTION" },
      { key: "profile", label: "Builder Identity", path: "/workspace/profile", audience: "MEMBER", level: "SECTION" },
      { key: "onboarding", label: "Onboarding with Frassy", path: "/onboarding", audience: "MEMBER", level: "SECTION", spoken: ["start onboarding", "get started", "start my journey"] },
    ],
  },
  {
    key: "vaults",
    label: "My Vaults",
    path: "/vaults",
    audience: "MEMBER",
    level: "GLOBAL",
    blurb: "Your owned working Vaults.",
    spoken: ["my vaults", "vaults", "switch vault"],
    children: [
      { key: "vaults-new", label: "Create a Vault", path: "/vaults/new", audience: "MEMBER", level: "SECTION" },
      { key: "business-vaults", label: "Vault Ideas Library", path: "/business-vaults", audience: "MEMBER", level: "SECTION", blurb: "Templates and suggestions — not owned Vaults." },
    ],
  },
  {
    key: "founder-hall",
    label: "Founder Hall",
    path: "/founder",
    audience: "FOUNDER",
    level: "GLOBAL",
    blurb: "The Founder control centre.",
    spoken: ["founder hall", "founder mode", "headquarters"],
    children: [
      { key: "founder-home", label: "Home", path: "/founder", audience: "FOUNDER", level: "AREA" },
      { key: "founder-control-room", label: "Control Room", path: "/control-room", audience: "FOUNDER", level: "AREA", blurb: "Run and monitor Frass Hill." },
      { key: "founder-onboarding-room", label: "Onboarding Room", path: "/onboarding", audience: "FOUNDER", level: "AREA", blurb: "Inspect and manage the real onboarding experience." },
      { key: "founder-create", label: "Create & Media", path: "/studios", audience: "FOUNDER", level: "AREA" },
      { key: "founder-business", label: "Business", path: "/business-builder", audience: "FOUNDER", level: "AREA" },
      { key: "founder-vaults", label: "Vaults", path: "/vaults", audience: "FOUNDER", level: "AREA" },
      { key: "founder-community", label: "Community", path: "/admin/partners", audience: "ADMIN", level: "AREA" },
      { key: "founder-content", label: "Content", path: "/admin/blog", audience: "ADMIN", level: "AREA" },
      { key: "founder-analytics", label: "Analytics & Money", path: "/admin/financial-audit", audience: "ADMIN", level: "AREA" },
      { key: "founder-site", label: "Site Management", path: "/admin", audience: "ADMIN", level: "AREA" },
      { key: "founder-settings", label: "Settings", path: "/admin/roles", audience: "ADMIN", level: "AREA" },
    ],
  },
  {
    key: "studios",
    label: "Frassy Studios",
    path: "/studios",
    audience: "FOUNDER",
    level: "GLOBAL",
    blurb: "The production house.",
    spoken: ["frassy studios", "studios", "studio home"],
    children: [
      { key: "studios-home", label: "Studio Home", path: "/studios", audience: "FOUNDER", level: "AREA" },
      { key: "studios-create", label: "Create", path: "/studios/create", audience: "FOUNDER", level: "AREA" },
      { key: "studios-productions", label: "My Productions", path: "/studios/productions", audience: "FOUNDER", level: "AREA" },
      { key: "studios-review", label: "Review", path: "/studios/review", audience: "FOUNDER", level: "AREA" },
      { key: "studios-publishing", label: "Publish", path: "/studios/publishing", audience: "FOUNDER", level: "AREA" },
      { key: "studios-performance", label: "Performance", path: "/studios/performance", audience: "FOUNDER", level: "AREA" },
      { key: "studios-assets", label: "Library", path: "/studios/assets", audience: "FOUNDER", level: "SECTION" },
      { key: "studios-series", label: "Series & Characters", path: "/studios/series", audience: "FOUNDER", level: "SECTION" },
      { key: "studios-distribution", label: "Distribution Network", path: "/studios/distribution", audience: "FOUNDER", level: "SECTION" },
      { key: "studios-calendar", label: "Content Calendar", path: "/studios/calendar", audience: "FOUNDER", level: "SECTION" },
      { key: "studios-analytics", label: "Media Performance", path: "/studios/analytics", audience: "FOUNDER", level: "SECTION" },
      { key: "studios-monetization", label: "Frass Media Revenue", path: "/studios/monetization", audience: "FOUNDER", level: "SECTION" },
      { key: "studios-jobs", label: "Studio Tools", path: "/studios/jobs", audience: "FOUNDER", level: "SECTION" },
      { key: "studios-settings", label: "Settings", path: "/studios/settings", audience: "FOUNDER", level: "SECTION" },
    ],
  },
];

/** Everyone who is at least this audience can see the node. */
export type ViewerRole = { signedIn: boolean; isAdmin: boolean; isFounder?: boolean };

export function canSee(node: NavNode, viewer: ViewerRole): boolean {
  switch (node.audience) {
    case "FOUNDER":
      return viewer.isFounder ?? viewer.isAdmin;
    case "ADMIN":
      return viewer.isAdmin;
    case "MEMBER":
    case "CREATOR":
      return viewer.signedIn;
    default:
      return true;
  }
}

/** The Level 1 menu for a given viewer. Menu visibility is never authorization. */
export function globalNavFor(viewer: ViewerRole): NavNode[] {
  return NAV_TREE.filter((n) => canSee(n, viewer)).map((n) => ({
    ...n,
    children: n.children?.filter((c) => canSee(c, viewer)),
  }));
}

/** Flatten the tree — used by Frassy and by the route classification sweep. */
export function allNavNodes(): NavNode[] {
  const out: NavNode[] = [];
  const walk = (nodes: NavNode[]) => {
    for (const n of nodes) {
      out.push(n);
      if (n.children) walk(n.children);
    }
  };
  walk(NAV_TREE);
  return out;
}

/** Which Level 1 area owns this path? Drives current-area highlighting. */
export function activeGlobal(pathname: string): NavNode | null {
  const path = normalize(pathname);
  let best: { node: NavNode; len: number } | null = null;
  for (const top of NAV_TREE) {
    const candidates = [top, ...(top.children ?? [])];
    for (const c of candidates) {
      const hit = path === c.path || path.startsWith(`${c.path}/`);
      if (hit && (!best || c.path.length > best.len)) best = { node: top, len: c.path.length };
    }
  }
  return best?.node ?? null;
}

/** The Level 2 menu for wherever the member currently is. */
export function areaNavFor(pathname: string, viewer: ViewerRole): NavNode[] {
  const top = activeGlobal(pathname);
  if (!top?.children) return [];
  return top.children.filter((c) => canSee(c, viewer));
}
