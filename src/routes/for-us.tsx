import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { ArrowLeft, Sparkles, Heart, Compass } from "lucide-react";
import hallImage from "@/assets/for-us-hall.jpg";
import {
  CAUGHT_UP_ACTIONS,
  orderSections,
  orderStories,
  resolveForUsContext,
  type ForUsStory,
} from "@/lib/for-us";

export const Route = createFileRoute("/for-us")({
  validateSearch: (search: Record<string, unknown>) => ({
    from: typeof search.from === "string" ? search.from : "",
  }),
  head: () => ({
    meta: [
      { title: "For Us — The Community Heart of Frass Hill" },
      {
        name: "description",
        content:
          "For Us is the community hall of Frass Hill: today's stories, good news, creators, learning and celebrations from across the town.",
      },
      { property: "og:title", content: "For Us — The Community Heart of Frass Hill" },
      {
        property: "og:description",
        content: "People before products. Stories before shopping. Community before algorithms.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForUsPage,
});

function StoryCard({ story, large }: { story: ForUsStory; large?: boolean }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-gradient-to-br from-secondary/40 via-background to-background p-7 transition hover:border-[color:var(--gold)]/60 ${
        large ? "md:p-9" : ""
      }`}
    >
      <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">{story.source}</p>
      <h3 className={`mt-3 font-semibold leading-snug ${large ? "text-2xl md:text-3xl" : "text-xl"}`}>
        {story.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story.body}</p>
      {story.to && (
        <Link
          to={story.to}
          className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-foreground underline-offset-4 hover:text-[color:var(--gold)] hover:underline"
        >
          {story.cta ?? "Open"}
          <span aria-hidden>→</span>
        </Link>
      )}
    </article>
  );
}

function ForUsPage() {
  const { from } = Route.useSearch();
  const navigate = useNavigate();
  const context = useMemo(() => resolveForUsContext(from || undefined), [from]);
  const sections = useMemo(() => orderSections(context.priority), [context.priority]);
  const [caughtUp, setCaughtUp] = useState(false);

  const goBack = () => {
    if (from) navigate({ to: from });
    else navigate({ to: "/frass-hill" });
  };

  return (
    <SiteShell>
      {/* Community breadcrumb — where you came from, and the way back */}
      <div className="border-b border-border/50 bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-6 py-3 lg:px-12">
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
        </div>
      </div>

      {/* Arrival — the Community Hall, not a feed */}
      <section className="mx-auto max-w-[1400px] px-6 pt-8 lg:px-12">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60">
          <img
            src={hallImage}
            alt="The Frass Community Hall in Town Square, open windows overlooking the square"
            width={1600}
            height={912}
            className="h-[46vh] min-h-[320px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
          <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
              Town Square · Community Hall
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.12em] md:text-6xl">For Us</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              People before products. Stories before shopping. Community before algorithms. This is what is
              happening across Frass Hill today — and nothing more than today.
            </p>
          </div>
        </div>
      </section>

      {/* Frassy, Community Steward */}
      <section className="mx-auto max-w-[1400px] px-6 pt-8 lg:px-12">
        <div className="flex flex-col gap-3 rounded-[1.75rem] border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--gold)]" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="text-foreground">Frassy, Community Steward:</span> Good to see you.{" "}
              {context.priority.length > 0
                ? `Since you came from ${context.label}, I put those stories nearer the top.`
                : "Here is what the town has been up to."}{" "}
              Nothing here is ranked to keep you scrolling.
            </p>
          </div>
          <Link
            to="/frassy"
            className="shrink-0 rounded-full border border-[color:var(--gold)] px-5 py-2 text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)] transition hover:bg-[color:var(--gold)] hover:text-[color:var(--ink)]"
          >
            Ask Frassy
          </Link>
        </div>
      </section>

      {/* Sections — finite, organised, storytelling-sized */}
      <div className="mx-auto max-w-[1400px] space-y-16 px-6 py-14 lg:px-12">
        {sections.map((section) => {
          const stories = orderStories(section.stories, context.priority);
          const hero = section.id === "today" || section.id === "good_news";
          return (
            <section key={section.id} id={section.id}>
              <header className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h2 className="text-2xl font-bold uppercase tracking-[0.18em] md:text-3xl">
                  <span className="mr-3" aria-hidden>
                    {section.glyph}
                  </span>
                  {section.name}
                </h2>
                <p className="text-xs text-muted-foreground">{section.purpose}</p>
              </header>
              <div
                className={`grid gap-5 ${
                  hero ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {stories.map((story) => (
                  <StoryCard key={story.id} story={story} large={hero} />
                ))}
              </div>
            </section>
          );
        })}

        {/* No endless scroll */}
        <section className="rounded-[2rem] border border-border/60 bg-secondary/30 p-8 text-center md:p-12">
          {!caughtUp ? (
            <button
              type="button"
              onClick={() => setCaughtUp(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)] px-7 py-3 text-[11px] uppercase tracking-[0.28em] text-[color:var(--gold)] transition hover:bg-[color:var(--gold)] hover:text-[color:var(--ink)]"
            >
              <Heart className="h-4 w-4" />
              That's today
            </button>
          ) : (
            <>
              <Compass className="mx-auto h-6 w-6 text-[color:var(--gold)]" />
              <p className="mt-4 text-lg font-semibold">
                You've caught up with today's community highlights.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                For Us is finite on purpose. Here is somewhere worth going next.
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
              </div>
            </>
          )}
          <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            The goal is to enrich your day — not consume it.
          </p>
        </section>

        <PageFeedback pageSlug="for-us" />
      </div>
    </SiteShell>
  );
}
