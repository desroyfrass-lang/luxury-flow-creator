import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, KeyRound, Menu, X, UserRound, Sun } from "lucide-react";
import { useAccountSection } from "@/hooks/use-my-roles";
import { openTheDaily } from "@/components/workspace/daily-gate";

import { CartDrawer } from "./cart-drawer";
import { RegionSwitcher } from "./region-switcher";
import fullLogo from "@/assets/frass-logo-full.asset.json";

type NavItem = { label: string; to: string; note?: string };
type NavGroup = {
  label: string;
  to: string;
  match: string;
  editorial?: boolean;
  items?: NavItem[];
};

/** Every destination in the World of Frass is reachable from this bar. */
const NAV: NavGroup[] = [
  { label: "Frass District", to: "/", match: "/shop-frass" },
  {
    label: "Frass Kicks",
    to: "/frass-kicks",
    match: "/frass-kicks",
    items: [
      { label: "Men's Kicks", to: "/frass-kicks/men" },
      { label: "Women's Kicks", to: "/frass-kicks/women" },
      { label: "Kicks District", to: "/kicks-district", note: "The street" },
    ],
  },
  {
    label: "Frass Drip",
    to: "/frass-drip",
    match: "/frass-drip",
    items: [
      { label: "Men's Drip", to: "/frass-drip/men", note: "Work · Party · Casual · Street" },
      { label: "Women's Drip", to: "/frass-drip/women", note: "Work · Party · Casual · Street" },
    ],
  },
  {
    label: "Bare Drip",
    to: "/bare-drip",
    match: "/bare-drip",
    items: [
      { label: "Men — Underwear & Swimwear", to: "/bare-drip/men" },
      { label: "Women — Lingerie & Swimwear", to: "/bare-drip/women" },
    ],
  },
  {
    label: "Frass Luxury House",
    to: "/frass-luxury-house",
    match: "/frass-luxury-house",
    editorial: true,
    items: [
      { label: "The Estate", to: "/frass-luxury-house" },
      { label: "East Wing — Gentlemen", to: "/frass-luxury-house/men" },
      { label: "West Wing — Ladies", to: "/frass-luxury-house/women" },
    ],
  },
  {
    label: "Afro Designers",
    to: "/afro-designers",
    match: "/afro-designers",
    editorial: true,
    items: [
      { label: "The Marketplace", to: "/afro-designers", note: "Where culture meets luxury" },
      { label: "All Designers", to: "/afro-designers/designers" },
      { label: "Become a Designer", to: "/afro-designers/join", note: "Registration — coming soon" },
    ],
  },
  {
    label: "Frass Plus+",
    to: "/frass-plus",
    match: "/frass-plus",
    items: [
      { label: "Frass Plus+", to: "/frass-plus", note: "Same collections, extended sizing" },
      { label: "Men's Frass Plus+", to: "/frass-plus/men" },
      { label: "Women's Frass Plus+", to: "/frass-plus/women" },
    ],
  },

  {
    label: "Frass Kids",
    to: "/frass-kids",
    match: "/frass-kids",
    items: [
      { label: "🛍 Shop Kids", to: "/frass-kids", note: "Shop by age & gender" },
      { label: "🌈 Enter Kids World", to: "/kids-world", note: "A district of Frass Hill" },
      { label: "Parent Dashboard", to: "/kids-world/parents" },
    ],
  },
  {
    label: "Kids World",
    to: "/kids-world",
    match: "/kids-world",
    items: [
      { label: "The valley", to: "/kids-world" },
      { label: "👶 Ages 0–3", to: "/kids-world/0-3" },
      { label: "🧒 Ages 3–6", to: "/kids-world/3-6" },
      { label: "🧑 Ages 6–12", to: "/kids-world/6-12" },
      { label: "🌟 Ages 12+", to: "/kids-world/12-plus" },
      { label: "Parent Dashboard", to: "/kids-world/parents" },
    ],
  },

  { label: "Social Media Virals", to: "/social-media-virals", match: "/social-media-virals" },
  {
    label: "Discover",
    to: "/frass-hill",
    match: "/frass-hill",
    items: [
      { label: "The Liquidation Room", to: "/sales-clearance", note: "Sale · Vault · Lucky Spin" },
      { label: "Capsules", to: "/capsules" },
      { label: "Lookbook", to: "/lookbook" },
      { label: "Brand Journal", to: "/blog" },
      { label: "Music & Media", to: "/music-media" },
      { label: "Visual Search", to: "/visual-search" },
      { label: "Rewards", to: "/rewards" },
      { label: "Frass Hill Town Plan", to: "/frass-hill" },
    ],
  },
];

