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
  { match: "/control-room", label: "Founder Hall Home", hall: "Founder Hall", hallPath: "/control-room", parent: "/welcome-hall", audience: "FOUNDER", exact: true },
  { match: "/studios", label: "Frassy Studios", hall: "Founder Hall", hallPath: "/control-room", parent: "/control-room", audience: "FOUNDER", exact: true },
  { match: "/studios/production/", label: "Production", hall: "Frassy Studios", hallPath: "/studios", parent: "/studios/productions", audience: "FOUNDER" },
  { match: "/studios/engine/", label: "Production Studio", hall: "Frassy Studios", hallPath: "/studios", parent: "/studios/productions", audience: "FOUNDER" },
  { match: "/studios/distribution/", label: "Destination Matrix", hall: "Frassy Studios", hallPath: "/studios", parent: "/studios/distribution", audience: "FOUNDER" },
  { match: "/studios/", label: "Studio", hall: "Frassy Studios", hallPath: "/studios", parent: "/studios", audience: "FOUNDER" },
  { match: "/admin", label: "Site Management", hall: "Founder Hall", hallPath: "/control-room", parent: "/control-room", audience: "ADMIN" },
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