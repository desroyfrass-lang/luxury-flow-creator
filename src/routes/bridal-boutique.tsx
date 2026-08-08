import { createFileRoute, Link } from "@tanstack/react-router";
import { GatewayNav } from "@/components/gateway-nav";
import {
  BOUTIQUE_PRINCIPLE,
  BOUTIQUE_VS_DISTRICT,
  BOUTIQUE_WELCOME,
  UNIFIED_COMMERCE,
} from "@/lib/bridal";
import gallery from "@/assets/bridal-reception-gallery.jpg";
import couple1 from "@/assets/bridal-couple-1.jpg";
import couple2 from "@/assets/bridal-couple-2.jpg";
import couple3 from "@/assets/bridal-couple-3.jpg";
import couple4 from "@/assets/bridal-couple-4.jpg";

export const Route = createFileRoute("/bridal-boutique")({
  head: () => ({
    meta: [
      { title: "Frass Bridal Boutique — Frass District" },
      {
        name: "description",
        content:
          "The bridal storefront on the Frass District promenade. A reception gallery, not a catalog — then a garden walk to the Bridal Estate where the planning begins.",
      },
      { property: "og:title", content: "Frass Bridal Boutique — Frass District" },
      {
        property: "og:description",
        content: "Where the dream is introduced. Love celebrated across cultures, in Frass editorial style.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BridalBoutique,
});

const COUPLES = [
  { src: couple1, alt: "A Black groom in a cream tuxedo laughing with an Indian bride in a red and gold lehenga", caption: "Two traditions, one ceremony" },
  { src: couple2, alt: "A Black bride in an ivory silk gown holding hands with a White groom in a navy suit", caption: "A courtyard at golden hour" },
  { src: couple3, alt: "Two Black partners in ivory and champagne wedding attire embracing on a Caribbean terrace", caption: "Home, and the sea behind them" },
  { src: couple4, alt: "An East Asian bride and a Hispanic groom dancing under string lights in a garden courtyard", caption: "The first dance, under lights" },
];

function BridalBoutique() {
  return (
    <div className="min-h-screen bg-[oklch(0.15_0.008_80)] text-[oklch(0.96_0.01_80)]">
      <GatewayNav mode="shop" />

      <section className="relative h-[70vh] min-h-[440px] w-full overflow-hidden">
        <img
          src={gallery}
          alt="The Frass Bridal reception gallery — marble floors, tall windows, enormous fresh flower arrangements and framed wedding photography"
          width={1280}
          height={960}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.15_0.008_80)] via-[oklch(0.15_0.008_80)]/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-6 pb-12 lg:px-10">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--hill-gold)]">
            Frass District · the promenade
          </span>
          <h1 className="mt-4 font-display text-4xl uppercase leading-[0.95] md:text-6xl">
            Frass Bridal Boutique
          </h1>
          <p className="mt-5 max-w-xl font-display text-xl leading-snug md:text-2xl">
            {BOUTIQUE_WELCOME[0]}
          </p>
          <p className="mt-2 max-w-xl text-sm text-[oklch(0.86_0.01_80)]">{BOUTIQUE_WELCOME[1]}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--hill-gold)]">
          The reception gallery
        </div>
        <h2 className="mt-3 font-display text-2xl uppercase md:text-3xl">
          We don't open with dresses. We open with people.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-[oklch(0.8_0.01_80)]">
          Soft music, fresh flowers, elegant light. Sit a moment. Every wedding here belongs to
          someone — and love looks different in every culture we serve.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COUPLES.map((c) => (
            <figure
              key={c.caption}
              className="group overflow-hidden rounded-[1.5rem] border border-white/12 bg-white/[0.02]"
            >
              <div className="overflow-hidden">
                <img
                  src={c.src}
                  alt={c.alt}
                  loading="lazy"
                  width={960}
                  height={1200}
                  className="h-[380px] w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                />
              </div>
              <figcaption className="px-4 py-3 text-xs text-[oklch(0.78_0.01_80)]">
                {c.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-12 lg:px-10">
        <div className="rounded-[1.75rem] border border-[color:var(--hill-gold)]/25 bg-white/[0.03] p-7">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--hill-gold)]">
            Two places, one experience
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {BOUTIQUE_VS_DISTRICT.map((r) => (
              <div key={r.boutique} className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                <span className="text-[oklch(0.86_0.01_80)]">{r.boutique}</span>
                <span className="mx-2 text-[color:var(--hill-gold)]">·</span>
                <span className="text-[oklch(0.7_0.01_80)]">{r.district}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 border-l-2 border-[color:var(--hill-gold)] pl-4 text-sm italic text-[oklch(0.82_0.01_80)]">
            {BOUTIQUE_PRINCIPLE}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-16 lg:px-10">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--hill-gold)]">
          Whichever door you came through
        </div>
        <p className="mt-3 max-w-2xl text-sm text-[oklch(0.8_0.01_80)]">
          Boutique or district, you reach the same ecosystem. Nothing here is a separate account or
          a separate cart.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {UNIFIED_COMMERCE.map((u) => (
            <span key={u} className="rounded-full border border-white/15 px-3 py-1 text-xs">
              {u}
            </span>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/bridal/walk"
            className="rounded-full bg-[color:var(--hill-gold)] px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.24em] text-black transition hover:scale-[1.03]"
          >
            Walk to the Bridal Estate
          </Link>
          <Link
            to="/frass-district"
            className="rounded-full border border-white/25 px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.24em] transition hover:bg-white/10"
          >
            Back to the promenade
          </Link>
        </div>
      </section>
    </div>
  );
}
