import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { StorePortalCard } from "@/components/store-portal-card";
import { PageHeader } from "@/components/page-header";
import cardWomen from "@/assets/card-women.jpg";
import cardBare from "@/assets/card-bare.jpg";
import cardDrip from "@/assets/card-drip.jpg";

const PARENTS = [
  ["work", "Work Drip", "Blouses, blazers & professional sets."],
  ["party", "Party Drip", "Dresses, clubwear & sequin looks."],
  ["casual", "Casual Drip", "Sweats, denim, crop tops & basics."],
  ["street", "Street Drip", "Jackets, cargo & tracksuits."],
  ["vacay", "Vacay Drip", "Beachwear, resort fits & cover-ups."],
  ["sport", "Sport Drip", "Training, studio & active shapewear."],
  ["main-event", "Main Event Drip", "Show-stopping fits for the big night."],
  ["photoshoot", "Photoshoot Drip", "Camera-ready looks built to pop on film."],
  ["crown", "Crown Drip", "Signature drops from the Crown line."],
  ["extra", "Extra Drip", "Overflow drops & seasonal extras."],
] as const;

const IMAGES = [cardWomen, cardBare, cardDrip];

export const Route = createFileRoute("/frass-drip/women/")({
  head: () => ({
    meta: [
      { title: "Women's Frass Drip" },
      { name: "description", content: "Women's fashion — work, party, casual, street, vacay, sport, crown and extra." },
      { property: "og:image", content: cardWomen },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Women"
        title="Women's Frass Drip"
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass District", to: "/frass-district" },
          { label: "Frass Drip", to: "/frass-drip/women" },
          { label: "Frass Drip for Women" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <header className="mx-auto mb-16 mt-8 max-w-2xl text-center md:mt-12">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[color:var(--gold)]">
            The Department Floor
          </p>
          <p className="mt-4 text-sm text-muted-foreground md:text-base">
            Every doorway is a showroom of its own. Step through the one that matches your day.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {PARENTS.map(([slug, title, description], i) => (
            <StorePortalCard
              key={slug}
              to="/frass-drip/women/$category"
              params={{ category: slug }}
              slot={`drip-women-${slug}`}
              image={IMAGES[i % IMAGES.length]}
              eyebrow={`Department ${String(i + 1).padStart(2, "0")}`}
              title={title}
              description={description}
            />
          ))}
        </div>
      </section>
    </SiteShell>
  ),
});
