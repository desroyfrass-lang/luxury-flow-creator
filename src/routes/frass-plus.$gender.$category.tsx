import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { ShowroomRack } from "@/components/showroom-rack";
import { ShowroomScene } from "@/components/showroom-scene";
import { PageFeedback } from "@/components/page-feedback";
import { PlusBadge } from "@/components/plus-badge";
import { getShowroomTheme } from "@/lib/showroom-themes";
import {
  MEN_EDITORIAL,
  WOMEN_EDITORIAL,
  getPlusDepartment,
  isPlusGender,
  plusName,
} from "@/lib/frass-plus";

export const Route = createFileRoute("/frass-plus/$gender/$category")({
  beforeLoad: ({ params }) => {
    if (!isPlusGender(params.gender)) throw notFound();
    if (!getPlusDepartment(params.gender, params.category)) throw notFound();
  },
  head: ({ params }) => {
    if (!isPlusGender(params.gender)) return { meta: [{ title: "Frass Plus" }] };
    const dept = getPlusDepartment(params.gender, params.category);
    const label = params.gender === "men" ? "Men's" : "Women's";
    const title = `${label} ${plusName(dept?.title ?? "Collection")} — Frass Plus`;
    const description = dept?.tagline ?? "The same Frass collections, extended sizing.";
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
    <SiteShell>
      <PageHeader
        title="Department not found"
        crumbs={[{ label: "Frass Plus", to: "/frass-plus" }]}
      />
    </SiteShell>
  ),
  component: DepartmentPage,
});

function DepartmentPage() {
  const { gender, category } = Route.useParams();
  if (!isPlusGender(gender)) return null;
  const dept = getPlusDepartment(gender, category);
  if (!dept) return null;

  const theme = getShowroomTheme(dept.theme);
  const pool = gender === "men" ? MEN_EDITORIAL : WOMEN_EDITORIAL;
  const label = gender === "men" ? "Men" : "Women";

  const items = dept.subs.map((sub, i) => ({
    handle: sub.handle,
    title: `${sub.title} ${"Plus+"}`,
    image: pool[i % pool.length]!,
  }));

  return (
    <SiteShell>
      <div style={{ background: theme.backdrop }}>
        <PageHeader
          eyebrow={`Frass Plus · ${label} · ${theme.room}`}
          title={plusName(dept.title)}
          description={dept.tagline}
          crumbs={[
            { label: "Frass District", to: "/" },
            { label: "Frass Plus", to: "/frass-plus" },
            { label, to: gender === "men" ? "/frass-plus/men" : "/frass-plus/women" },
            { label: plusName(dept.title) },
          ]}
        />
        <section className="relative mx-auto max-w-[1600px] px-6 pb-24 pt-4 lg:px-12">
          <ShowroomScene theme={theme} />
          <div className="relative mb-4 flex items-center gap-3">
            <PlusBadge size="lg" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-foreground/70">
              Same collection · extended sizing
            </span>
          </div>
          <p className="relative mb-14 max-w-xl text-sm text-foreground/80">{theme.mood}</p>
          <div className="relative">
            <ShowroomRack items={items} theme={theme} eyebrow={plusName(dept.title)} />
          </div>
        </section>
      </div>

      <PageFeedback pageTitle={`Frass Plus — ${plusName(dept.title)}`} />
    </SiteShell>
  );
}
