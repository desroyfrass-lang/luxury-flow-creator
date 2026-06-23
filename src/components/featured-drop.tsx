import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { LOOKBOOK_STORIES } from "@/lib/lookbook";
import { useSiteImageUrl } from "@/hooks/use-site-images";

const ROTATE_MS = 6000;

export function FeaturedDrop() {
  const stories = LOOKBOOK_STORIES;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => {
      setI((n) => (n + 1) % stories.length);
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [paused, stories.length]);

  const story = stories[i];

  return (
    <section
      className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-6 flex items-end justify-between gap-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            <span className="h-px w-8 bg-[color:var(--gold)]" />
            Featured Drop
          </div>
          <h2 className="font-display text-4xl md:text-6xl leading-[0.95] text-foreground">
            Now showing.
          </h2>
        </div>
        <Link
          to="/lookbook"
          className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] hover:text-[color:var(--gold)] transition"
        >
          All volumes <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-border/60 lux-card">
        <div className="relative h-[64vh] min-h-[480px] w-full">
          {stories.map((s, idx) => (
            <img
              key={s.slug}
              src={s.cover}
              alt={s.title}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                idx === i ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.07_0.005_80_/_0.88)_0%,oklch(0.07_0.005_80_/_0.55)_50%,transparent_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,oklch(0.07_0.005_80_/_0.7)_100%)]" />

          <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-12 lg:p-16">
            <div className="text-xs md:text-sm uppercase tracking-[0.32em] text-[color:var(--gold)]">
              {story.kicker}
            </div>

            <div className="max-w-2xl">
              <h3 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.9] text-foreground">
                {story.title}
              </h3>
              <p className="mt-4 font-script text-2xl md:text-3xl text-foreground/85">
                {story.tagline}
              </p>
              <p className="mt-5 max-w-lg text-sm md:text-base text-foreground/75">
                {story.intro}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/lookbook/$story"
                  params={{ story: story.slug }}
                  className="lux-press inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] transition hover:bg-[color:var(--gold-soft)]"
                >
                  Enter the story <ArrowUpRight className="h-4 w-4" />
                </Link>
                {story.shop[0] && (
                  <Link
                    to="/collection/$handle"
                    params={{ handle: story.shop[0].handle }}
                    className="lux-press inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background/35 px-7 py-3.5 text-xs uppercase tracking-[0.28em] text-foreground backdrop-blur transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
                  >
                    Shop {story.shop[0].title}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border/60 bg-background/70 px-6 py-4 backdrop-blur overflow-x-auto no-scrollbar">
          {stories.map((s, idx) => (
            <button
              key={s.slug}
              onClick={() => setI(idx)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-[0.28em] transition ${
                idx === i
                  ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              }`}
              aria-label={`Show ${s.title}`}
            >
              {s.kicker.split("·")[0].trim()}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
