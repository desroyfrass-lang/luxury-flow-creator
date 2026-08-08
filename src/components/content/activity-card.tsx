import { Link } from "@tanstack/react-router";
import type { LearningActivity } from "@/lib/content-engine";
import { useKidsProgress } from "@/lib/kids-progress";

export function ActivityCard({
  activity,
  accent = "var(--gold)",
}: {
  activity: LearningActivity;
  accent?: string;
}) {
  const { isComplete, isSaved, toggleSaved } = useKidsProgress();
  const done = isComplete(activity.slug);

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-card">
      <Link
        to="/kids-world/activity/$slug"
        params={{ slug: activity.slug }}
        className="block"
        aria-label={activity.title}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-foreground/5">
          {activity.thumbnail || activity.hero_image ? (
            <img
              src={activity.thumbnail || activity.hero_image!}
              alt={activity.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl" aria-hidden>
              {activity.badge?.emoji ?? "🌿"}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/80 to-transparent p-4">
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/80">
              {activity.duration_minutes} min · {activity.difficulty}
            </span>
            {done && (
              <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                ✓ Explored
              </span>
            )}
          </div>
        </div>
        <div className="p-5">
          <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: accent }}>
            {activity.category ?? "Activity"}
          </p>
          <h3 className="mt-2 font-display text-xl uppercase leading-tight">{activity.title}</h3>
          {activity.learning_objective && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {activity.learning_objective}
            </p>
          )}
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggleSaved(activity.slug)}
        className="absolute right-3 top-3 rounded-full bg-background/85 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] backdrop-blur"
      >
        {isSaved(activity.slug) ? "★ Saved" : "☆ Save"}
      </button>
    </article>
  );
}
