import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import valley from "@/assets/kids-valley.jpg";

/**
 * FRASS-0423 — Kids Valley.
 *
 * Children do not enter Frass Hill through Town Square. They walk down their
 * own valley: Welcome Hall → Kids Valley → Children's Village → Discovery
 * Village → Young Builders Quarter → Frass Hill, when they're ready.
 */
export const Route = createFileRoute("/kids-valley")({
  head: () => ({
    meta: [
      { title: "Kids Valley — The Children's Road into Frass Hill" },
      {
        name: "description",
        content:
          "The children's entrance to Frass Hill: a peaceful valley road that leads to Children's Village, Discovery Village and the Young Builders Quarter.",
      },
      { property: "og:title", content: "Kids Valley — The Children's Road into Frass Hill" },
      {
        property: "og:description",
        content: "A safe, age-appropriate road into the children's world — no Town Square, no adult feeds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://frasskicks.com/kids-valley" }],
  }),
  component: KidsValleyPage,
});

const STOPS = [
  {
    step: "1",
    name: "Kids Valley",
    ages: "The road in",
    line: "A quiet green walk down from the gates. Nothing to buy, nothing to scroll — just the way in.",
    to: "/kids-valley",
  },
  {
    step: "2",
    name: "Children's Village",
    ages: "Ages 0–6",
    line: "The Gentle Garden and the Story Courtyard: sound, colour, calm, reading and first making.",
    to: "/kids-world/0-3",
  },
  {
    step: "3",
    name: "Discovery Village",
    ages: "Ages 6–12",
    line: "STEM, art, music and nature — the years where curiosity turns into skill.",
    to: "/kids-world/6-12",
  },
  {
    step: "4",
    name: "Young Builders Quarter",
    ages: "Ages 12+",
    line: "Real projects, real skills, real feedback — with the same safety rails.",
    to: "/kids-world/12-plus",
  },
  {
    step: "5",
    name: "Frass Hill",
    ages: "When they're ready",
    line: "One day they graduate up the hill into the main community. They grow into it.",
    to: "/frass-hill",
  },
];

function KidsValleyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative min-h-[64vh] overflow-hidden">
        <img
          src={valley}
          alt="A green Jamaican valley path winding beside a river in soft morning light"
          width={1600}
          height={912}
          className="hero-drift absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-background/20" />
        <div className="relative mx-auto flex min-h-[64vh] max-w-[1200px] flex-col justify-end px-6 pb-14 pt-24 lg:px-10">
          <Link
            to="/welcome-hall"
            className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
          >
            ← Welcome Hall
          </Link>
          <h1 className="mt-4 text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl">
            Kids Valley
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Children get their own road. No Town Square, no adult feeds, no shopfronts shouting for
            attention — just a green valley that leads down into the children's world.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/kids-world"
              className="chrome-glow inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] transition hover:scale-[1.02]"
            >
              Enter Children's Village <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              to="/kids-world/parents"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground transition hover:text-foreground"
            >
              Parent Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 pb-24 lg:px-10">
        <section className="mt-14">
          <h2 className="text-xl font-black uppercase tracking-tight md:text-2xl">
            The road, stop by stop
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {STOPS.map((s) => (
              <li key={s.step}>
                <Link
                  to={s.to}
                  className="chrome-glow group block h-full rounded-2xl border border-border/70 bg-card/50 p-6 transition hover:scale-[1.01]"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      Stop {s.step}
                    </span>
                    <span className="rounded-full border border-border/70 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      {s.ages}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{s.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.line}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition group-hover:text-foreground">
                    Walk on <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-14 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Here's the takeaway:</strong> think of a
          school with its own driveway instead of a door onto a busy market street. Children arrive
          somewhere quiet and age-appropriate, and only step into the wider town when they're old
          enough for it.
        </p>
      </main>
    </div>
  );
}
