// Frass Trail — every page keeps a footprint home.
// Renders a back arrow plus a clickable breadcrumb trail on every route,
// so no page in Frass District or Frass Hill is ever a dead end.
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";

/** Routes that are deliberately immersive / full-bleed and own their own exits. */
const HIDDEN_PREFIXES = [
  "/auth",
  "/reset-password",
  "/pay/",
  "/arrival",
  "/gateway",
  "/welcome-hall",
  "/frass-hill/journey",
  "/api",
  "/checkout",
];

/** Human labels for path segments. Anything missing is title-cased automatically. */
const SEGMENT_LABELS: Record<string, string> = {
  "shop-frass": "Frass District",
  "frass-district": "Frass District",
  "frass-hill": "Frass Hill",
  "frass-world": "World of Frass",
  "frass-kicks": "Frass Kicks",
  "frass-drip": "Frass Drip",
  "bare-drip": "Bare Drip",
  "frass-plus": "Frass Plus+",
  "frass-kids": "Frass Kids",
  "frass-shape": "Frass Shape",
  "frass-luxury-house": "Frass Luxury House",
  "frass-radio": "Frass Radio",
  "frass-hosting": "Frass Hosting",
  "fv-studios": "FV Studios",
  "music-media": "Music & Media",
  "for-us": "For Us",
  "for-me": "For Me",
  "kids-world": "Kids World",
  "kids-valley": "Kids Valley",
  "town-square": "Town Square",
  "health-wellness": "Health & Wellness",
  "afro-designers": "Afro Designers",
  "social-media-virals": "Social Media Virals",
  "sales-clearance": "The Liquidation Room",
  "bridal-boutique": "Bridal Boutique",
  "bridal": "Frass Bridal",
  "financial-center": "Financial Center",
  "commerce-simulation": "Commerce Simulation",
  "visual-search": "Visual Search",
  "kicks-district": "Kicks District",
  "plus-size": "Plus Size",
  "live": "Frass Live",
  "card": "Frass Card",
  "link": "Frass Link",
  "workspace": "My Workspace",
  "room": "My Workspace",
  "founder": "Control Room",
  "admin": "Frass OS",
  "blog": "Frass Blog",
  "lookbook": "Lookbook",
  "capsules": "Lookbooks & Capsules",
  "brand-partnerships": "Brand Partnerships",
  "rewards": "Rewards",
  "product": "Product",
  "collection": "Collection",
  "men": "Men",
  "women": "Women",
  "boys": "Boys",
  "girls": "Girls",
  "kids": "Kids",
  "sales": "Sales",
  "index": "Overview",
  "go": "Go Live",
  "join": "Join",
  "walk": "The Walk",
  "vault": "The Vault",
  "journey": "Journey",
  "sourcing": "Sourcing",
  "marketplace": "Marketplace",
  "collections": "Collections",
  "designers": "Designers",
  "parents": "Parents",
  "discover": "Discover",
  "activity": "Activity",
  "wallet": "Frass Card Wallet",
};

function labelFor(segment: string) {
  const known = SEGMENT_LABELS[segment];
  if (known) return known;
  return decodeURIComponent(segment)
    .replace(/^@/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function FrassTrail() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname === "/" || HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p))) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, i) => ({
    label: labelFor(segment),
    href: "/" + segments.slice(0, i + 1).join("/"),
    last: i === segments.length - 1,
  }));

  // The back arrow walks the visitor's own history first; the parent page is the fallback.
  const parentHref = crumbs.length > 1 ? crumbs[crumbs.length - 2]!.href : "/";
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: parentHref as never });
    }
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="pointer-events-none fixed left-0 right-0 top-[84px] z-40 px-3 sm:px-6 lg:px-12"
    >
      <div className="pointer-events-auto mx-auto flex max-w-[1600px] items-center gap-1.5 overflow-x-auto rounded-full border border-border/60 bg-background/75 px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground shadow-lg backdrop-blur-xl sm:w-fit sm:text-[11px]">
        <button
          type="button"
          onClick={goBack}
          aria-label="Go back to the previous page"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-foreground transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <Link
          to="/"
          aria-label="Home"
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 transition hover:text-[color:var(--gold)]"
        >
          <Home className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Home</span>
        </Link>

        {crumbs.map((crumb) => (
          <span key={crumb.href} className="flex shrink-0 items-center gap-1.5">
            <span aria-hidden="true" className="text-border">/</span>
            {crumb.last ? (
              <span aria-current="page" className="rounded-full px-2 py-1 text-foreground">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.href as never}
                className="rounded-full px-2 py-1 transition hover:text-[color:var(--gold)]"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}
