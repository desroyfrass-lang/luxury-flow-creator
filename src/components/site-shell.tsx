import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CartDrawer } from "./cart-drawer";
import { LuxuryBackground } from "./luxury-background";
import { NotificationBell } from "./notification-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, User, Instagram, Music2, Youtube, Facebook, Menu, X, Sparkles, KeyRound, LogOut, Settings, Sun } from "lucide-react";
import { openTheDaily } from "@/components/workspace/daily-gate";
import { ForUsLink } from "@/components/for-us-link";

import { useCartSync } from "@/hooks/use-cart-sync";
import { KidsFooter, KidsNav } from "@/components/kids-world/kids-nav";

import {
  activeGlobal,
  areaNavFor,
  globalNavFor,
  type NavNode,
} from "@/lib/navigation/hierarchy";

import { useSiteText } from "@/hooks/use-site-text";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useMyRoles } from "@/hooks/use-my-roles";
import { accountMenuGroups } from "@/lib/navigation/account-menu";
import { supabase } from "@/integrations/supabase/client";
import { useSecureSignOut, SignOutButton } from "@/components/secure-sign-out";
import fullLogo from "@/assets/frass-logo-full.asset.json";
import symbolLogo from "@/assets/frass-logo-symbol.asset.json";

// FRASS-0590 — the header no longer keeps its own private list of places.
// Every item below comes from the one authoritative registry so the menus,
// Frassy and the breadcrumb can never disagree about where a place lives.
const ADMIN_ITEM = { to: "/admin", slot: "nav-admin", fallback: "Admin" } as const;


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
      aria-label="Frass site home"
      title="Site Home"
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
  const isAdmin = useIsAdmin();
  const signedIn = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const viewer = { signedIn, isAdmin, isFounder: isAdmin };
  const globals = globalNavFor(viewer);
  const here = activeGlobal(path);
  const areaItems = areaNavFor(path, viewer);

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-border/60" />
      <div className="relative mx-auto max-w-[1600px] px-6 lg:px-12 h-20 flex items-center justify-between gap-4">
        <div className="flex-1 hidden md:flex items-center gap-1">
          <ForUsLink
            className="nav-glow relative px-4 py-2 text-xs uppercase tracking-[0.25em] text-[color:var(--gold)] transition-colors"
            activeClassName="text-foreground"
          />
          {globals.map((node) => (
            <GlobalNavItem key={node.key} node={node} active={here?.key === node.key} />
          ))}
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
          <NotificationBell />
          {/* FRASS-0481 — one way in. The Workspace lives in the account menu only. */}

          <BuilderAccountMenu />
          <HeaderSignOut />

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur hover:border-[color:var(--gold)] transition"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 max-h-[75vh] w-72 overflow-y-auto rounded-2xl border border-border/70 bg-background/95 backdrop-blur-xl shadow-2xl p-2 z-50">
                  <ForUsLink
                    className="nav-glow block rounded-xl px-4 py-3 text-xs uppercase tracking-[0.25em] text-[color:var(--gold)] transition-colors hover:bg-foreground/5"
                    activeClassName="bg-foreground/5"
                  />
                  {globals.map((node) => (
                    <MenuGroup key={node.key} node={node} />
                  ))}
                  <div className="my-1 h-px bg-border/60" />
                  <MobileAccountLinks />
                </div>
              )}
          </div>
          <CartDrawer />
        </div>
      </div>
      {/* Level 1 on mobile — the major places, always one tap away. */}
      <div className="relative md:hidden border-t border-border/60 bg-background/60 backdrop-blur">
        <div className="flex overflow-x-auto no-scrollbar px-2 py-2 gap-1">
          <ForUsLink
            className="nav-glow shrink-0 whitespace-nowrap text-[10px] uppercase tracking-[0.2em] py-1 px-3 text-[color:var(--gold)]"
            activeClassName="text-foreground"
          />
          {globals.map((node) => (
            <Link
              key={node.key}
              to={node.path as never}
              className={`nav-glow shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] ${
                here?.key === node.key ? "bg-foreground/10 text-foreground" : "text-muted-foreground"
              }`}
            >
              {node.label}
            </Link>
          ))}
        </div>
      </div>
      {/* Level 2 — where you are, and what else is in this place. */}
      {here && areaItems.length > 0 && (
        <div className="relative border-t border-border/60 bg-background/50 backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto no-scrollbar px-4 py-2 lg:px-12">
            <Link
              to={here.path as never}
              className="mr-2 shrink-0 whitespace-nowrap rounded-full border border-[color:var(--gold)]/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--gold)]"
            >
              📍 {here.label}
            </Link>
            {areaItems.map((c) => (
              <Link
                key={c.key}
                to={c.path as never}
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition hover:bg-foreground/5 ${
                  path === c.path || path.startsWith(`${c.path}/`)
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      )}

    </header>
  );
}

function useSession() {
  const [session, setSession] = useState(false);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(!!s));
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return session;
}

/**
 * FRASS-0471 — always-visible sign-out on the bar. Same secure logout as the
 * profile menu entry; one logout, two access points.
 */
function HeaderSignOut() {
  const hasSession = useSession();
  if (!hasSession) return null;
  return (
    <SignOutButton
      label="Sign out"
      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur transition hover:border-[color:var(--gold)] hover:text-foreground"
    />
  );
}

function BuilderAccountMenu() {
  const hasSession = useSession();
  const { roles } = useMyRoles();
  const groups = accountMenuGroups(roles);
  const handleSignOut = useSecureSignOut();

  if (!hasSession) {
    return (
      <Link
        to="/auth"
        search={{ next: "" }}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur hover:border-[color:var(--gold)] transition"
        aria-label="Sign in"
      >
        <User className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur hover:border-[color:var(--gold)] transition"
          aria-label="Account menu"
        >
          <User className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[75vh] w-64 overflow-y-auto rounded-2xl border-border/70 bg-background/95 backdrop-blur-xl"
      >
        <DropdownMenuItem
          onClick={() => openTheDaily()}
          className="rounded-xl cursor-pointer flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--gold)]"
        >
          <Sun className="h-4 w-4" />
          The Frass Daily
        </DropdownMenuItem>
        {groups.map((group) => (
          <div key={group.id}>
            <DropdownMenuSeparator />
            <p className="px-3 pb-1 pt-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
              {group.label}
            </p>
            {group.items.map((item) => (
              <DropdownMenuItem key={item.to} asChild className="rounded-xl cursor-pointer">
                <Link
                  to={item.to as never}
                  title={item.plain}
                  className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]"
                >
                  <span aria-hidden>{item.glyph}</span>
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="rounded-xl cursor-pointer text-xs uppercase tracking-[0.2em]">
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileAccountLinks() {
  const hasSession = useSession();
  const { roles } = useMyRoles();
  const groups = accountMenuGroups(roles);
  const handleSignOut = useSecureSignOut();

  if (!hasSession) {
    return (
      <Link
        to="/auth"
        search={{ next: "" }}
        className="nav-glow block rounded-xl px-4 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-foreground/5"
      >
        Sign in
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => openTheDaily()}
        className="nav-glow block w-full rounded-xl px-4 py-3 text-left text-xs uppercase tracking-[0.25em] text-[color:var(--gold)] transition-colors hover:bg-foreground/5"
      >
        The Frass Daily
      </button>

      {groups.map((group) => (
        <div key={group.id}>
          <p className="px-4 pb-1 pt-3 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            {group.label}
          </p>
          {group.items.map((item) => (
            <Link
              key={item.to}
              to={item.to as never}
              title={item.plain}
              className="nav-glow block rounded-xl px-4 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-foreground/5"
              activeProps={{ className: "text-foreground bg-foreground/5" }}
            >
              <span aria-hidden className="mr-2">{item.glyph}</span>
              {item.label}
            </Link>
          ))}
        </div>
      ))}

      <button
        onClick={handleSignOut}
        className="nav-glow block w-full rounded-xl px-4 py-3 text-left text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-foreground/5"
      >
        Sign out
      </button>
    </>
  );
}

/**
 * FRASS-0590 — a Level 1 place on the desktop bar. Hovering or focusing it
 * reveals what lives inside that place, so the ecosystem is discoverable
 * without a giant flat menu.
 */
function GlobalNavItem({ node, active }: { node: NavNode; active: boolean }) {
  const [open, setOpen] = useState(false);
  const children = node.children ?? [];
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Link
        to={node.path as never}
        className={`nav-glow relative inline-block px-3 py-2 text-xs uppercase tracking-[0.22em] transition-colors ${
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {node.label}
        {active && <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-[color:var(--gold)]" />}
      </Link>
      {open && children.length > 0 && (
        <div className="absolute left-0 top-full z-50 w-72 rounded-2xl border border-border/70 bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
          {node.blurb && (
            <p className="px-3 pb-2 pt-1 text-[11px] normal-case tracking-normal text-muted-foreground">
              {node.blurb}
            </p>
          )}
          {children.map((c) => (
            <Link
              key={c.key}
              to={c.path as never}
              className="block rounded-xl px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** The same registry, rendered as a grouped list inside the menu panel. */
function MenuGroup({ node }: { node: NavNode }) {
  return (
    <div className="py-1">
      <Link
        to={node.path as never}
        className="nav-glow block rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground/5"
        activeProps={{ className: "bg-foreground/5" }}
      >
        {node.label}
      </Link>
      {(node.children ?? []).map((c) => (
        <Link
          key={c.key}
          to={c.path as never}
          className="block rounded-xl px-6 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          activeProps={{ className: "text-foreground bg-foreground/5" }}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}


function FreeTryOnFab() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  if (path.startsWith("/try-on")) return null;
  return (
    <Link
      to="/capsules"
      className="fixed bottom-5 left-5 md:bottom-8 md:left-8 z-40 inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)] bg-[color:var(--gold)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--ink)] shadow-[0_10px_40px_-10px_oklch(0.92_0.12_85_/_0.7)] transition hover:scale-[1.03] hover:bg-[color:var(--gold-soft,#f0d78c)]"
      aria-label="Free virtual try on"
    >
      <Sparkles className="h-4 w-4" />
      Free Try On!
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
          { title: "Help", links: [["Welcome Hall", "/welcome-hall"], ["Visual Search", "/visual-search"], ["Rewards", "/rewards"]] },
          { title: "Brand", links: [["Frass Hill", "/frass-hill"], ["Lookbook", "/lookbook"], ["For Us", "/for-us"]] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{col.title}</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link to={href as never} className="hover:text-[color:var(--gold)] transition">{label}</Link>
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
  const path = useRouterState({ select: (r) => r.location.pathname });
  // Kids World is a place of its own, so it wears its own chrome: a child-first
  // header, no adult footer, no shopping fab.
  const kids = path === "/kids-world" || path.startsWith("/kids-world/");

  if (kids) {
    return (
      <div className="relative min-h-screen">
        {preHeader}
        <KidsNav />
        <main className="relative">{children}</main>
        <KidsFooter />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {background && <LuxuryBackground />}
      {preHeader}
      <Header />
      <main className="relative">{children}</main>
      <Footer />
      <FreeTryOnFab />
    </div>
  );
}

