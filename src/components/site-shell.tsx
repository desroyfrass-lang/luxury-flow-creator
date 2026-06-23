import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CartDrawer } from "./cart-drawer";
import { LuxuryBackground } from "./luxury-background";
import { Search, Heart } from "lucide-react";
import { useCartSync } from "@/hooks/use-cart-sync";

const NAV = [
  { to: "/frass-kicks", label: "Frass Kicks" },
  { to: "/frass-drip", label: "Frass Drip" },
  { to: "/bare-drip", label: "Bare Drip" },
];

function Header() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-border/60" />
      <div className="relative mx-auto max-w-[1600px] px-6 lg:px-12 h-20 flex items-center justify-between">
        <div className="flex-1 hidden md:flex items-center gap-1">
          {NAV.map((n) => {
            const active = path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`relative px-4 py-2 text-xs uppercase tracking-[0.25em] transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
                {active && (
                  <span className="absolute left-4 right-4 -bottom-0.5 h-px bg-[color:var(--gold)]" />
                )}
              </Link>
            );
          })}
        </div>
        <Link to="/" className="font-display text-2xl md:text-3xl tracking-tight leading-none">
          FRASS<span className="gold-text">·</span>KICKS
        </Link>
        <div className="flex-1 flex items-center justify-end gap-2">
          <button
            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/70 backdrop-blur hover:border-[color:var(--gold)] transition"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/70 backdrop-blur hover:border-[color:var(--gold)] transition"
            aria-label="Wishlist"
          >
            <Heart className="h-4 w-4" />
          </button>
          <CartDrawer />
        </div>
      </div>
      {/* mobile nav */}
      <div className="relative md:hidden border-t border-border/60 bg-white/60 backdrop-blur">
        <div className="flex justify-around px-2 py-2">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-[10px] uppercase tracking-[0.2em] py-1 px-2 text-muted-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border/60 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12 py-20 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="font-display text-3xl">FRASS<span className="gold-text">·</span>KICKS</div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            A luxury fashion destination — footwear, apparel, swim &amp; intimates.
            Made for movement. Built for confidence.
          </p>
          <form className="mt-8 flex max-w-md items-center gap-2 rounded-full border border-border bg-white p-1.5">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-transparent px-4 py-2 text-sm outline-none"
            />
            <button
              type="button"
              className="rounded-full bg-foreground px-5 py-2 text-xs uppercase tracking-[0.2em] text-background"
            >
              Subscribe
            </button>
          </form>
        </div>
        {[
          { title: "Shop", links: [["Frass Kicks", "/frass-kicks"], ["Frass Drip", "/frass-drip"], ["Bare Drip", "/bare-drip"]] },
          { title: "Help", links: [["Shipping", "#"], ["Returns", "#"], ["Sizing", "#"]] },
          { title: "Brand", links: [["About", "#"], ["Lookbook", "#"], ["Contact", "#"]] },
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
            Luxury · Confidence · Style
            <span className="h-px w-8 bg-[color:var(--gold)]" />
          </span>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children, background = true }: { children: ReactNode; background?: boolean }) {
  useCartSync();
  return (
    <div className="relative min-h-screen">
      {background && <LuxuryBackground />}
      <Header />
      <main className="relative">{children}</main>
      <Footer />
    </div>
  );
}
