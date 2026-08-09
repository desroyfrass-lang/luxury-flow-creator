import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { ArrowLeft, ChevronDown, Sparkles, Volume2, VolumeX } from "lucide-react";
import arrivalImage from "@/assets/for-us-arrival.jpg";
import sceneShore from "@/assets/for-us-scene-shore.jpg";
import sceneForest from "@/assets/for-us-scene-forest.jpg";
import sceneJerk from "@/assets/for-us-scene-jerk.jpg";
import sceneNight from "@/assets/for-us-scene-night.jpg";
import { usePublishedStories } from "@/hooks/use-for-us-stories";
import { GoLiveButton, LiveBadge } from "@/components/live/live-status";
import { useLiveNow } from "@/hooks/use-live";
import { liveElapsed, purposeOf } from "@/lib/live";
import {
  ambienceEnabled,
  isMuted,
  playArrivalSignature,
  setAmbienceEnabled,
  setMuted,
  signatureDue,
  startAmbience,
  stopAmbience,
} from "@/lib/for-us-ambience";
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
 * FRASS-0418 — For Us is a living Caribbean destination, not a dashboard.
 * The scenery stays behind everything; community stories drift over it. The
 * interface is deliberately faint so the place, not the software, is what you
 * notice. In plain English: this page is the holiday of Frass — everywhere else
 * is where you work.
 */

