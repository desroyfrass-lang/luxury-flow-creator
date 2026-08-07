import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { ShowroomRack } from "@/components/showroom-rack";
import { ShowroomScene } from "@/components/showroom-scene";
import { PageFeedback } from "@/components/page-feedback";
import { getShowroomTheme } from "@/lib/showroom-themes";
import {
  MEN_EDITORIAL,
  WOMEN_EDITORIAL,
  getPlusDepartment,
  isPlusGender,
  plusHandle,
} from "@/lib/frass-plus";

export const Route = createFileRoute("/frass-plus/$gender/$category")({
  beforeLoad: ({ params }) => {
    if (!isPlusGender(params.gender)) throw notFound();
    if (!getPlusDepartment(params.gender, params.category)) throw notFound();
  },
  head: ({ params }) => {
    if (!isPlusGender(params.gender)) return { meta: [{ title: "Frass Plus" }] };
    const dept = getPlusDepartment(params.gender, params.category);
    const label = params.gender === "men" ? "Gentlemen" : "Ladies";
    const title = `${dept?.title ?? "Collection"} — Frass Plus ${label}`;
    const description = dept?.tagline ?? "Premium fashion in extended sizing.";
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
  const label = gender === "men" ? "Gentlemen" : "Ladies";

  const items = dept.subs.map(([slug, title], i) => ({
    handle: plusHandle(gender, dept.slug, slug),
    title,
    image: pool[i % pool.length]!,
  }));

  return (
    <SiteShell>
      <div style={{ background: theme.backdrop }}>
        <PageHeader
          eyebrow={`Frass Plus · ${label} · ${theme.room}`}
          title={dept.title}
          description={dept.tagline}
          crumbs={[
            { label: "Frass District", to: "/" },
            { label: "Frass Plus", to: "/frass-plus" },
            { label, to: gender === "men" ? "/frass-plus/men" : "/frass-plus/women" },
            { label: dept.title },
          ]}
        />
        <section className="relative mx-auto max-w-[1600px] px-6 pb-24 pt-4 lg:px-12">
          <ShowroomScene theme={theme} />
          <p className="relative mb-14 max-w-xl text-sm text-foreground/80">{theme.mood}</p>
          <div className="relative">
            <ShowroomRack items={items} theme={theme} eyebrow={dept.title} />
          </div>
        </section>
      </div>

      <PageFeedback pageTitle={`Frass Plus — ${dept.title}`} />
    </SiteShell>
  );
}
