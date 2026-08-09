import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { ArrowLeft, Sparkles, Compass } from "lucide-react";
import hallImage from "@/assets/for-us-tropical-hall.jpg";
import { usePublishedStories } from "@/hooks/use-for-us-stories";
import {
  CAUGHT_UP_ACTIONS,
  SCENIC_MOMENTS,
  buildDiscoveryFeed,
  mergePublished,
  orderExhibits,
  orderSections,
  resolveForUsContext,
  resolveForUsWeather,
  type FeedStory,
  type ScenicMoment,
} from "@/lib/for-us";

/**
 * FRASS-0415 — For Us is designed for discovery.
 * One continuous community stream, scenic rests between groups of posts, and
 * a page that changes with the hour, so it feels like visiting Frass right now.
 */

export const Route = createFileRoute("/for-us")({
  validateSearch: (search: Record<string, unknown>) => ({
    from: typeof search.from === "string" ? search.from : "",
  }),
  head: () => ({
    meta: [
      { title: "For Us — The Living Community of Frass Hill" },
      {
        name: "description",
        content:
          "For Us is the living community of Frass Hill: creators, families, businesses, music, milestones and celebrations, discovered one story at a time.",
      },
      { property: "og:title", content: "For Us — The Living Community of Frass Hill" },
      {
        property: "og:description",
        content: "People before products. Stories before shopping. Discovery before algorithms.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForUsPage,
});

const GROUP_SIZE = 6;

function StoryCard({ story, feature }: { story: FeedStory; feature?: boolean }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border border-border bg-card p-7 shadow-[0_18px_50px_-38px_rgba(20,60,50,0.7)] transition hover:-translate-y-1 hover:border-[color:var(--gold)]/60 hover:shadow-[0_28px_70px_-40px_rgba(20,80,70,0.55)] ${
        feature ? "md:col-span-2 md:p-10" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.26em]">
        <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
          <span aria-hidden className="mr-1.5">
            {story.sectionGlyph}
          </span>
          {story.sectionName}
        </span>
        <span className="text-[color:var(--gold)]">{story.source}</span>
      </div>
      <h3 className={`mt-4 font-semibold leading-snug ${feature ? "text-2xl md:text-4xl" : "text-xl"}`}>
        {story.title}
      </h3>
      <p className={`mt-3 leading-relaxed text-muted-foreground ${feature ? "text-base" : "text-sm"}`}>
        {story.body}
      </p>
      {story.to && (
        <Link
          to={story.to}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/60 px-5 py-2 text-[10px] uppercase tracking-[0.25em] text-[color:var(--ink)] transition hover:bg-[color:var(--gold)] hover:text-[color:var(--primary-foreground)]"
        >
          {story.cta ?? "Open"}
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      )}
    </article>
  );
}

function ScenicRest({ moment }: { moment: ScenicMoment }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[2.5rem] border border-border bg-gradient-to-br ${moment.sky} px-8 py-14 text-center md:py-20`}
      aria-label="A quiet moment in Frass"
    >
      <span className="text-3xl" aria-hidden>
        {moment.glyph}
      </span>
      <p className="mx-auto mt-4 max-w-2xl text-balance text-xl font-semibold leading-snug text-[color:var(--ink)] md:text-2xl">
        {moment.line}
      </p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{moment.detail}</p>
    </section>
  );
}

function ForUsPage() {
  const { from } = Route.useSearch();
  const navigate = useNavigate();
  const context = useMemo(() => resolveForUsContext(from || undefined), [from]);
  const weather = useMemo(() => resolveForUsWeather(), []);
  const { data: published = [] } = usePublishedStories();

  const sections = useMemo(
    () => mergePublished(orderSections(context.priority), published),
    [context.priority, published],
  );
  const feed = useMemo(() => buildDiscoveryFeed(sections, context.priority), [sections, context.priority]);
  const exhibits = useMemo(() => orderExhibits(context.priority), [context.priority]);

  const [groups, setGroups] = useState(2);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(() => setGroups((g) => g + 1), []);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [loadMore]);

  /** The stream never hits an artificial cap: the town keeps coming round again. */
  const visible = useMemo(() => {
    if (feed.length === 0) return [];
    const out: { key: string; story: FeedStory; feature: boolean }[] = [];
    const total = groups * GROUP_SIZE;
    for (let i = 0; i < total; i += 1) {
      const lap = Math.floor(i / feed.length);
      const story = feed[i % feed.length];
      out.push({ key: `${story.id}-${lap}`, story, feature: i % GROUP_SIZE === 0 });
    }
    return out;
  }, [feed, groups]);

  const goBack = () => {
    if (from) navigate({ to: from });
    else navigate({ to: "/frass-hill" });
  };

  const chunks: (typeof visible)[] = [];
  for (let i = 0; i < visible.length; i += GROUP_SIZE) chunks.push(visible.slice(i, i + GROUP_SIZE));

  return (
    <SiteShell>
      <div className="for-us-tropical" style={{ background: weather.wash }}>
        {/* Community breadcrumb — where you came from, and the way back */}
        <div className="border-b border-border bg-card/70 backdrop-blur">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-6 py-3 lg:px-12">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              {context.label} <span className="text-[color:var(--gold)]">→</span> For Us
            </span>
            <span className="ml-auto text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <span aria-hidden className="mr-1.5">
                {weather.glyph}
              </span>
              {weather.label}
            </span>
          </div>
        </div>

        {/* Arrival — open-air, tropical, alive */}
        <section className="mx-auto max-w-[1400px] px-6 pt-8 lg:px-12">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border">
            <img
              src={hallImage}
              alt="The open-air Frass Community Hall above the sea, palms and hillside gardens in the morning light"
              width={1600}
              height={912}
              className="hero-drift h-[52vh] min-h-[340px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--background)] via-[color:var(--background)]/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
                Town Square · The Living Community
              </p>
              <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.12em] text-[color:var(--ink)] md:text-6xl">
                For Us
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                People before products. Stories before shopping. For Us is designed for discovery — keep
                walking and there is always another story around the corner. {weather.greeting}
              </p>
            </div>
          </div>
        </section>

        {/* Frassy, Community Steward */}
        <section className="mx-auto max-w-[1400px] px-6 pt-8 lg:px-12">
          <div className="flex flex-col gap-3 rounded-[1.75rem] border border-[color:var(--gold)]/50 bg-card p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--gold)]" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="text-foreground">Frassy, Community Steward:</span> Good to see you.{" "}
                {context.priority.length > 0
                  ? `Since you came from ${context.label}, I put those stories nearer the top.`
                  : "Here is what the town has been up to."}{" "}
                Nothing here is ranked to keep you scrolling — it is ranked to keep you connected.
              </p>
            </div>
            <Link
              to="/frassy"
              className="shrink-0 rounded-full border border-[color:var(--gold)] px-5 py-2 text-center text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)] transition hover:bg-[color:var(--gold)] hover:text-[color:var(--primary-foreground)]"
            >
              Ask Frassy
            </Link>
          </div>
        </section>

        {/* Stepping inside — what the hall is showing as you walk in */}
        <section className="mx-auto max-w-[1400px] px-6 pt-10 lg:px-12">
          <header className="mb-5">
            <h2 className="text-xl font-bold uppercase tracking-[0.2em] md:text-2xl">Inside the hall</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Screens, boards and exhibits — what the room is showing right now.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {exhibits.map((ex) => (
              <div
                key={ex.id}
                className="rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-[color:var(--gold)]/60"
              >
                <span className="text-xl" aria-hidden>
                  {ex.glyph}
                </span>
                <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                  {ex.name}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{ex.showing}</p>
                {ex.to && (
                  <Link
                    to={ex.to}
                    className="mt-3 inline-block text-[10px] uppercase tracking-[0.22em] underline-offset-4 hover:text-[color:var(--gold)] hover:underline"
                  >
                    {ex.cta ?? "Open"} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* The continuous community stream */}
        <div className="mx-auto max-w-[1400px] space-y-12 px-6 py-14 lg:px-12">
          {chunks.map((chunk, index) => (
            <div key={`group-${index}`} className="space-y-12">
              <div className="grid gap-6 md:grid-cols-2">
                {chunk.map(({ key, story, feature }) => (
                  <StoryCard key={key} story={story} feature={feature} />
                ))}
              </div>
              <ScenicRest moment={SCENIC_MOMENTS[index % SCENIC_MOMENTS.length]} />
            </div>
          ))}

          <div ref={sentinel} aria-hidden className="h-px w-full" />

          <section className="rounded-[2rem] border border-border bg-card p-8 text-center md:p-10">
            <Compass className="mx-auto h-6 w-6 text-[color:var(--gold)]" />
            <p className="mt-4 text-lg font-semibold">Keep walking, or take a turn somewhere else.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              The community keeps going. These doors are open too.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {CAUGHT_UP_ACTIONS.map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="rounded-full border border-border px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground"
                >
                  {a.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={loadMore}
                className="rounded-full border border-[color:var(--gold)] px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)] transition hover:bg-[color:var(--gold)] hover:text-[color:var(--primary-foreground)]"
              >
                Show me more
              </button>
            </div>
            <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              The goal is to make you feel connected — not to consume your day.
            </p>
          </section>

          <PageFeedback pageTitle="For Us" />
        </div>
      </div>
    </SiteShell>
  );
}