/** Always-visible destinations on the bar itself. */
const PRIMARY: { label: string; to: string; match: string; editorial?: boolean }[] = [
  { label: "Frass District", to: "/", match: "/shop-frass" },
  { label: "Afro Designers", to: "/afro-designers", match: "/afro-designers", editorial: true },
  { label: "Frass Luxury House", to: "/frass-luxury-house", match: "/frass-luxury-house", editorial: true },
  { label: "Frass Plus+", to: "/frass-plus", match: "/frass-plus" },
  { label: "Frass Kids", to: "/frass-kids", match: "/frass-kids" },
];


export function GatewayNav({ mode }: { mode: "shop" | "world" }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 lg:px-10">
        <div className="flex min-w-0 items-center gap-5">
          <Link to="/" aria-label="Frass entrance" className="shrink-0">
            <img src={fullLogo.url} alt="Frass" className="h-8 w-auto object-contain md:h-10" />
          </Link>

          <div
            role="tablist"
            aria-label="Global experience switcher"
            className="hidden shrink-0 items-center rounded-full border border-border bg-background/70 p-1 sm:flex"
          >
            <Link
              to="/frass-district"
              role="tab"
              aria-selected={mode === "shop"}
              className={`rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] transition ${
                mode === "shop"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🛍️ Shop Frass
            </Link>
            <Link
              to="/frass-hill"
              role="tab"
              aria-selected={mode === "world"}
              className={`rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] transition ${
                mode === "world"
                  ? "bg-[color:var(--hill-green)] text-[color:var(--luxe-linen)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ⛰️ Enter Frass Hill
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Link
            to="/visual-search"
            aria-label="Universal search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border transition hover:border-[color:var(--gold)]"
          >
            <Search className="h-4 w-4" />
          </Link>
          <RegionSwitcher />

          <Link
            to="/vault"
            aria-label="Frass Hill / Builder Vault login"
            className="hidden h-9 items-center gap-2 rounded-full border border-[color:var(--hill-gold)]/60 px-4 text-[10px] uppercase tracking-[0.2em] text-[color:var(--hill-gold)] transition hover:bg-[color:var(--hill-gold)]/10 md:inline-flex"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Builder Vault
          </Link>
          <CartDrawer />
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Always-visible destinations */}
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto px-5 pb-2 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {PRIMARY.map((g) => {
          const active = path === g.to || path.startsWith(g.match);
          return (
            <Link
              key={g.label}
              to={g.to}
              className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] transition ${
                g.editorial
                  ? "font-bold text-[color:var(--gold)]"
                  : active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {g.label}
            </Link>
          );
        })}
        <DailyNavButton />
        <AccountNavSection />

      </nav>


      {/* Full destination drawer */}
      {mobileOpen && (
        <nav
          aria-label="All destinations"
          className="max-h-[70vh] overflow-y-auto border-t border-border/60 px-5 py-4"
        >
          {NAV.map((g) => (
            <div key={g.label} className="border-b border-border/40 py-3 last:border-0">
              {g.items ? (
                <span
                  className={`block text-[11px] font-bold uppercase tracking-[0.24em] ${
                    g.editorial ? "text-[color:var(--gold)]" : "text-foreground"
                  }`}
                >
                  {g.label}
                </span>
              ) : (
                <Link
                  to={g.to}
                  className={`text-[11px] font-bold uppercase tracking-[0.24em] ${
                    g.editorial ? "text-[color:var(--gold)]" : "text-foreground"
                  }`}
                >
                  {g.label}
                </Link>
              )}

              {g.items && (
                <div className="mt-2 grid gap-1.5 pl-3">
                  {g.items.map((i) => (
                    <Link
                      key={i.to}
                      to={i.to}
                      className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      {i.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}

/** The Frass Daily — one Daily for every signed-in Builder, admin or member. */
function DailyNavButton() {
  const section = useAccountSection();
  if (!section) return null;
  return (
    <button
      type="button"
      onClick={() => openTheDaily()}
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[color:var(--hill-gold)]/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--hill-gold)] transition hover:bg-[color:var(--hill-gold)]/10"
    >
      <Sun className="h-3.5 w-3.5" />
      The Daily
    </button>
  );
}

/** Role-aware account section — last item on the nav bar. */
function AccountNavSection() {

  const section = useAccountSection();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [path]);

  if (!section) return null;

  return (
    <div className="relative ml-auto shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--hill-gold)] transition hover:text-foreground"
      >
        <UserRound className="h-3.5 w-3.5" />
        {section.label}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-lg border border-border/70 bg-background/95 p-2 shadow-xl backdrop-blur-xl">
          {section.items.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              className="block rounded-sm px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
            >
              {i.label}
              {i.note && (
                <span className="mt-0.5 block text-[9px] normal-case tracking-normal opacity-60">
                  {i.note}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