export const Route = createFileRoute("/for-us")({
  validateSearch: (search: Record<string, unknown>) => ({
    from: typeof search.from === "string" ? search.from : "",
  }),
  head: () => ({
    meta: [
      { title: "For Us — A Living Caribbean Destination" },
      {
        name: "description",
        content:
          "For Us is where Frass goes to breathe: a cinematic Caribbean destination of creator stories, music, live moments, foundation work and community celebration.",
      },
      { property: "og:title", content: "For Us — A Living Caribbean Destination" },
      {
        property: "og:description",
        content: "Not a feed to check. A place to arrive. Stories, music and community over the sea.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForUsPage,
});

const GROUP_SIZE = 5;
const SCENES = [sceneShore, sceneForest, sceneNight, sceneJerk];

/** A story becomes a moment: big picture, small type, no card chrome. */
function Moment({ story, scale, image }: { story: FeedStory; scale: "wide" | "tall" | "quiet"; image?: string }) {
  const body = (
    <>
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/85">
        <span aria-hidden className="mr-1.5">
          {story.sectionGlyph}
        </span>
        {story.sectionName} · {story.source}
      </p>
      <h3
        className={`mt-3 font-semibold leading-[1.1] text-white ${
          scale === "wide" ? "text-3xl md:text-5xl" : scale === "tall" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
        }`}
      >
        {story.title}
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">{story.body}</p>
      {story.to && (
        <span className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
          {story.cta ?? "Open"}
          <span aria-hidden className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      )}
    </>
  );

  const shell = (
    <article
      className={`group relative overflow-hidden rounded-[2rem] transition duration-500 ${
        image ? "min-h-[62vh]" : "bg-black/45"
      } ${scale === "quiet" ? "p-7 md:p-9" : "p-8 md:p-14"} ring-1 ring-white/10 hover:ring-[color:var(--gold)]/40`}
    >
      {image && (
        <>
          <img
            src={image}
            alt=""
            aria-hidden
            loading="lazy"
            width={1600}
            height={912}
            className="hero-drift absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />
        </>
      )}
      <div className={image ? "relative flex min-h-[62vh] flex-col justify-end" : "relative"}>{body}</div>
    </article>
  );

  if (!story.to) return shell;
  return (
    <Link to={story.to} className="block">
      {shell}
    </Link>
  );
}

/** A pause in the walk: pure scenery, one line, nothing to click. */
function ScenicRest({ moment, image }: { moment: ScenicMoment; image: string }) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem]" aria-label="A quiet moment in Frass">
      <img
        src={image}
        alt=""
        aria-hidden
        loading="lazy"
        width={1600}
        height={912}
        className="hero-drift h-[46vh] min-h-[280px] w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
        <span className="text-2xl" aria-hidden>
          {moment.glyph}
        </span>
        <p className="mt-3 max-w-2xl text-balance text-xl font-semibold leading-snug text-white md:text-3xl">
          {moment.line}
        </p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">{moment.detail}</p>
      </div>
    </section>
  );
}

function ForUsPage() {
  const { from } = Route.useSearch();
  const navigate = useNavigate();
  const context = useMemo(() => resolveForUsContext(from || undefined), [from]);
  // Local time differs between server render and the visitor's device, so the
  // weather only settles after hydration — otherwise React sees two skies.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const weather = useMemo(() => resolveForUsWeather(now ?? new Date(2026, 0, 1, 13)), [now]);
  const { data: published = [] } = usePublishedStories();
  const { data: liveNow = [] } = useLiveNow("for_us");

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
      { rootMargin: "800px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [loadMore]);

  /* Audio: a five-second arrival signature, then silence unless asked. */
  const [muted, setMutedState] = useState(true);
  const [ambience, setAmbience] = useState(false);
  const [chimed, setChimed] = useState(false);

  const greeted = useRef(false);

  useEffect(() => {
    setMutedState(isMuted());
    setAmbience(ambienceEnabled());
    if (!signatureDue()) return;
    // Browsers only allow sound after a gesture; the first touch is the door.
    const greet = () => {
      if (greeted.current || !signatureDue()) return;
      greeted.current = true;
      if (playArrivalSignature()) {
        setChimed(true);
        window.setTimeout(() => setChimed(false), 5200);
        if (ambienceEnabled()) window.setTimeout(startAmbience, 5000);
      }
      detach();
    };
    const detach = () => {
      window.removeEventListener("pointerdown", greet);
      window.removeEventListener("keydown", greet);
      window.removeEventListener("scroll", greet);
    };
    window.addEventListener("pointerdown", greet);
    window.addEventListener("keydown", greet);
    window.addEventListener("scroll", greet);
    return () => {
      detach();
      stopAmbience();
    };
  }, []);


  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) {
      setAmbienceEnabled(true);
      setAmbience(true);
    } else {
      setAmbience(false);
      setAmbienceEnabled(false);
    }
  };

  const toggleAmbience = () => {
    const next = !ambience;
    if (next) {
      setMuted(false);
      setMutedState(false);
    }
    setAmbienceEnabled(next);
    setAmbience(next);
  };

  const goBack = () => navigate({ to: from || "/frass-hill" });

  const visible = useMemo(() => {
    if (feed.length === 0) return [];
    const out: { key: string; story: FeedStory; scale: "wide" | "tall" | "quiet"; image?: string }[] = [];
    const total = groups * GROUP_SIZE;
    for (let i = 0; i < total; i += 1) {
      const lap = Math.floor(i / feed.length);
      const story = feed[i % feed.length];
      const slot = i % GROUP_SIZE;
      const scale = slot === 0 ? "wide" : slot === 2 ? "tall" : "quiet";
      const image = slot === 0 || slot === 2 ? SCENES[(i + lap) % SCENES.length] : undefined;
      out.push({ key: `${story.id}-${lap}`, story, scale, image });
    }
    return out;
  }, [feed, groups]);

  const chunks: (typeof visible)[] = [];
  for (let i = 0; i < visible.length; i += GROUP_SIZE) chunks.push(visible.slice(i, i + GROUP_SIZE));

  return (
    <SiteShell>
      <div className="for-us-tropical relative min-h-screen text-white">
        {/* The place itself — always there, never in the way */}
        <div aria-hidden className="fixed inset-0 -z-10">
          <img
            src={arrivalImage}
            alt=""
            width={1920}
            height={1088}
            className="hero-drift h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/55 to-black/85" />
        </div>

        {/* Faint chrome: the way back, the weather, the sound */}
        <div className="sticky top-0 z-20 bg-gradient-to-b from-black/55 to-transparent">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-4 px-6 py-3 lg:px-10">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/85 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {context.label}
            </button>
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/80">
              <span aria-hidden className="mr-1.5">
                {weather.glyph}
              </span>
              {weather.label}
            </span>
            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={!muted}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/70 transition hover:border-[color:var(--gold)] hover:text-white"
              >
                {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                {muted ? "Sound off" : "Sound on"}
              </button>
              <GoLiveButton />
            </div>
          </div>
        </div>

        {/* Arrival */}
        <section className="relative flex min-h-[88vh] items-end px-6 pb-16 lg:px-10">
          <div className="mx-auto w-full max-w-[1200px]">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
              Frass Hill · The Community You Can Walk Into
            </p>
            <h1 className="mt-4 text-5xl font-black uppercase tracking-[0.14em] md:text-8xl">For Us</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85">
              {weather.greeting} Somewhere below there is music, a jerk pan smoking by the road, boats on the
              water and people you know. Take your time — nothing here needs finishing.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.25em] text-white/70">
              <span className="inline-flex items-center gap-2">
                <ChevronDown className="h-4 w-4 animate-bounce" />
                Scroll to walk down
              </span>
              <button
                type="button"
                onClick={toggleAmbience}
                className="underline-offset-4 transition hover:text-white hover:underline"
              >
                {ambience ? "Turn the sea off" : "Let the sea play"}
              </button>
            </div>
          </div>
          {chimed && (
            <div className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-black/60 px-5 py-2 text-[10px] uppercase tracking-[0.25em] text-white/80 backdrop-blur">
              ♪ Welcome to For Us — this place has sound
            </div>
          )}
        </section>

        {/* Live, woven in rather than announced */}
        {liveNow.length > 0 && (
          <section className="mx-auto max-w-[1200px] px-6 pb-4 lg:px-10">
            <div className="flex flex-wrap items-center gap-4 border-y border-white/10 py-4">
              <LiveBadge />
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/70">
                Happening right now in the community
              </span>
              <Link
                to="/live"
                className="ml-auto text-[10px] uppercase tracking-[0.22em] text-white/70 underline-offset-4 hover:text-white hover:underline"
              >
                All live →
              </Link>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-2 pt-5">
              {liveNow.map((b) => (
                <Link
                  key={b.id}
                  to="/live/$broadcastId"
                  params={{ broadcastId: b.id }}
                  className="min-w-[260px] shrink-0 rounded-2xl bg-black/50 p-5 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-red-500/60"
                >
                  <span className="text-[10px] uppercase tracking-[0.22em] text-white/70">
                    {purposeOf(b.purpose).glyph} {purposeOf(b.purpose).label}
                  </span>
                  <p className="mt-2 text-base font-semibold leading-snug">{b.title}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                    {b.host_name} · live {liveElapsed(b.started_at)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Frassy, only as loud as a friend leaning over */}
        <section className="mx-auto max-w-[1200px] px-6 pt-8 lg:px-10">
          <p className="flex flex-wrap items-center gap-2 text-sm leading-relaxed text-white/80">
            <Sparkles className="h-4 w-4 text-[color:var(--gold)]" />
            <span className="text-white/85">Frassy:</span>
            {context.priority.length > 0
              ? `I moved the ${context.label} stories nearer the front for you.`
              : "I think you'll enjoy what the community put out this week."}
            <Link to="/frassy" className="text-[color:var(--gold)] underline-offset-4 hover:underline">
              Ask me anything
            </Link>
          </p>
        </section>

        {/* The walk */}
        <div className="mx-auto max-w-[1200px] space-y-10 px-6 py-12 lg:px-10">
          {chunks.map((chunk, index) => (
            <div key={`group-${index}`} className="space-y-10">
              {chunk.map(({ key, story, scale, image }) => (
                <Moment key={key} story={story} scale={scale} image={image} />
              ))}
              <ScenicRest
                moment={SCENIC_MOMENTS[index % SCENIC_MOMENTS.length]}
                image={SCENES[(index + 1) % SCENES.length]}
              />
            </div>
          ))}

          <div ref={sentinel} aria-hidden className="h-px w-full" />

          {/* Also happening — quiet, one line each, no dashboard */}
          <section className="border-t border-white/10 pt-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/80">Also happening in town</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {exhibits.map((ex) => (
                <li key={ex.id} className="text-sm leading-relaxed text-white/70">
                  <span aria-hidden className="mr-2">
                    {ex.glyph}
                  </span>
                  <span className="text-white/90">{ex.name}</span> — {ex.showing}{" "}
                  {ex.to && (
                    <Link
                      to={ex.to}
                      className="text-[color:var(--gold)] underline-offset-4 hover:underline"
                    >
                      {ex.cta ?? "Open"} →
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="pt-4 text-center">
            <p className="text-lg font-semibold text-white/90">Stay as long as you like.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {CAUGHT_UP_ACTIONS.map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="rounded-full border border-white/20 px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] text-white/85 transition hover:border-[color:var(--gold)] hover:text-white"
                >
                  {a.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={loadMore}
                className="rounded-full border border-[color:var(--gold)] px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)] transition hover:bg-[color:var(--gold)] hover:text-[color:var(--primary-foreground)]"
              >
                Keep walking
              </button>
            </div>
            <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-white/35">
              For Us is not here to take your day — only to make it lighter.
            </p>
          </section>

          <PageFeedback pageTitle="For Us" />
        </div>
      </div>
    </SiteShell>
  );
}
