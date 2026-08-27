// Frass Trail — every page keeps a footprint home.
// Renders a back arrow plus a clickable breadcrumb trail on every route,
// so no page in Frass District or Frass Hill is ever a dead end.
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";
import { useChromeOffset } from "@/hooks/use-chrome-offset";
import { intentionalParent, orientationFor } from "@/lib/navigation/hierarchy";

/** Routes that are deliberately immersive / full-bleed and own their own exits. */
const HIDDEN_PREFIXES = [
  "/auth",
  "/reset-password",
  "/pay/",
  "/arrival",
  "/gateway",
  "/welcome-hall",
  "/frass-hill-journey",
  "/api",
  "/checkout",
  // Kids World has its own child-first Home and Back. A small text breadcrumb
  // is the wrong tool for a six-year-old, so the adult trail stays out.
  "/kids-world",
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // FRASS-0553 — the trail sits under the site header, never behind it.
  const top = useChromeOffset(["header"]);

  if (pathname === "/" || HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p))) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  const orientation = orientationFor(pathname);
  const parentHref = intentionalParent(pathname);

  // FRASS-0557 §7 — a compact chip in the upper-left corner: Back · Home · here.
  // It never centres over content and never repeats the whole path.
  const here = orientation?.page ?? labelFor(segments[segments.length - 1] ?? "Page");

  return (
    <nav
      aria-label="Breadcrumb"
      style={{ top }}
      className="pointer-events-none fixed left-0 z-40 pl-3 sm:pl-6 lg:pl-12"
    >
      <div className="pointer-events-auto flex w-fit max-w-[min(22rem,calc(100vw-1.5rem))] items-center gap-1 rounded-full border border-border/60 bg-background/75 px-1.5 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground shadow-md backdrop-blur-xl">
        <Link
          to={parentHref as never}
          aria-label="Go back to the previous page"
          title="Back to the parent place"
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-foreground transition hover:text-[color:var(--gold)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <Link
          to="/"
          aria-label="Site Home"
          title="Site Home"
          className="inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 transition hover:text-[color:var(--gold)]"
        >
          <Home className="h-3.5 w-3.5" />
        </Link>

        {orientation && orientation.hallPath !== pathname && (
          <Link
            to={orientation.hallPath as never}
            className="hidden shrink-0 truncate rounded-full px-1.5 py-0.5 transition hover:text-[color:var(--gold)] md:inline"
          >
            {orientation.hall}
          </Link>
        )}

        <span aria-current="page" className="truncate rounded-full px-1.5 py-0.5 text-foreground">
          📍 {here}
        </span>
      </div>
    </nav>
  );
}
