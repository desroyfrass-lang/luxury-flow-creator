import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ChevronDown, KeyRound } from "lucide-react";
import { CartDrawer } from "./cart-drawer";
import fullLogo from "@/assets/frass-logo-full.asset.json";

const CATEGORIES: { label: string; to: string; editorial?: boolean }[] = [
  { label: "Frass Kicks", to: "/frass-kicks/women" },
  { label: "Frass Drip", to: "/frass-drip/women" },
  { label: "Bare Drip", to: "/bare-drip/women" },
  { label: "Plus Size", to: "/plus-size/women" },
  { label: "Frass Luxury House", to: "/frass-luxury-house/women", editorial: true },
  { label: "Social Media Virals", to: "/social-media-virals" },
];

const CURRENCIES = ["USD", "GBP", "EUR", "JMD", "CAD"];

export function GatewayNav({ mode }: { mode: "shop" | "world" }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [kidsOpen, setKidsOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 lg:px-10">
        <div className="flex min-w-0 items-center gap-5">
          <Link to="/gateway" aria-label="Frass gateway" className="shrink-0">
            <img src={fullLogo.url} alt="Frass" className="h-8 w-auto object-contain md:h-10" />
          </Link>

          <div
            role="tablist"
            aria-label="Global experience switcher"
            className="hidden shrink-0 items-center rounded-full border border-border bg-background/70 p-1 sm:flex"
          >
            <Link
              to="/shop-frass"
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
              to="/frass-world"
              role="tab"
              aria-selected={mode === "world"}
              className={`rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] transition ${
                mode === "world"
                  ? "bg-[color:var(--hill-green)] text-[color:var(--luxe-linen)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🌍 Explore Frass World
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            aria-label="Universal search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:border-[color:var(--gold)] transition"
          >
            <Search className="h-4 w-4" />
          </button>
          <label className="sr-only" htmlFor="frass-currency">
            Currency
          </label>
          <select
            id="frass-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="hidden rounded-full border border-border bg-background px-3 py-2 text-[10px] uppercase tracking-[0.2em] outline-none sm:block"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Link
            to="/vault"
            aria-label="Frass Hill / Builder Vault login"
            className="hidden h-9 items-center gap-2 rounded-full border border-[color:var(--hill-gold)]/60 px-4 text-[10px] uppercase tracking-[0.2em] text-[color:var(--hill-gold)] transition hover:bg-[color:var(--hill-gold)]/10 md:inline-flex"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Builder Vault
          </Link>
          <CartDrawer />
        </div>
      </div>

      <nav
        aria-label="Primary shopping categories"
        className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto px-5 pb-2 lg:px-10"
      >
        {CATEGORIES.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] transition ${
              path.startsWith(c.to) ? "text-foreground" : "text-muted-foreground"
            } ${c.editorial ? "border border-[color:var(--gold)]/50 font-bold text-[color:var(--gold)]" : "hover:text-foreground"}`}
          >
            {c.label}
          </Link>
        ))}

        <div
          className="relative shrink-0"
          onMouseEnter={() => setKidsOpen(true)}
          onMouseLeave={() => setKidsOpen(false)}
        >
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={kidsOpen}
            onClick={() => setKidsOpen((o) => !o)}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-muted-foreground transition hover:text-foreground"
          >
            Frass Kids <ChevronDown className="h-3 w-3" />
          </button>
          {kidsOpen && (
            <div
              role="menu"
              className="absolute left-0 z-50 mt-2 w-64 rounded-2xl border border-border/70 bg-background/95 p-2 shadow-2xl backdrop-blur-xl"
            >
              <Link
                to="/frass-world"
                hash="kids"
                role="menuitem"
                className="block rounded-xl px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition hover:bg-[color:var(--kids-coral)]/10 hover:text-foreground"
              >
                🧸 Kids Boutique
              </Link>
              <Link
                to="/frass-world"
                hash="kids"
                role="menuitem"
                className="block rounded-xl px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition hover:bg-[color:var(--kids-turquoise)]/10 hover:text-foreground"
              >
                🌈 Kids World
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
