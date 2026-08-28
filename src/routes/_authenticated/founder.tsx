// Founder Architecture Amendment — FOUNDER HALL is the single headquarters.
//
// This page creates no new administration. It is the one place the Founder
// starts from, and every card below opens an existing, independently protected
// room. Server-verified before anything renders or loads.
import { createFileRoute, Link } from "@tanstack/react-router";
import { requireFounderRoute } from "@/lib/founder/route-guard";
import { FOUNDER_ROOMS } from "@/lib/founder/founder-hall";

export const Route = createFileRoute("/_authenticated/founder")({
  beforeLoad: requireFounderRoute,
  head: () => ({
    meta: [
      { title: "Founder Hall — Frass Headquarters" },
      {
        name: "description",
        content:
          "Founder Hall: the single headquarters from which the Founder reaches the Control Room, the Onboarding Room, Frassy Studios, Vaults, security and site management.",
      },
      { property: "og:title", content: "Founder Hall — Frass Headquarters" },
      {
        property: "og:description",
        content: "One headquarters, many protected rooms.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FounderHall,
});

function FounderHall() {
  const rooms = FOUNDER_ROOMS.filter((r) => r.kind === "room");
  const experiences = FOUNDER_ROOMS.filter((r) => r.kind === "experience");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <nav
        aria-label="Founder Hall location"
        className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
      >
        <Link to="/welcome-hall" className="hover:text-foreground">
          Welcome Hall
        </Link>
        <span>→</span>
        <span aria-current="page" className="text-[color:var(--gold)]">
          Founder Hall
        </span>
      </nav>

      <h1 className="mt-5 text-3xl font-black uppercase tracking-tight">🏛 Founder Hall</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Your headquarters. Everything you run Frass with lives in its own room — this is the one
        place you reach them all from, and the one place every room brings you back to.
      </p>

      <h2 className="mt-10 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
        Protected rooms
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {rooms.map((room) => (
          <a
            key={room.id}
            href={room.path}
            className="rounded-xl border border-border/70 bg-background/70 px-5 py-4 transition hover:border-[color:var(--gold)]"
          >
            <div className="font-display text-lg">
              <span aria-hidden className="mr-2">
                {room.icon}
              </span>
              {room.label}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{room.purpose}</div>
          </a>
        ))}
      </div>

      <h2 className="mt-10 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
        The member experience
      </h2>
      <p className="mt-2 text-xs text-muted-foreground">
        This is not administration. It is Frass Hill exactly as a member walks it.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {experiences.map((room) => (
          <a
            key={room.id}
            href={room.path}
            className="rounded-xl border border-border/70 bg-background/40 px-5 py-4 transition hover:border-[color:var(--gold)]"
          >
            <div className="font-display text-lg">
              <span aria-hidden className="mr-2">
                {room.icon}
              </span>
              {room.label}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{room.purpose}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
