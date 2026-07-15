import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Wand2, ShoppingBag } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { CollectionCard } from "@/components/collection-card";
import { LOOKBOOK_BY_SLUG, LOOKBOOK_STORIES } from "@/lib/lookbook";
import { useSiteImageUrl, useLookbookStoryImages } from "@/hooks/use-site-images";

export const Route = createFileRoute("/lookbook/$story")({
  beforeLoad: ({ params }) => {
    if (!LOOKBOOK_BY_SLUG[params.story]) throw notFound();
  },
  head: ({ params }) => {
    const s = LOOKBOOK_BY_SLUG[params.story];
    if (!s) return { meta: [{ title: "Lookbook — Frass" }] };
    return {
      meta: [
        { title: `${s.title} — Frass Lookbook` },
        { name: "description", content: s.tagline },
        { property: "og:title", content: `${s.title} — Frass Lookbook` },
        { property: "og:description", content: s.tagline },
        { property: "og:image", content: s.cover },
        { name: "twitter:image", content: s.cover },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Lookbook"
        title="Story not found"
        crumbs={[{ label: "Home", to: "/" }, { label: "Lookbook", to: "/lookbook" }]}
      />
    </SiteShell>
  ),
  component: StoryPage,
});

function StoryPage() {
  const { story } = Route.useParams();
  const s = LOOKBOOK_BY_SLUG[story]!;

  const coverSrc = useSiteImageUrl(`lookbook-cover-${story}`, s.cover);
  const { data: overrideImages } = useLookbookStoryImages(story);
  const images =
    overrideImages && overrideImages.length > 0 ? overrideImages.map((i) => i.url) : s.images;

  // index of next story for the "next chapter" link
  const idx = LOOKBOOK_STORIES.findIndex((x) => x.slug === story);
  const next = LOOKBOOK_STORIES[(idx + 1) % LOOKBOOK_STORIES.length];

  return (
    <SiteShell>
      {/* Cinematic cover */}
      <section className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
        <img
          src={coverSrc}
          alt={s.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.07_0.005_80_/_0.35)_0%,oklch(0.07_0.005_80_/_0.55)_55%,oklch(0.07_0.005_80_/_0.95)_100%)]" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-12 pb-16 md:pb-24">
            <nav className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition">Home</Link>
              <span className="opacity-40">/</span>
              <Link to="/lookbook" className="hover:text-foreground transition">Lookbook</Link>
              <span className="opacity-40">/</span>
              <span className="text-foreground">{s.title}</span>
            </nav>
            <div className="mb-4 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
              <span className="h-px w-8 bg-[color:var(--gold)]" />
              {s.kicker}
            </div>
            <h1
              className="font-display uppercase text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-[0.01em] text-[color:var(--gold-soft,#f0d78c)] max-w-5xl"
              style={{
                textShadow:
                  "0 0 24px oklch(0.92 0.12 85 / 0.45), 0 2px 0 oklch(0 0 0 / 0.6)",
              }}
            >
              {s.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg md:text-2xl italic font-script text-foreground/90">
              {s.tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {s.capsuleHandle ? (
                <Link
                  to="/capsules/$handle"
                  params={{ handle: s.capsuleHandle }}
                  className="lux-press inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] transition hover:bg-[color:var(--gold-soft)]"
                >
                  <ShoppingBag className="h-4 w-4" /> Shop the capsule
                </Link>
              ) : (
                <Link
                  to="/capsules"
                  className="lux-press inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] transition hover:bg-[color:var(--gold-soft)]"
                >
                  <ShoppingBag className="h-4 w-4" /> Browse capsules
                </Link>
              )}
              <Link
                to="/capsules"
                className="lux-press inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background/35 px-7 py-3.5 text-xs uppercase tracking-[0.28em] text-foreground backdrop-blur transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
              >
                <Wand2 className="h-4 w-4" /> Try on the look — free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial spread */}
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 pt-24 pb-12">
        <p className="mx-auto max-w-2xl text-center text-base md:text-lg text-muted-foreground">
          {s.intro}
        </p>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 pb-24">
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* hero image */}
          <figure className="col-span-12 md:col-span-8 relative overflow-hidden rounded-2xl bg-card aspect-[16/10]">
            <img src={images[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </figure>
          <figure className="col-span-12 md:col-span-4 relative overflow-hidden rounded-2xl bg-card aspect-[3/4]">
            <img src={images[1] ?? images[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </figure>

          <div className="col-span-12 md:col-span-4 flex items-center">
            <div className="px-2 md:px-4">
              <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]/80">
                Chapter Note
              </div>
              <p className="mt-4 font-script italic text-2xl md:text-3xl text-foreground/90 leading-snug">
                “{s.tagline}”
              </p>
              <div className="mt-6 h-px w-16 bg-[color:var(--gold)]/60" />
            </div>
          </div>
          <figure className="col-span-12 md:col-span-8 relative overflow-hidden rounded-2xl bg-card aspect-[16/9]">
            <img src={images[2] ?? images[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </figure>

          <figure className="col-span-6 md:col-span-6 relative overflow-hidden rounded-2xl bg-card aspect-[4/5]">
            <img src={images[3] ?? images[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </figure>
          <figure className="col-span-6 md:col-span-6 relative overflow-hidden rounded-2xl bg-card aspect-[4/5]">
            <img src={images[4] ?? images[1] ?? images[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </figure>
        </div>
      </section>

      {/* Shop the look */}
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 pb-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]/80">
              Shop the Story
            </div>
            <h2 className="mt-3 font-display uppercase text-4xl md:text-5xl leading-none">
              Wear the Volume.
            </h2>
          </div>
          <Link
            to="/lookbook"
            className="hidden md:inline-flex text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-[color:var(--gold)] transition"
          >
            ← All Volumes
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {s.shop.map((item, i) => (
            <CollectionCard
              key={item.handle}
              to={item.to}
              params={{ handle: item.handle }}
              image={images[i % images.length]}
              eyebrow={s.kicker}
              title={item.title}
              size="md"
              cta="Shop"
            />
          ))}
        </div>
      </section>

      {/* Next chapter */}
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 pb-32">
        <Link
          to="/lookbook/$story"
          params={{ story: next.slug }}
          className="lux-card group relative block overflow-hidden rounded-2xl bg-card aspect-[21/9]"
        >
          <img src={next.cover} alt={next.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.07_0.005_80_/_0.75)_0%,oklch(0.07_0.005_80_/_0.35)_60%,oklch(0.07_0.005_80_/_0.75)_100%)]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
            <div className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)] mb-3">
              Next Volume
            </div>
            <h3
              className="font-display uppercase text-4xl md:text-6xl text-[color:var(--gold-soft,#f0d78c)]"
              style={{ textShadow: "0 2px 0 oklch(0 0 0 / 0.6)" }}
            >
              {next.title}
            </h3>
            <p className="mt-3 font-script italic text-base md:text-lg text-foreground/85">
              {next.tagline}
            </p>
          </div>
        </Link>
      </section>
    </SiteShell>
  );
}
