import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getDesigner, getRegion } from "@/data/afro-designers";
import { FrassyGold } from "@/components/afro/FrassyGold";

export const Route = createFileRoute("/afro-designers/designers/$slug")({
  loader: ({ params }) => {
    const designer = getDesigner(params.slug);
    if (!designer) throw notFound();
    return { designer };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Designer not found — Afro Designers" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const d = loaderData.designer;
    return {
      meta: [
        { title: `${d.name} — Afro Designers | Frass Kicks` },
        { name: "description", content: `${d.name}: ${d.tagline}` },
        { property: "og:title", content: `${d.name} — Afro Designers` },
        { property: "og:description", content: d.tagline },
        { property: "og:image", content: d.image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: d.image },
      ],
    };
  },
  notFoundComponent: DesignerMissing,
  component: DesignerProfile,
});

function DesignerMissing() {
  return (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <FrassyGold className="mx-auto h-16 w-16" />
      <h1 className="afro-serif mt-6 text-4xl text-[color:var(--afro-ink)]">
        This atelier isn't listed yet
      </h1>
      <Link
        to="/afro-designers/designers"
        className="afro-gold-btn mt-8 inline-flex rounded-full px-7 py-3.5 text-xs uppercase tracking-[0.3em] text-white"
      >
        Browse all designers
      </Link>
    </div>
  );
}

function DesignerProfile() {
  const { designer } = Route.useLoaderData();
  const region = getRegion(designer.region);
  return (
    <div>
      <section className="relative">
        <div className="relative h-[70vh] w-full overflow-hidden">
          <img
            src={designer.image}
            alt={designer.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white" />
        </div>
        <div className="relative -mt-32 mx-auto max-w-[1200px] px-6 lg:px-12">
          <div className="afro-card rounded-3xl p-8 md:p-12">
            <Link
              to="/afro-designers/designers"
              className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--afro-ocean-deep)] hover:text-[color:var(--afro-gold)]"
            >
              ← All designers
            </Link>
            <div className="mt-4 flex items-start gap-6">
              <FrassyGold className="h-14 w-14 shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-[0.3em] afro-gold-text">
                  {designer.flag} {designer.country} · {designer.studio}
                </p>
                <h1 className="afro-serif mt-3 text-5xl md:text-6xl leading-[0.98] text-[color:var(--afro-ink)]">
                  {designer.name}
                </h1>
                <p className="afro-serif italic mt-3 text-xl text-[color:var(--afro-ocean-deep)]">
                  {designer.tagline}
                </p>
              </div>
            </div>
            <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.35em] afro-gold-text">
                  Studio story
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[color:var(--afro-ink-soft)]">
                  {designer.story}
                </p>
                <div className="mt-8 h-px afro-gold-hairline" />
                <h2 className="mt-8 text-[11px] uppercase tracking-[0.35em] afro-gold-text">
                  Collection · Coming Soon
                </h2>
                <p className="mt-3 text-sm text-[color:var(--afro-ink-soft)]">
                  Full collection drops live on Frass Kicks. Follow the studio to be
                  first in line for release day.
                </p>
              </div>
              <aside>
                <div className="rounded-2xl border border-[color:var(--afro-chrome)] bg-white/70 p-6 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.35em] afro-gold-text">
                    Region
                  </p>
                  <p className="afro-serif mt-2 text-2xl text-[color:var(--afro-ink)]">
                    {region?.title}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--afro-ink-soft)]">
                    {region?.blurb}
                  </p>
                  {region && (
                    <Link
                      to="/afro-designers/collections/$slug"
                      params={{ slug: region.slug }}
                      className="mt-5 inline-flex text-[11px] uppercase tracking-[0.3em] afro-gold-text"
                    >
                      Explore region →
                    </Link>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
