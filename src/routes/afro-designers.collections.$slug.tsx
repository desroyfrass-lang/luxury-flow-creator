import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { designersByRegion, getRegion, type Designer } from "@/data/afro-designers";
import { DesignerCard } from "@/components/afro/DesignerCard";
import { FrassyGold } from "@/components/afro/FrassyGold";

export const Route = createFileRoute("/afro-designers/collections/$slug")({
  loader: ({ params }) => {
    const region = getRegion(params.slug);
    if (!region) throw notFound();
    return { region, designers: designersByRegion(region.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Collection not found — Afro Designers" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const r = loaderData.region;
    return {
      meta: [
        { title: `${r.title} — Afro Designers | Frass Kicks` },
        { name: "description", content: r.blurb },
        { property: "og:title", content: `${r.title} — Afro Designers` },
        { property: "og:description", content: r.blurb },
      ],
    };
  },
  notFoundComponent: RegionMissing,
  component: RegionPage,
});

function RegionMissing() {
  return (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <FrassyGold className="mx-auto h-16 w-16" />
      <h1 className="afro-serif mt-6 text-4xl text-[color:var(--afro-ink)]">
        Region not found
      </h1>
      <Link
        to="/afro-designers"
        className="afro-gold-btn mt-8 inline-flex rounded-full px-7 py-3.5 text-xs uppercase tracking-[0.3em] text-white"
      >
        Back to Afro Designers
      </Link>
    </div>
  );
}

function RegionPage() {
  const { region, designers } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pt-16 pb-24">
      <Link
        to="/afro-designers"
        className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--afro-ocean-deep)] hover:text-[color:var(--afro-gold)]"
      >
        ← Afro Designers
      </Link>
      <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] afro-gold-text">
            {region.tagline}
          </p>
          <h1 className="afro-serif mt-3 text-5xl md:text-7xl leading-[0.95] text-[color:var(--afro-ink)]">
            {region.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[color:var(--afro-ink-soft)]">
            {region.blurb}
          </p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {region.subcategories.map((s: string) => (
            <li
              key={s}
              className="rounded-full border border-[color:var(--afro-chrome)] bg-white/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-[color:var(--afro-ink-soft)]"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>

      {designers.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-[color:var(--afro-chrome)] bg-white/60 p-16 text-center">
          <FrassyGold className="mx-auto h-14 w-14" />
          <p className="afro-serif mt-6 text-2xl text-[color:var(--afro-ink)]">
            New studios landing soon
          </p>
          <p className="mt-2 text-sm text-[color:var(--afro-ink-soft)]">
            We're onboarding designers for this region. Check back shortly.
          </p>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {designers.map((d: Designer) => (
            <DesignerCard key={d.slug} designer={d} />
          ))}
        </div>
      )}
    </div>
  );
}
