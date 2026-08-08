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

import { useCartSync } from "@/hooks/use-cart-sync";
import { useSiteText } from "@/hooks/use-site-text";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useWorkspaceRoles } from "@/hooks/use-workspace-roles";
import { supabase } from "@/integrations/supabase/client";
import fullLogo from "@/assets/frass-logo-full.asset.json";
import symbolLogo from "@/assets/frass-logo-symbol.asset.json";

const NAV_ITEMS = [
  { to: "/shop-frass", slot: "nav-frass-district", fallback: "Frass District" },
  { to: "/afro-designers", slot: "nav-afro-designers", fallback: "Afro Designers" },
  { to: "/capsules", slot: "nav-capsules", fallback: "Lookbooks & Capsules" },
  { to: "/social-media-virals", slot: "nav-social-virals", fallback: "Social Media Virals" },
] as const;


const MENU_ITEMS = [
  { to: "/gateway", slot: "nav-gateway", fallback: "Frass Gateway" },
  { to: "/frass-world", slot: "nav-frass-world", fallback: "Explore Frass World" },
  { to: "/lookbook", slot: "nav-lookbook", fallback: "Lookbook" },
  { to: "/music-media", slot: "nav-music-media", fallback: "Music & Media" },
  { to: "/blog", slot: "nav-blog", fallback: "Frass Blog" },
] as const;

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
  const isAdmin = useIsAdmin();
  const workspaceRoles = useWorkspaceRoles();
  const hasWorkspace = workspaceRoles.length > 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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
          <NotificationBell />
          {hasWorkspace && (
            <Link
              to="/workspace"
              aria-label="Workspace"
              title="Enter your private workspace"
              className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--gold)]/60 bg-background/70 backdrop-blur text-[color:var(--gold)] hover:bg-[color:var(--gold)]/10 transition"
            >
              <KeyRound className="h-4 w-4" />
            </Link>
          )}
          <BuilderAccountMenu hasWorkspace={hasWorkspace} isAdmin={isAdmin} />
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
                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-border/70 bg-background/95 backdrop-blur-xl shadow-2xl p-2 z-50">
                  {MENU_ITEMS.map((n) => <MenuLink key={n.to} item={n} />)}
                  <div className="my-1 h-px bg-border/60" />
                  <MobileAccountLinks hasWorkspace={hasWorkspace} isAdmin={isAdmin} />
                </div>
              )}
          </div>
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

