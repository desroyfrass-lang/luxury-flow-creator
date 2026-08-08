import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { PageFeedback } from "@/components/page-feedback";
import { ActivityCard } from "@/components/content/activity-card";
import { usePublishedActivities } from "@/hooks/use-activities";
import { durationBand, DURATION_BANDS } from "@/lib/content-engine";
import { KIDS_WORLDS } from "@/lib/kids-world";
import { useKidsPassport } from "@/lib/kids-passport";
import { useKidsProgress, milestones } from "@/lib/kids-progress";

const TITLE = "Discover Activities — FRASS Kids World";
const DESCRIPTION =
  "Browse every published Kids World activity by age, category and how long it takes. No scores, no ranks — just things worth trying.";

export const Route = createFileRoute("/kids-world/discover")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiscoverPage,
});

function DiscoverPage() {
  const { passport, canVisit } = useKidsPassport();
  const { progress } = useKidsProgress();
  const [age, setAge] = useState<string>(passport?.age ?? "");
  const [category, setCategory] = useState("");
  const [band, setBand] = useState("");

  const { data: all = [], isLoading } = usePublishedActivities({
    district: "kids_world",
    ageGroup: age || undefined,
  });

  const visible = useMemo(
    () =>
      all
        .filter((a) => canVisit(a.age_group))
        .filter((a) => (category ? a.category === category : true))
        .filter((a) => (band ? durationBand(a.duration_minutes) === band : true)),
    [all, canVisit, category, band],
  );

  const categories = useMemo(
    () => Array.from(new Set(all.map((a) => a.category).filter(Boolean))) as string[],
    [all],
  );

  const done = Object.keys(progress.completed).length;

  return (
    <>
      <PageHeader
        eyebrow="Kids World"
        title="Discover"
        description="Everything published in the valley. Pick what looks interesting today."
        crumbs={[{ label: "Kids World", to: "/kids-world" }, { label: "Discover" }]}
      />

      <section className="mx-auto max-w-[1600px] px-6 pb-8 lg:px-12">
        <div className="flex flex-wrap gap-2">
          <FilterPill active={!age} onClick={() => setAge("")} label="All ages" />
          {KIDS_WORLDS.filter((w) => canVisit(w.slug)).map((w) => (
            <FilterPill
              key={w.slug}
              active={age === w.slug}
              onClick={() => setAge(w.slug)}
              label={`${w.emoji} ${w.ageLabel}`}
              accent={w.accent}
            />
          ))}
        </div>
        {categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <FilterPill active={!category} onClick={() => setCategory("")} label="Everything" />
            {categories.map((c) => (
              <FilterPill key={c} active={category === c} onClick={() => setCategory(c)} label={c} />
            ))}
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterPill active={!band} onClick={() => setBand("")} label="Any length" />
          {DURATION_BANDS.map((b) => (
            <FilterPill key={b.key} active={band === b.key} onClick={() => setBand(b.key)} label={b.label} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 pb-16 lg:px-12">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Looking around the valley…</p>
        ) : visible.length === 0 ? (
          <div className="rounded-[1.75rem] border border-border bg-card p-10 text-center">
            <p className="font-display text-2xl uppercase">Nothing published here yet</p>
            <p className="mt-3 text-sm text-muted-foreground">
              New activities appear as soon as they&rsquo;re published. Try another filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-[color:var(--gold)]/20 bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)]">
        <div className="mx-auto max-w-[1600px] px-6 py-14 lg:px-12">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[color:var(--gold)]">
            Your adventures
          </p>
          <h2 className="mt-3 font-display text-3xl uppercase md:text-4xl">
            {done === 0 ? "Nothing explored yet — that's fine" : `${done} explored so far`}
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {milestones(progress).map((m) => (
              <span
                key={m.label}
                className="rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.2em]"
                style={{
                  borderColor: m.reached ? "var(--gold)" : undefined,
                  color: m.reached ? "var(--gold)" : undefined,
                  opacity: m.reached ? 1 : 0.45,
                }}
              >
                {m.reached ? "★" : "☆"} {m.label}
              </span>
            ))}
          </div>
          {progress.badges.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {progress.badges.map((b) => (
                <span
                  key={b.slug}
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-sm"
                  title={new Date(b.at).toLocaleDateString()}
                >
                  {b.emoji} {b.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <PageFeedback pageTitle="Kids World — Discover" />
    </>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  accent = "var(--gold)",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition"
      style={{
        borderColor: active ? accent : "color-mix(in oklab, currentColor 18%, transparent)",
        color: active ? accent : undefined,
      }}
    >
      {label}
    </button>
  );
}
