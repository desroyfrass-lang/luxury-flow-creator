import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { StreetFeed } from "@/components/kids/street-feed";
import { useKidsPassport } from "@/lib/kids-passport";
import { useKidsProgress } from "@/lib/kids-progress";
import {
  AGE_BANDS,
  ageBand,
  buildStreetFeed,
  buildingsForAge,
  CHARACTERS,
  graduationLine,
  needsGrownUp,
  readyToGraduate,
  STREET_FOUNDER_PRINCIPLE,
  STREET_NOT_SOCIAL,
  STREET_PRINCIPLE,
  TOPIC_LABEL,
  TOPICS,
  type StreetTopic,
} from "@/lib/kids/frass-street";
import { cn } from "@/lib/utils";

const TITLE = "Frass Street — A Child's Own World of Learning and Making";
const DESCRIPTION =
  "Frass Street is the children's neighbourhood inside Frass: stories, art, music, science, nature and kindness in one private, personalised world. Not a social network — a place to learn, create and grow.";

export const Route = createFileRoute("/kids-world/street")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FrassStreet,
});

const INTEREST_KEY = "frass.street.interests.v1";

function FrassStreet() {
  const { passport, ready } = useKidsPassport();
  const { progress } = useKidsProgress();
  const [interests, setInterests] = useState<StreetTopic[]>([]);
  const [band, setBand] = useState(ageBand(passport?.age));
  const [showBuildings, setShowBuildings] = useState(false);

  useEffect(() => {
    setBand(ageBand(passport?.age));
  }, [passport?.age]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(INTEREST_KEY);
      if (raw) setInterests(JSON.parse(raw) as StreetTopic[]);
    } catch {
      /* interests are a nicety, never a blocker */
    }
  }, []);

  const toggleInterest = (t: StreetTopic) => {
    setInterests((prev) => {
      const next = prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t];
      try {
        window.localStorage.setItem(INTEREST_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // The street rotates daily so it is never identical two days running.
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const cards = useMemo(
    () =>
      buildStreetFeed({
        band,
        interests,
        progress,
        dayIndex,
        childName: passport?.childName,
      }),
    [band, interests, progress, dayIndex, passport?.childName],
  );

  const buildings = buildingsForAge(band);
  const bandInfo = AGE_BANDS.find((b) => b.id === band)!;

  return (
    <main className="bg-background pb-16">
      {/* Street sign */}
      <header className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/20 via-accent/10 to-transparent px-4 py-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          The children's neighbourhood of Frass Hill
        </p>
        <h1 className="mt-3 font-display text-4xl uppercase leading-none md:text-6xl">Frass Street</h1>
        <p className="mt-2 text-sm font-medium tracking-[0.2em] text-muted-foreground">
          LEARN · PLAY · CREATE · GROW
        </p>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">{STREET_PRINCIPLE}</p>
        <p className="mx-auto mt-3 max-w-lg rounded-full bg-card/70 px-4 py-1.5 text-[11px] text-muted-foreground ring-1 ring-border">
          🔒 {STREET_NOT_SOCIAL}
        </p>
      </header>

      {/* Age world — the passport decides, a grown-up can change it */}
      <section className="mx-auto mt-6 max-w-2xl px-4">
        <div className="rounded-3xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Age world</span>
            {AGE_BANDS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBand(b.id)}
                disabled={Boolean(passport?.locked) && passport?.age !== b.id}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-30",
                  band === b.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70",
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{bandInfo.spirit}</p>
          {needsGrownUp(band) ? (
            <p className="mt-2 rounded-2xl bg-accent/15 px-3 py-2 text-xs">
              👋 This world is made for a child and a grown-up together.
            </p>
          ) : null}
          {ready && !passport ? (
            <Link
              to="/kids-world"
              className="mt-3 inline-block text-xs font-semibold text-primary underline underline-offset-4"
            >
              A grown-up can set up a passport →
            </Link>
          ) : null}
        </div>
      </section>

      {/* What the child likes — shapes the street, never narrows it to one subject */}
      <section className="mx-auto mt-4 max-w-2xl px-4">
        <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          What do you like today?
        </p>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleInterest(t)}
              aria-pressed={interests.includes(t)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition",
                interests.includes(t)
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border hover:bg-muted",
              )}
            >
              {TOPIC_LABEL[t].emoji} {TOPIC_LABEL[t].label}
            </button>
          ))}
        </div>
      </section>

      {/* The neighbourhood */}
      <section className="mx-auto mt-6 max-w-2xl px-4">
        <button
          type="button"
          onClick={() => setShowBuildings((s) => !s)}
          className="w-full rounded-3xl border border-border bg-card px-4 py-3 text-left text-sm font-semibold"
        >
          🏘 Walk the street {showBuildings ? "▲" : "▼"}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {buildings.length} places to visit
          </span>
        </button>
        {showBuildings ? (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {buildings.map((b) => (
              <div
                key={b.slug}
                className="rounded-2xl border border-border bg-card p-3"
                style={{ borderTopColor: b.accent, borderTopWidth: 3 }}
              >
                <p className="text-2xl" aria-hidden>{b.emoji}</p>
                <p className="mt-1 text-sm font-semibold leading-tight">{b.name}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{b.invitation}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* The feed */}
      <div className="mt-8">
        <StreetFeed cards={cards} band={band} />
      </div>

      {/* Who you'll meet */}
      <section className="mx-auto max-w-2xl px-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Who you'll meet
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CHARACTERS.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-3 text-center">
              <p className="text-2xl" aria-hidden>{c.emoji}</p>
              <p className="mt-1 text-xs font-semibold">{c.name}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{c.teaches}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground/80">
          Every one of them is Frassy in a different hat — one guide, one memory, many ways of helping.
        </p>
      </section>

      {/* Growing up */}
      {readyToGraduate(band) ? (
        <section className="mx-auto mt-8 max-w-2xl px-4">
          <div className="rounded-3xl border border-primary/40 bg-primary/5 p-5 text-center">
            <p className="text-3xl" aria-hidden>🎓</p>
            <p className="mt-2 text-sm font-semibold">{graduationLine(passport?.childName)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Every drawing, story, badge and project comes with you. Nothing starts over. A grown-up
              approves the move when the time is right.
            </p>
          </div>
        </section>
      ) : null}

      <p className="mx-auto mt-8 max-w-xl px-4 text-center text-[11px] italic text-muted-foreground">
        {STREET_FOUNDER_PRINCIPLE}
      </p>

      <p className="mx-auto mt-4 max-w-xl px-4 text-center text-[11px] text-muted-foreground">
        Grown-ups:{" "}
        <Link to="/kids-world/parents" className="font-semibold text-primary underline underline-offset-4">
          open the Parent Dashboard
        </Link>{" "}
        to see progress, interests and everything made here.
      </p>
    </main>
  );
}
