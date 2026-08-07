import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { PageFeedback } from "@/components/page-feedback";
import { getKidsPlace } from "@/lib/kids-world";
import { useKidsPassport } from "@/lib/kids-passport";

export const Route = createFileRoute("/kids-world/$age/$place")({
  beforeLoad: ({ params }) => {
    const found = getKidsPlace(params.age, params.place);
    if (!found?.place) throw notFound();
  },
  head: ({ params }) => {
    const found = getKidsPlace(params.age, params.place);
    const title = `${found?.place?.title ?? "Kids World"} — FRASS Kids World`;
    const description = found?.place?.blurb ?? "A place to explore inside Frass Kids World.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <PageHeader title="That place isn't here" crumbs={[{ label: "Kids World", to: "/kids-world" }]} />
  ),
  component: PlacePage,
});

function PlacePage() {
  const { age, place } = Route.useParams();
  const found = getKidsPlace(age, place);
  const { canVisit } = useKidsPassport();
  if (!found?.place) return null;
  const { world, place: spot } = found;

  if (!canVisit(age)) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl uppercase">Different passport needed</h1>
        <Link
          to="/kids-world/parents"
          className="mt-7 inline-block rounded-full bg-[color:var(--gold)] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.26em] text-background"
        >
          Parent Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`Kids World · ${world.title} · Ages ${world.ageLabel}`}
        title={`${spot.emoji} ${spot.title}`}
        description={spot.blurb}
        crumbs={[
          { label: "Kids World", to: "/kids-world" },
          { label: `Ages ${world.ageLabel}`, to: `/kids-world/${world.slug}` },
          { label: spot.title },
        ]}
      />

      <section className="mx-auto max-w-[1600px] px-6 pb-16 lg:px-12">
        <p className="text-[10px] uppercase tracking-[0.38em]" style={{ color: world.accent }}>
          Things to try — no order, no scores
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {spot.invites.map((invite) => (
            <article
              key={invite}
              className="rounded-[1.5rem] border border-border bg-card p-6"
              style={{ boxShadow: `0 24px 60px -55px ${world.accent}` }}
            >
              <span className="block h-1 w-10 rounded-full" style={{ background: world.accent }} />
              <h2 className="mt-4 font-display text-xl uppercase leading-tight">{invite}</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Take as long as you like. Come back whenever you want.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12">
        <div className="rounded-[2rem] border border-[color:var(--gold)]/25 bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] p-8">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[color:var(--gold)]">
            A small kindness
          </p>
          <p className="mt-4 max-w-2xl font-script text-xl italic text-[color:var(--gold)] md:text-2xl">
            {spot.kindness}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/kids-world/$age"
            params={{ age: world.slug }}
            className="rounded-full border border-border px-7 py-3 text-[11px] font-bold uppercase tracking-[0.26em]"
          >
            ← Back to {world.title}
          </Link>
          <Link
            to="/frass-kids"
            className="rounded-full border border-[color:var(--gold)]/50 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.26em] text-[color:var(--gold)]"
          >
            🛍 Shop Kids
          </Link>
        </div>
      </section>

      <PageFeedback pageTitle={`Kids World — ${spot.title}`} />
    </>
  );
}