function BuilderAccountMenu({ hasWorkspace, isAdmin }: { hasWorkspace: boolean; isAdmin: boolean }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasSession = useSession();

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { next: "" }, replace: true });
  };

  if (!hasSession) {
    return (
      <Link
        to="/auth"
        search={{ next: "" }}
        className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur hover:border-[color:var(--gold)] transition"
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
          className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur hover:border-[color:var(--gold)] transition"
          aria-label="Account menu"
        >
          <User className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border/70 bg-background/95 backdrop-blur-xl">
        <DropdownMenuItem
          onClick={() => openTheDaily()}
          className="rounded-xl cursor-pointer flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--gold)]"
        >
          <Sun className="h-4 w-4" />
          The Frass Daily
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">

          <Link to="/welcome-hall" className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <Sparkles className="h-4 w-4" />
            Welcome Hall
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
          <Link to="/vault" className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <KeyRound className="h-4 w-4" />
            Builder Vault
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
          <Link to="/creation" className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <Sparkles className="h-4 w-4" />
            Creation District
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
          <Link to="/opportunity" className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <Sparkles className="h-4 w-4" />
            Opportunity Center
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
          <Link to="/academy" className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <Sparkles className="h-4 w-4" />
            Academy District
          </Link>
        </DropdownMenuItem>


        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
          <Link to="/workspace/profile" className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <Settings className="h-4 w-4" />
            Builder Profile
          </Link>
        </DropdownMenuItem>

        {hasWorkspace && (
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
            <Link to="/workspace" className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
              <KeyRound className="h-4 w-4" />
              Workspace
            </Link>
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
            <Link to="/founder" className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
              <Sparkles className="h-4 w-4" />
              Founder Mode
            </Link>
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
            <Link to="/admin" className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
              <Sparkles className="h-4 w-4" />
              Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="rounded-xl cursor-pointer text-xs uppercase tracking-[0.2em]">
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileAccountLinks({ hasWorkspace, isAdmin }: { hasWorkspace: boolean; isAdmin: boolean }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasSession = useSession();

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { next: "" }, replace: true });
  };

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

      <Link
        to="/welcome-hall"
        className="nav-glow block rounded-xl px-4 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-foreground/5"
        activeProps={{ className: "text-foreground bg-foreground/5" }}
      >
        Welcome Hall
      </Link>
      <Link
        to="/vault"
        className="nav-glow block rounded-xl px-4 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-foreground/5"
        activeProps={{ className: "text-foreground bg-foreground/5" }}
      >
        Builder Vault
      </Link>
      <Link
        to="/creation"
        className="nav-glow block rounded-xl px-4 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-foreground/5"
        activeProps={{ className: "text-foreground bg-foreground/5" }}
      >
        Creation District
      </Link>
      <Link
        to="/opportunity"
        className="nav-glow block rounded-xl px-4 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-foreground/5"
        activeProps={{ className: "text-foreground bg-foreground/5" }}
      >
        Opportunity Center
      </Link>
      <Link
        to="/academy"
        className="nav-glow block rounded-xl px-4 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-foreground/5"
        activeProps={{ className: "text-foreground bg-foreground/5" }}
      >
        Academy District
      </Link>
      <Link
        to="/workspace/profile"
        className="nav-glow block rounded-xl px-4 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-foreground/5"
        activeProps={{ className: "text-foreground bg-foreground/5" }}
      >
        Builder Profile
      </Link>

      {hasWorkspace && (
        <Link
          to="/workspace"
          className="nav-glow block rounded-xl px-4 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-foreground/5"
          activeProps={{ className: "text-foreground bg-foreground/5" }}
        >
          Workspace
        </Link>
      )}
      {isAdmin && (
        <Link
          to="/founder"
          className="nav-glow block rounded-xl px-4 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-foreground/5"
          activeProps={{ className: "text-foreground bg-foreground/5" }}
        >
          Founder Mode
        </Link>
      )}
      {isAdmin && (
        <Link
          to="/admin"
          className="nav-glow block rounded-xl px-4 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-foreground/5"
          activeProps={{ className: "text-foreground bg-foreground/5" }}
        >
          Admin
        </Link>
      )}
      <button
        onClick={handleSignOut}
        className="nav-glow block w-full rounded-xl px-4 py-3 text-left text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-foreground/5"
      >
        Sign out
      </button>
    </>
  );
}

type NavItem = { to: string; slot: string; fallback: string };

function MenuLink({ item }: { item: NavItem }) {
  const label = useSiteText(item.slot, item.fallback);
  return (
    <Link
      to={item.to}
      className="nav-glow block rounded-xl px-4 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-foreground/5"
      activeProps={{ className: "text-foreground bg-foreground/5" }}
    >
      {label}
    </Link>
  );
}

function HeaderNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const label = useSiteText(item.slot, item.fallback);
  return (
    <Link
      to={item.to}
      className={`nav-glow relative px-4 py-2 text-xs uppercase tracking-[0.25em] transition-colors ${
        active ? "text-foreground" : "text-muted-foreground"
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
      className="nav-glow shrink-0 whitespace-nowrap text-[10px] uppercase tracking-[0.2em] py-1 px-3 text-muted-foreground"
      activeProps={{ className: "text-foreground" }}
    >
      {label}
    </Link>
  );
}

function FreeTryOnFab() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  if (path.startsWith("/try-on")) return null;
  return (
    <Link
      to="/capsules"
      className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-40 inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)] bg-[color:var(--gold)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--ink)] shadow-[0_10px_40px_-10px_oklch(0.92_0.12_85_/_0.7)] transition hover:scale-[1.03] hover:bg-[color:var(--gold-soft,#f0d78c)]"
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
      <FreeTryOnFab />
    </div>
  );
}
