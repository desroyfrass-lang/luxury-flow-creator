import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import gateway from "@/assets/welcome-hall-gateway.jpg";
import valley from "@/assets/kids-valley.jpg";
import { ambienceEnabled, setAmbienceEnabled, startAmbience, stopAmbience } from "@/lib/for-us-ambience";

/**
 * FRASS-0423 — Welcome Hall.
 *
 * Welcome Hall is NOT Town Square. It is the registration and arrival gateway
 * into Frass Hill: where a visitor learns what this place is, meets Frassy,
 * registers, and chooses their entrance — Frass Hill or Kids Valley.
 */
export const Route = createFileRoute("/welcome-hall")({
  head: () => ({
    meta: [
      { title: "Welcome Hall — Arrive at Frass Hill" },
      {
        name: "description",
        content:
          "The arrival gateway to Frass Hill. Register, meet Frassy, and choose your entrance — the main community of Frass Hill, or the peaceful route through Kids Valley.",
      },
      { property: "og:title", content: "Welcome Hall — Arrive at Frass Hill" },
      {
        property: "og:description",
        content: "Register at the gates, meet Frassy, then walk into Frass Hill or Kids Valley.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://frasskicks.com/welcome-hall" }],
  }),
  component: WelcomeHallPage,
});

const WHAT_THIS_IS = [
  {
    glyph: "🏘",
    title: "Frass Hill is a town, not a menu",
    line: "Nine places sit on the Hill — a retail district, a luxury house, studios, a farm, a wellness centre, a builders village, Founder Hall, Town Square and the children's valley.",
  },
  {
    glyph: "🤝",
    title: "Frassy meets you at the gate",
    line: "She is the host of the Hill. She remembers what you're building, explains anything twice, and never lets a stranger talk you out of your own money.",
  },
  {
    glyph: "🗝",
    title: "You register once",
    line: "Registration gives you a For Me page, a Builder Vault, and a seat in the community. Nothing here is anonymous, and nothing here is sold about you.",
  },
];

const ARRIVAL_SIGHTLINES = [
  { name: "Frass District", line: "The retail heart, down below the gates.", to: "/frass-district" },
  { name: "Frass Luxury House", line: "The private estate up on the hill.", to: "/frass-luxury-house" },
  { name: "Studio District", line: "FV Studios, in the distance.", to: "/studio" },
  { name: "Builders Village", line: "Where the work gets made in public.", to: "/academy" },
  { name: "Health & Wellness Centre", line: "The mountain sanctuary.", to: "/health-wellness" },
  { name: "Farm District", line: "Fields and market days.", to: "/frass-hill" },
  { name: "Founder Hall", line: "Governance and the record of the Hill.", to: "/frass-hill" },
  { name: "Town Square", line: "The civic heart — everyone's experience.", to: "/town-square" },
];

function WelcomeHallPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* The gates */}
      <header className="relative min-h-[72vh] overflow-hidden">
        <img
          src={gateway}
          alt="Visitors walking through the stone arrival gates of a Caribbean hill town at golden hour"
          width={1600}
          height={912}
          className="hero-drift absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="relative mx-auto flex min-h-[72vh] max-w-[1200px] flex-col justify-end px-6 pb-16 pt-24 lg:px-10">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            The gates of Frass Hill
          </p>
          <h1 className="mt-4 text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl">
            Welcome Hall
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Nobody teleports into Frass Hill. You arrive. This is where you register, learn what the
            Hill is, meet Frassy, and choose the road you walk in on.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
            <Link
              to="/auth"
              search={{ next: "/frass-hill" }}
              className="chrome-glow group rounded-2xl border border-border bg-card/70 p-6 transition hover:scale-[1.01]"
            >
              <span aria-hidden className="text-3xl">
                🌄
              </span>
              <h2 className="mt-4 text-xl font-black uppercase tracking-tight">Enter Frass Hill</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The main community — Town Square, the districts, the shops, the studios and the
                people who live here.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition group-hover:text-foreground">
                Register and walk in <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              to="/kids-valley"
              className="chrome-glow group rounded-2xl border border-border bg-card/70 p-6 transition hover:scale-[1.01]"
            >
              <span aria-hidden className="text-3xl">
                👶
              </span>
              <h2 className="mt-4 text-xl font-black uppercase tracking-tight">Enter Kids Valley</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The children's entrance. Kids never come in through Town Square — they walk down the
                valley into Children's Village.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition group-hover:text-foreground">
                Take the valley road <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Already registered?{" "}
            <Link to="/builder-hall" className="underline">
              Go to your Builder Hall
            </Link>{" "}
            or{" "}
            <Link to="/town-square" className="underline">
              straight to Town Square
            </Link>
            .
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 pb-24 lg:px-10">
        <section className="mt-14">
          <h2 className="text-xl font-black uppercase tracking-tight md:text-2xl">
            What you're walking into
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {WHAT_THIS_IS.map((c) => (
              <article key={c.title} className="rounded-2xl border border-border/70 bg-card/50 p-6">
                <span aria-hidden className="text-2xl">
                  {c.glyph}
                </span>
                <h3 className="mt-4 text-base font-bold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.line}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Sightlines — every building visible before it is visited */}
        <section className="mt-16">
          <h2 className="text-xl font-black uppercase tracking-tight md:text-2xl">
            From the gate, you can already see
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ARRIVAL_SIGHTLINES.map((s) => (
              <Link
                key={s.name}
                to={s.to}
                className="chrome-glow group rounded-xl border border-border/70 bg-card/40 p-4 transition hover:scale-[1.01]"
              >
                <h3 className="text-sm font-bold">{s.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.line}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* The children's road */}
        <section className="mt-16 overflow-hidden rounded-[2rem] border border-border/70">
          <div className="grid md:grid-cols-2">
            <img
              src={valley}
              alt="A green Jamaican valley path winding beside a river in morning light"
              width={1600}
              height={912}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="bg-card/50 p-8 lg:p-12">
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                The children's road
              </p>
              <h2 className="mt-3 text-2xl font-black uppercase tracking-tight md:text-3xl">
                Kids Valley
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Children take a different road entirely: Welcome Hall → Kids Valley → Children's
                Village → Discovery Village → Young Builders Quarter, and one day, when they're
                ready, into Frass Hill itself. They grow into the community rather than starting in
                the middle of it.
              </p>
              <Link
                to="/kids-valley"
                className="chrome-glow mt-7 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] transition hover:scale-[1.02]"
              >
                Walk down the valley <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>

        <p className="mt-14 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">What this means in plain English:</strong> most sites
          drop you on a home page with a menu. Frass Hill has a front gate. You stand at it, look out
          over the town, decide which road you want, and then walk in — the same way you'd arrive
          somewhere real.
        </p>
      </main>
    </div>
  );
}
