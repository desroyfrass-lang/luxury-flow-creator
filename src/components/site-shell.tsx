import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CartDrawer } from "./cart-drawer";
import { LuxuryBackground } from "./luxury-background";
import { Search, User, Instagram, Music2, Youtube, Facebook } from "lucide-react";
import { useCartSync } from "@/hooks/use-cart-sync";
import { useSiteText } from "@/hooks/use-site-text";
import fullLogo from "@/assets/frass-logo-full.asset.json";
import symbolLogo from "@/assets/frass-logo-symbol.asset.json";

const NAV_ITEMS = [
  { to: "/frass-kicks", slot: "nav-frass-kicks", fallback: "Frass Kicks" },
  { to: "/frass-drip", slot: "nav-frass-drip", fallback: "Frass Drip" },
  { to: "/bare-drip", slot: "nav-bare-drip", fallback: "Bare Drip" },
  { to: "/lookbook", slot: "nav-lookbook", fallback: "Lookbook" },
  { to: "/music-media", slot: "nav-music-media", fallback: "Music & Media" },
] as const;

const SOCIALS = [
  { href: "https://instagram.com", label: "Instagram", Icon: Instagram },
  { href: "https://tiktok.com", label: "TikTok", Icon: Music2 },
  { href: "https://youtube.com", label: "YouTube", Icon: Youtube },
  { href: "https://facebook.com", label: "Facebook", Icon: Facebook },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${compact ? "gap-3" : "gap-4"}`}
      aria-label="Frass Kicks home"
    >
      <img
        src={compact ? symbolLogo.url : fullLogo.url}
        alt="Frass Kicks logo"
        className={compact ? "h-9 w-auto object-contain" : "h-11 md:h-14 w-auto object-contain"}
      />
    </Link>
  );
}

function Header() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-border/60" />
      <div className="relative mx-auto max-w-[1600px] px-6 lg:px-12 h-20 flex items-center justify-between gap-4">
        <div className="flex-1 hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((n) => <HeaderNavLink key={n.to} item={n} active={path.startsWith(n.to)} />)}
        </div>
        <div className="shrink-0">
          <div className="hidden md:block">
            <BrandMark />
          </div>
          <div className="md:hidden">
            <BrandMark compact />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-end gap-2">
          <div className="flex items-center gap-0.5 md:gap-1 mr-1 md:mr-2">
            {SOCIALS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-[color:var(--gold)] transition"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <button
            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur hover:border-[color:var(--gold)] transition"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur hover:border-[color:var(--gold)] transition"
            aria-label="Account"
          >
            <User className="h-4 w-4" />
          </button>
          <CartDrawer />
        </div>
      </div>
      <div className="relative md:hidden border-t border-border/60 bg-background/60 backdrop-blur">
        <div className="flex overflow-x-auto no-scrollbar px-2 py-2 gap-1">
          {NAV_ITEMS.map((n) => <MobileNavLink key={n.to} item={n} />)}
        </div>
      </div>
    </header>
  );
}

type NavItem = (typeof NAV_ITEMS)[number];

function HeaderNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const label = useSiteText(item.slot, item.fallback);
  return (
    <Link
      to={item.to}
      className={`relative px-4 py-2 text-xs uppercase tracking-[0.25em] transition-colors ${
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {active && (
        <span className="absolute left-4 right-4 -bottom-0.5 h-px bg-[color:var(--gold)]" />
      )}
    </Link>
  );
}

function MobileNavLink({ item }: { item: NavItem }) {
  const label = useSiteText(item.slot, item.fallback);
  return (
    <Link
      to={item.to}
      className="shrink-0 whitespace-nowrap text-[10px] uppercase tracking-[0.2em] py-1 px-3 text-muted-foreground"
      activeProps={{ className: "text-foreground" }}
    >
      {label}
    </Link>
  );
}

function Footer() {
  const blurb = useSiteText("footer-blurb");
  const subscribeLabel = useSiteText("footer-newsletter-cta");
  const tagline = useSiteText("footer-tagline");
  return (
    <footer className="relative mt-32 border-t border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12 py-20 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <img src={fullLogo.url} alt="Frass Kicks logo" className="h-12 w-auto object-contain" />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">{blurb}</p>
          <form className="mt-8 flex max-w-md items-center gap-2 rounded-full border border-border bg-background p-1.5">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-transparent px-4 py-2 text-sm outline-none"
            />
            <button
              type="button"
              className="rounded-full bg-foreground px-5 py-2 text-xs uppercase tracking-[0.2em] text-background"
            >
              {subscribeLabel}
            </button>
          </form>
        </div>
        {[
          { title: "Shop", links: [["Frass Kicks", "/frass-kicks"], ["Frass Drip", "/frass-drip"], ["Bare Drip", "/bare-drip"]] },
          { title: "Help", links: [["Shipping", "#"], ["Returns", "#"], ["Sizing", "#"]] },
          { title: "Brand", links: [["About", "#"], ["Lookbook", "/lookbook"], ["Contact", "#"]] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{col.title}</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="hover:text-[color:var(--gold)] transition">{label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>© {new Date().getFullYear()} Frass Kicks</span>
          <span className="flex items-center gap-2">
            <span className="h-px w-8 bg-[color:var(--gold)]" />
            {tagline}
            <span className="h-px w-8 bg-[color:var(--gold)]" />
          </span>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({
  children,
  background = true,
  preHeader,
}: {
  children: ReactNode;
  background?: boolean;
  preHeader?: ReactNode;
}) {
  useCartSync();
  return (
    <div className="relative min-h-screen">
      {background && <LuxuryBackground />}
      {preHeader}
      <Header />
      <main className="relative">{children}</main>
      <Footer />
    </div>
  );
}
