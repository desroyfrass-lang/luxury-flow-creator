import { useMemo, useState } from "react";
import type { LearningActivity } from "@/lib/content-engine";
import { playerSections } from "@/lib/content-engine";
import { useKidsProgress } from "@/lib/kids-progress";

type TabKey = "watch" | "listen" | "read" | "slides" | "do" | "questions" | "quiz" | "downloads";

const TAB_LABEL: Record<TabKey, string> = {
  watch: "▶ Watch",
  listen: "🎧 Listen",
  read: "📖 Read",
  slides: "🖼 Slides",
  do: "🖐 Make it",
  questions: "💬 Talk about it",
  quiz: "🧩 Play",
  downloads: "⬇ Print & colour",
};

function isEmbeddable(url: string) {
  return /youtube\.com|youtu\.be|vimeo\.com|player\./i.test(url);
}

export function ActivityPlayer({
  activity,
  accent = "var(--gold)",
}: {
  activity: LearningActivity;
  accent?: string;
}) {
  const sections = playerSections(activity);
  const { complete, isComplete, toggleSaved, isSaved } = useKidsProgress();
  const [grownUp, setGrownUp] = useState(false);
  const [slide, setSlide] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [celebrated, setCelebrated] = useState(false);

  const tabs = useMemo(() => {
    const t: TabKey[] = [];
    if (sections.video) t.push("watch");
    if (sections.audio) t.push("listen");
    if (sections.read) t.push("read");
    if (sections.slides) t.push("slides");
    if (sections.steps) t.push("do");
    if (sections.questions) t.push("questions");
    if (sections.quiz) t.push("quiz");
    if (sections.downloads) t.push("downloads");
    return t;
  }, [sections]);

  const [tab, setTab] = useState<TabKey>(tabs[0] ?? "read");
  const done = isComplete(activity.slug);
  const files = [
    ...activity.worksheets.map((f) => ({ ...f, kind: "Worksheet" })),
    ...activity.coloring_pages.map((f) => ({ ...f, kind: "Colouring page" })),
    ...activity.downloads.map((f) => ({ ...f, kind: "Download" })),
  ];

  function finish() {
    complete(activity.slug, { badge: activity.badge, skills: activity.skills });
    setCelebrated(true);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr]">
      <div>
        {tabs.length > 1 && (
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Activity">
            {tabs.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className="rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition"
                style={{
                  borderColor: tab === t ? accent : "color-mix(in oklab, currentColor 18%, transparent)",
                  color: tab === t ? accent : undefined,
                }}
              >
                {TAB_LABEL[t]}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-[1.75rem] border border-border bg-card p-6 md:p-8">
          {tab === "watch" && activity.video_url && (
            <div className="aspect-video overflow-hidden rounded-2xl bg-black">
              {isEmbeddable(activity.video_url) ? (
                <iframe
                  src={activity.video_url}
                  title={activity.title}
                  allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : (
                <video src={activity.video_url} controls className="h-full w-full" />
              )}
            </div>
          )}

          {tab === "listen" && activity.audio_url && (
            <div>
              <p className="text-sm text-muted-foreground">Press play and listen along.</p>
              <audio src={activity.audio_url} controls className="mt-4 w-full" />
            </div>
          )}

          {tab === "read" && activity.story && (
            <div className="space-y-4 text-[15px] leading-relaxed md:text-lg">
              {activity.story.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          {tab === "slides" && activity.slides.length > 0 && (
            <div>
              <div className="overflow-hidden rounded-2xl border border-border">
                {activity.slides[slide]?.image && (
                  <img
                    src={activity.slides[slide].image}
                    alt={activity.slides[slide].title ?? `Slide ${slide + 1}`}
                    className="max-h-[420px] w-full object-cover"
                  />
                )}
                <div className="p-6">
                  {activity.slides[slide]?.title && (
                    <h3 className="font-display text-2xl uppercase">{activity.slides[slide].title}</h3>
                  )}
                  {activity.slides[slide]?.body && (
                    <p className="mt-3 text-sm text-muted-foreground">{activity.slides[slide].body}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSlide((s) => Math.max(0, s - 1))}
                  disabled={slide === 0}
                  className="rounded-full border border-border px-5 py-2 text-[10px] uppercase tracking-[0.2em] disabled:opacity-40"
                >
                  ← Back
                </button>
                <span className="text-xs text-muted-foreground">
                  {slide + 1} of {activity.slides.length}
                </span>
                <button
                  type="button"
                  onClick={() => setSlide((s) => Math.min(activity.slides.length - 1, s + 1))}
                  disabled={slide === activity.slides.length - 1}
                  className="rounded-full border border-border px-5 py-2 text-[10px] uppercase tracking-[0.2em] disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {tab === "do" && (
            <ol className="space-y-4">
              {activity.instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-background"
                    style={{ background: accent }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-[15px] leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          )}

          {tab === "questions" && (
            <div className="space-y-8">
              {activity.discussion_questions.length > 0 && (
                <div>
                  <h3 className="font-display text-xl uppercase">Talk about it</h3>
                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    {activity.discussion_questions.map((q, i) => (
                      <li key={i}>· {q}</li>
                    ))}
                  </ul>
                </div>
              )}
              {activity.reflection_questions.length > 0 && (
                <div>
                  <h3 className="font-display text-xl uppercase">Think about it</h3>
                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    {activity.reflection_questions.map((q, i) => (
                      <li key={i}>· {q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {tab === "quiz" && (
            <div className="space-y-7">
              <p className="text-sm text-muted-foreground">
                No score, no timer. Pick what you think and see what happens.
              </p>
              {activity.quiz.map((q, qi) => (
                <fieldset key={qi}>
                  <legend className="font-display text-lg uppercase">{q.question}</legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, oi) => {
                      const picked = answers[qi] === oi;
                      const correct = picked && oi === q.answer;
                      return (
                        <button
                          key={oi}
                          type="button"
                          onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                          className="rounded-2xl border px-4 py-3 text-left text-sm transition"
                          style={{
                            borderColor: picked
                              ? correct
                                ? accent
                                : "color-mix(in oklab, currentColor 35%, transparent)"
                              : "color-mix(in oklab, currentColor 15%, transparent)",
                          }}
                        >
                          {opt}
                          {picked && (
                            <span className="ml-2 text-xs">
                              {correct ? "✓ that's it" : "let's try another"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          )}

          {tab === "downloads" && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {files.map((f, i) => (
                <li key={i}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-border px-5 py-4 text-sm transition hover:bg-foreground/5"
                  >
                    <span className="block text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                      {f.kind}
                    </span>
                    <span className="mt-1 block font-semibold">{f.label || "Open file"}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Celebration, never scoring */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={finish}
            className="rounded-full px-7 py-3 text-[11px] font-bold uppercase tracking-[0.26em] text-background"
            style={{ background: accent }}
          >
            {done ? "Explored again 🎉" : "I did it 🎉"}
          </button>
          <button
            type="button"
            onClick={() => toggleSaved(activity.slug)}
            className="rounded-full border border-border px-7 py-3 text-[11px] font-bold uppercase tracking-[0.26em]"
          >
            {isSaved(activity.slug) ? "★ Saved" : "☆ Save for later"}
          </button>
        </div>
        {celebrated && (
          <p className="mt-4 font-script text-xl italic" style={{ color: accent }}>
            {activity.badge?.emoji ?? "🌟"} {activity.badge?.name ?? "Well done"} —{" "}
            {activity.badge?.description ?? "come back whenever you like."}
          </p>
        )}
      </div>

      {/* Grown-up panel */}
      <aside className="space-y-5">
        <div className="rounded-[1.75rem] border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg uppercase">For grown-ups</h3>
            <button
              type="button"
              onClick={() => setGrownUp((g) => !g)}
              className="rounded-full border border-border px-4 py-1.5 text-[10px] uppercase tracking-[0.2em]"
            >
              {grownUp ? "Hide" : "Show"}
            </button>
          </div>
          {grownUp && (
            <div className="mt-5 space-y-5 text-sm text-muted-foreground">
              {activity.learning_objective && (
                <p>
                  <span className="block text-[10px] uppercase tracking-[0.24em] text-foreground">
                    Learning objective
                  </span>
                  {activity.learning_objective}
                </p>
              )}
              {activity.materials.length > 0 && (
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.24em] text-foreground">
                    What you need
                  </span>
                  <ul className="mt-2 space-y-1">
                    {activity.materials.map((m, i) => (
                      <li key={i}>· {m}</li>
                    ))}
                  </ul>
                </div>
              )}
              {activity.parent_guide && (
                <p>
                  <span className="block text-[10px] uppercase tracking-[0.24em] text-foreground">
                    Parent guide
                  </span>
                  {activity.parent_guide}
                </p>
              )}
              {activity.teacher_guide && (
                <p>
                  <span className="block text-[10px] uppercase tracking-[0.24em] text-foreground">
                    Teacher guide
                  </span>
                  {activity.teacher_guide}
                </p>
              )}
            </div>
          )}
        </div>

        {activity.skills.length > 0 && (
          <div className="rounded-[1.75rem] border border-border bg-card p-6">
            <h3 className="font-display text-lg uppercase">Skills touched</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {activity.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em]"
                  style={{ borderColor: accent, color: accent }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
