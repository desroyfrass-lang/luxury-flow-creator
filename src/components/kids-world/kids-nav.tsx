/**
 * FRASS-0590 — Kids World navigation.
 *
 * Kids World is not the adult site with children's content inside it. Children
 * get their own way of moving around: big colour, big pictures, big buttons,
 * almost no reading, and a Home and Back a child can find without help.
 *
 * The destinations still come from the one authoritative registry — only the
 * presentation changes, and it changes with the child's age.
 */
import { Link, useRouterState } from "@tanstack/react-router";
import { KIDS_WORLDS } from "@/lib/kids-world";

/** The six established Frass Kids age bands. */
export type KidsBand = {
  /** The band a grown-up would name. */
  id: "0-3" | "3-6" | "6-9" | "9-12" | "12-15" | "15-18";
  label: string;
  emoji: string;
  /** The Kids World content world this band enters. */
  world: string;
  colour: string;
  /** How much reading this band should need. Drives the presentation. */
  reading: "none" | "minimal" | "short" | "comfortable" | "fluent" | "full";
};

export const KIDS_BANDS: KidsBand[] = [
  { id: "0-3", label: "0–3", emoji: "👶", world: "0-3", colour: "#ff8f7a", reading: "none" },
  { id: "3-6", label: "3–6", emoji: "🧸", world: "3-6", colour: "#ffd34d", reading: "minimal" },
  { id: "6-9", label: "6–9", emoji: "🚀", world: "6-12", colour: "#8ce68c", reading: "short" },
  { id: "9-12", label: "9–12", emoji: "🎨", world: "6-12", colour: "#7fe3f0", reading: "comfortable" },
  { id: "12-15", label: "12–15", emoji: "🎧", world: "12-plus", colour: "#b79bff", reading: "fluent" },
  { id: "15-18", label: "15–18", emoji: "⚡", world: "12-plus", colour: "#ff8ac4", reading: "full" },
];

export function bandForWorld(worldSlug: string | undefined): KidsBand | undefined {
  return KIDS_BANDS.find((b) => b.world === worldSlug);
}

export function bandById(id: string): KidsBand | undefined {
  return KIDS_BANDS.find((b) => b.id === id);
}

/** Bands that should never be asked to read a breadcrumb or a text menu. */
export function isPictureFirst(band: KidsBand | undefined): boolean {
  return !band || band.reading === "none" || band.reading === "minimal";
}

/**
 * The Kids World header. One row: a huge Home, a huge Back, and the child's
 * own age colour. No dropdowns, no hamburger, no adult destinations.
 */
export function KidsNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const worldSlug = KIDS_WORLDS.find((w) => path.includes(`/kids-world/${w.slug}`))?.slug;
  const band = bandForWorld(worldSlug);
  const atHome = path === "/kids-world" || path === "/kids-world/";
  const accent = band?.colour ?? "#ffd34d";

  return (
    <header
      className="sticky top-0 z-50 border-b-4 bg-background/95 backdrop-blur-xl"
      style={{ borderColor: accent }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-3 sm:px-6">
        <Link
          to="/kids-world"
          aria-label="Kids World home"
          className="inline-flex min-h-[64px] min-w-[64px] items-center justify-center gap-2 rounded-3xl px-4 text-3xl shadow-lg transition active:scale-95"
          style={{ background: accent, color: "#1a1a1a" }}
        >
          <span aria-hidden>🏠</span>
          <span className="hidden text-base font-black uppercase tracking-wide sm:inline">Home</span>
        </Link>

        {!atHome && (
          <Link
            to="/kids-world"
            aria-label="Go back"
            className="inline-flex min-h-[64px] min-w-[64px] items-center justify-center gap-2 rounded-3xl border-4 px-4 text-3xl transition active:scale-95"
            style={{ borderColor: accent, color: accent }}
          >
            <span aria-hidden>⬅️</span>
            <span className="hidden text-base font-black uppercase tracking-wide sm:inline">Back</span>
          </Link>
        )}

        {band && (
          <span
            className="ml-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-lg font-black"
            style={{ background: `${accent}22`, color: accent }}
          >
            <span aria-hidden className="text-2xl">{band.emoji}</span>
            {band.label}
          </span>
        )}

        {atHome && (
          <span className="ml-auto text-lg font-black uppercase tracking-wide" style={{ color: accent }}>
            🌈 Kids World
          </span>
        )}
      </div>

      {/* Older bands get a small strip of places. The youngest never do —
          they choose from big pictures on the page itself. */}
      {band && !isPictureFirst(band) && (
        <div className="border-t border-border/40">
          <div className="mx-auto flex max-w-[1400px] gap-2 overflow-x-auto px-3 pb-3 pt-2 sm:px-6">
            <KidsChip to="/kids-world/street" emoji="🏘" label="Frass Street" accent={accent} />
            <KidsChip to="/kids-world/discover" emoji="✨" label="Discover" accent={accent} />
            <KidsChip to="/frass-kids" emoji="🛍" label="Shop Kids" accent={accent} />
          </div>
        </div>
      )}
    </header>
  );
}

function KidsChip({
  to,
  emoji,
  label,
  accent,
}: {
  to: string;
  emoji: string;
  label: string;
  accent: string;
}) {
  return (
    <Link
      to={to as never}
      className="inline-flex min-h-[52px] shrink-0 items-center gap-2 rounded-2xl border-2 px-4 text-base font-bold transition active:scale-95"
      style={{ borderColor: `${accent}66`, color: accent }}
    >
      <span aria-hidden className="text-2xl">{emoji}</span>
      {label}
    </Link>
  );
}

/**
 * The Kids World footer: one enormous way out, for a grown-up.
 * Children never see Founder, Admin, Studios, Vault or adult social exits.
 */
export function KidsFooter() {
  return (
    <footer className="mt-16 border-t-4 border-border/40 bg-background/70 px-4 py-10 text-center">
      <Link
        to="/kids-world/parents"
        className="inline-flex min-h-[56px] items-center gap-2 rounded-2xl border-2 border-border px-6 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
      >
        👨‍👩‍👧 Grown-ups
      </Link>
      <div className="mt-4">
        <Link
          to="/welcome-hall"
          className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
        >
          Leave Kids World
        </Link>
      </div>
    </footer>
  );
}
