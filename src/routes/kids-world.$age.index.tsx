import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { PageFeedback } from "@/components/page-feedback";
import { getKidsWorld } from "@/lib/kids-world";
import { useKidsPassport } from "@/lib/kids-passport";

export const Route = createFileRoute("/kids-world/$age/")({
  beforeLoad: ({ params }) => {
    if (!getKidsWorld(params.age)) throw notFound();
  },
  head: ({ params }) => {
    const w = getKidsWorld(params.age);
    const title = `${w?.title ?? "Kids World"} — FRASS Kids World, ages ${w?.ageLabel ?? ""}`;
    const description = w?.tagline ?? "A Caribbean village built for children.";
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
    <PageHeader title="That world isn't here" crumbs={[{ label: "Kids World", to: "/kids-world" }]} />
  ),
  component: AgeWorld,
});

function AgeWorld() {
  const { age } = Route.useParams();
  const world = getKidsWorld(age);
  const { canVisit } = useKidsPassport();
  if (!world) return null;

  if (!canVisit(age)) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <span className="text-4xl" aria-hidden>
          🛂
        </span>
        <h1 className="mt-5 font-display text-4xl uppercase">Different passport needed</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This passport is set to another age group. A grown-up can update it any time.
        </p>
        <Link
          to="/kids-world/parents"
          className="mt-7 inline-block rounded-full bg-[color:var(--gold)] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.26em] text-[color:var(--ink)]"
        >
          Parent Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="relative mx-auto max-w-[1600px] px-2 pt-6 md:px-12">
        <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem]">
          <img
            src={world.image}
            alt={`${world.title} — Kids World for ages ${world.ageLabel}`}
            width={1280}
            height={960}
            className="h-[34vh] w-full object-cover md:h-[46vh]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,color-mix(in_oklab,var(--background)_92%,transparent))]" />
        </div>
      </section>

      <PageHeader
        eyebrow={`Kids World · Ages ${world.ageLabel}`}
        title={world.title}
        description={world.spirit}
        crumbs={[
          { label: "Frass Hill", to: "/frass-hill" },
          { label: "Kids World", to: "/kids-world" },
          { label: `Ages ${world.ageLabel}` },
        ]}
      />

      <section className="mx-auto max-w-[1600px] px-6 pb-20 lg:px-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {world.places.map((p) => (
            <Link
              key={p.slug}
              to="/kids-world/$age/$place"
              params={{ age: world.slug, place: p.slug }}
              className="group rounded-[1.75rem] border border-border bg-card p-6 transition hover:-translate-y-1"
              style={{ boxShadow: `0 26px 70px -55px ${world.accent}` }}
            >
              <span className="text-3xl" aria-hidden>
                {p.emoji}
              </span>
              <h2 className="mt-3 font-display text-2xl uppercase leading-none">{p.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{p.blurb}</p>
              <span
                className="mt-5 inline-block text-[10px] font-bold uppercase tracking-[0.24em]"
                style={{ color: world.accent }}
              >
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <PageFeedback pageTitle={`Kids World — ${world.title}`} />
    </>
  );
}
