import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Radio } from "lucide-react";
import {
  PRESENCE_LENSES,
  SQUARE_ANNOUNCEMENTS,
  SQUARE_QUARTERS,
  presencesFor,
  squareMood,
  type PresenceKind,
} from "@/lib/town-square";
import { useLiveNow } from "@/hooks/use-live";
import squareHero from "@/assets/town-square-hero.jpg";

/**
 * FRASS-0421 Phase 2 — Town Square.
 *
 * Not a feed of people. A square full of presences: businesses, artists,
 * brands, farmers, builders, events, stores, districts, live broadcasts,
 * community, foundation, announcements and creators.
 */
export const Route = createFileRoute("/town-square")({
  head: () => ({
    meta: [
      { title: "Town Square — The Heart of Frass Hill" },
      {
        name: "description",
        content:
          "The civic heart of Frass Hill: people, businesses, artists, brands, farmers, builders, events, stores, districts and live broadcasts, all in one square.",
      },
      { property: "og:title", content: "Town Square — The Heart of Frass Hill" },
      {
        property: "og:description",
        content: "Everything on Frass Hill starts in the square — people, businesses, stores, events and live broadcasts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://frasskicks.com/town-square" }],
  }),
  component: TownSquarePage,
});

function TownSquarePage() {
  const [lens, setLens] = useState<PresenceKind | "all">("all");
  const mood = useMemo(() => squareMood(), []);
  const { data: liveNow } = useLiveNow();
  const live = liveNow ?? [];

  const presences = useMemo(() => presencesFor(lens), [lens]);
  const activeLens = PRESENCE_LENSES.find((l) => l.id === lens)!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* The square itself — a real Caribbean town square, photographed, not drawn */}
      <header className="relative overflow-hidden border-b border-border/60">
        <img
          src={squareHero}
          alt="A real Jamaican town square at golden hour: market stalls, pastel colonial shopfronts and people walking and talking"
          width={1600}
          height={912}
          className="hero-drift absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="relative mx-auto max-w-[1400px] px-6 py-14 lg:px-10 lg:py-24">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            <span aria-hidden className="mr-2">
              {mood.glyph}
            </span>
            {mood.label} in the square
          </p>
          <h1 className="mt-4 text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl">
            Town Square
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {mood.line} This is not a feed of people — it is the whole town. Businesses, artists,
            brands, farmers, builders, events, stores, districts, broadcasts and notices all stand
            here together. Everything on Frass Hill starts in the square.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/live/go"
              className="chrome-glow inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] transition hover:scale-[1.02]"
            >
              <Radio className="h-3.5 w-3.5" />
              Take the stage
            </Link>
            <Link
              to="/for-us"
              search={{ from: "/town-square" }}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground transition hover:text-foreground"
            >
              For Us — the Community Hall
            </Link>
            <Link
              to="/for-me"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground transition hover:text-foreground"
            >
              For Me — your page
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 pb-24 lg:px-10">
        {/* Live right now — the stage in the middle of the square */}
        <section className="mt-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-black uppercase tracking-tight md:text-2xl">
              <span aria-hidden className="mr-2">
                🔴
              </span>
              On the stage right now
            </h2>
            <Link to="/live" className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground">
              Live directory
            </Link>
          </div>

          {live.length === 0 ? (
            <p className="mt-4 max-w-xl text-sm text-muted-foreground">
              The stage is empty at the moment. When anyone on the Hill goes live — a creator, a
              farmer, a Foundation event, a Frass Radio session — they appear here first.
            </p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((b) => (
                <Link
                  key={b.id}
                  to="/live/$broadcastId"
                  params={{ broadcastId: b.id }}
                  className="chrome-glow rounded-2xl border border-border/70 bg-card/60 p-5 transition hover:scale-[1.01]"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-destructive">
                    ● Live · {b.destination === "radio" ? "Frass Radio" : "For Us"}
                  </span>
                  <h3 className="mt-3 text-base font-bold">{b.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{b.host_name}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* The corners of the square — where each group naturally stands */}
        <section className="mt-14">
          <h2 className="text-xl font-black uppercase tracking-tight md:text-2xl">
            Walk the square
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            A real square has corners. Performers over there, business row along the side, farmers
            with their crates, the wedding expo under the trees, builders in the yard. Children are
            not here — they come down through{" "}
            <Link to="/kids-valley" className="underline">
              Kids Valley
            </Link>{" "}
            into their own village.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SQUARE_QUARTERS.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setLens(q.lens)}
                className="chrome-glow group rounded-2xl border border-border/70 bg-card/50 p-5 text-left transition hover:scale-[1.01]"
              >
                <span aria-hidden className="text-2xl">
                  {q.glyph}
                </span>
                <h3 className="mt-4 text-base font-bold">{q.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{q.scene}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition group-hover:text-foreground">
                  Stand here <ArrowRight className="h-3 w-3" />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Lenses — who you are looking for in the square */}
        <section className="mt-14">
          <h2 className="text-xl font-black uppercase tracking-tight md:text-2xl">Who is in the square</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {PRESENCE_LENSES.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLens(l.id)}
                aria-pressed={lens === l.id}
                className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition ${
                  lens === l.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span aria-hidden className="mr-1.5">
                  {l.glyph}
                </span>
                {l.label}
              </button>
            ))}
          </div>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{activeLens.blurb}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {presences.map((p) => (
              <Link
                key={p.id}
                to={p.to}
                className="chrome-glow group rounded-2xl border border-border/70 bg-card/50 p-5 transition hover:scale-[1.01]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span aria-hidden className="text-2xl">
                    {p.glyph}
                  </span>
                  {p.status && (
                    <span className="rounded-full border border-border/70 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      {p.status}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-base font-bold">{p.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.line}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition group-hover:text-foreground">
                  Walk over <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}

            {presences.length === 0 && (
              <p className="text-sm text-muted-foreground">Nobody is standing here yet today.</p>
            )}
          </div>
        </section>

        {/* The notice board */}
        <section className="mt-16">
          <h2 className="text-xl font-black uppercase tracking-tight md:text-2xl">
            <span aria-hidden className="mr-2">
              📣
            </span>
            The notice board
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {SQUARE_ANNOUNCEMENTS.map((a) => (
              <article key={a.id} className="rounded-2xl border border-border/70 bg-card/40 p-5">
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{a.from}</span>
                <h3 className="mt-3 text-base font-bold">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
                {a.to && (
                  <Link
                    to={a.to}
                    className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] hover:underline"
                  >
                    Read it there <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        <p className="mt-16 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Here's how it works:</strong> most social
          apps only show you people. The square shows you the town — the shop that just opened, the
          farmer selling today, the band playing tonight, the notice the town posted this morning.
          You walk through it the way you would walk through a real square at home.
        </p>
      </main>
    </div>
  );
}
