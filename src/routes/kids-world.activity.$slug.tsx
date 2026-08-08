import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { PageFeedback } from "@/components/page-feedback";
import { ActivityPlayer } from "@/components/content/activity-player";
import { ActivityCard } from "@/components/content/activity-card";
import { usePublishedActivity, usePublishedActivities } from "@/hooks/use-activities";
import { useKidsProgress } from "@/lib/kids-progress";
import { KIDS_WORLDS } from "@/lib/kids-world";
import { useKidsPassport } from "@/lib/kids-passport";
import { useEffect } from "react";

const TITLE = "Activity — FRASS Kids World";
const DESCRIPTION =
  "A Kids World activity: watch, listen, read, make something and talk about it — at your own pace.";

export const Route = createFileRoute("/kids-world/activity/$slug")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const { slug } = Route.useParams();
  const { data: activity, isLoading } = usePublishedActivity(slug);
  const { start } = useKidsProgress();
  const { canVisit } = useKidsPassport();
  const world = KIDS_WORLDS.find((w) => w.slug === activity?.age_group);
  const accent = world?.accent ?? "var(--gold)";

  const { data: related = [] } = usePublishedActivities({
    ageGroup: activity?.age_group,
    placeSlug: activity?.place_slug ?? undefined,
  });

  useEffect(() => {
    if (activity) start(activity.slug);
  }, [activity, start]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-28 text-center text-sm text-muted-foreground">
        Opening the activity…
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl uppercase">This activity isn&rsquo;t published yet</h1>
        <Link
          to="/kids-world"
          className="mt-7 inline-block rounded-full bg-[color:var(--gold)] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.26em] text-background"
        >
          Back to Kids World
        </Link>
      </div>
    );
  }

  if (!canVisit(activity.age_group)) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl uppercase">Different passport needed</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This activity belongs to another age group. A grown-up can change the passport.
        </p>
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
      {activity.hero_image && (
        <section className="relative h-[42vh] min-h-[280px] w-full overflow-hidden">
          <img src={activity.hero_image} alt={activity.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </section>
      )}

      <PageHeader
        eyebrow={`Kids World${world ? ` · Ages ${world.ageLabel}` : ""} · ${activity.duration_minutes} min`}
        title={activity.title}
        description={activity.description ?? undefined}
        crumbs={[
          { label: "Kids World", to: "/kids-world" },
          ...(world ? [{ label: `Ages ${world.ageLabel}`, to: `/kids-world/${world.slug}` }] : []),
          { label: activity.title },
        ]}
      />

      <section className="mx-auto max-w-[1600px] px-6 pb-20 lg:px-12">
        <ActivityPlayer activity={activity} accent={accent} />
      </section>

      {related.filter((r) => r.slug !== activity.slug).length > 0 && (
        <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12">
          <h2 className="font-display text-2xl uppercase md:text-3xl">What&rsquo;s next door</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related
              .filter((r) => r.slug !== activity.slug)
              .slice(0, 4)
              .map((r) => (
                <ActivityCard key={r.id} activity={r} accent={accent} />
              ))}
          </div>
        </section>
      )}

      <PageFeedback pageTitle={`Kids World — ${activity.title}`} />
    </>
  );
}
