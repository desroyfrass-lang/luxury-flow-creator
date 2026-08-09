import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import {
  BUILDER_PATHS,
  COLLEGES,
  DISTRICT_LABELS,
  DISTRICT_ROUTES,
  pathById,
  pathMinutes,
  recommendPaths,
  type BuilderPath,
  type Lesson,
} from "@/lib/academy";
import {
  getAcademyDashboard,
  startPath,
  setPrimaryPath,
  toggleLesson,
  saveReflection,
  recordArtifact,
  type PathProgress,
  type LearningEvent,
} from "@/lib/academy.functions";

export const Route = createFileRoute("/_authenticated/academy")({
  head: () => ({
    meta: [
      { title: "Academy District — Frass Operating System" },
      {
        name: "description",
        content:
          "Your lifelong Builder campus: Builder Paths, a mentor who remembers, and a timeline of everything you've become.",
      },
      { property: "og:title", content: "Academy District — Frass Operating System" },
      {
        property: "og:description",
        content: "Builder Paths that turn learning into finished work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AcademyPage,
});

const goldButton =
  "lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)] disabled:opacity-60";
const ghostButton =
  "lux-press rounded-sm border border-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)] disabled:opacity-60";

function AcademyPage() {
  const load = useServerFn(getAcademyDashboard);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["academy"], queryFn: () => load() });
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [college, setCollege] = useState<string>("all");

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["academy"] });
  };

  const progressByPath = useMemo(() => {
    const map: Record<string, PathProgress> = {};
    for (const p of data?.progress ?? []) map[p.path_id] = p;
    return map;
  }, [data]);

  const primary = useMemo(
    () => (data?.progress ?? []).find((p) => p.is_primary && !p.completed_at)
      ?? (data?.progress ?? []).find((p) => !p.completed_at),
    [data],
  );

  const recommended = useMemo(() => {
    const started = (data?.progress ?? []).map((p) => p.path_id);
    return recommendPaths(data?.signalText ?? "", started).filter((r) => r.score > -1)[0]?.path;
  }, [data]);

  const skills = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of data?.timeline ?? []) {
      for (const s of e.skills ?? []) counts[s] = (counts[s] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [data]);

  const nextLesson = useMemo(() => {
    if (!primary) return null;
    const path = pathById(primary.path_id);
    if (!path) return null;
    const lesson = path.lessons.find((l) => !primary.completed_lessons.includes(l.id));
    return lesson ? { path, lesson } : null;
  }, [primary]);

  const paths = BUILDER_PATHS.filter((p) => college === "all" || p.college === college);
  const certificates = (data?.timeline ?? []).filter((e) => e.kind === "certificate");

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="text-center">
          <div className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            Academy District
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            This is where Builders become.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Not a course library. A campus. Every path here is a set of real tasks that leave
            something behind — a product, a document, a workflow, a portfolio piece.
          </p>
        </header>

        {isLoading && (
          <p className="mt-12 text-center text-sm text-muted-foreground">Opening the campus…</p>
        )}

        {data && (
          <>
            {/* Learning dashboard */}
            <section className="mt-12 rounded-3xl border border-[color:var(--gold)]/40 bg-background/60 p-6 backdrop-blur md:p-8">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                Frassy · your mentor
              </div>

              {nextLesson ? (
                <>
                  <h2 className="mt-3 font-display text-2xl md:text-3xl">
                    Next for you: {nextLesson.lesson.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                    “{nextLesson.lesson.mentor}”
                  </p>
                  <p className="mt-3 max-w-2xl text-sm">{nextLesson.lesson.task}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOpenPath(nextLesson.path.id)}
                      className={goldButton}
                    >
                      Open this lesson
                    </button>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      {nextLesson.path.name} · {nextLesson.lesson.minutes} min
                    </span>
                  </div>
                </>
              ) : recommended ? (
                <>
                  <h2 className="mt-3 font-display text-2xl md:text-3xl">
                    I'd start you on the {recommended.name}.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                    Based on everything you told me so far. {recommended.identity} {recommended.summary}
                  </p>
                  <div className="mt-5">
                    <StartButton path={recommended} onDone={invalidate} label="Begin this path" />
                  </div>
                </>
              ) : (
                <h2 className="mt-3 font-display text-2xl">
                  You've finished everything open to you. Proud of you.
                </h2>
              )}

              <div className="mt-8 grid gap-4 sm:grid-cols-4">
                <Stat label="Current path" value={primary ? pathById(primary.path_id)?.name ?? "—" : "None yet"} small />
                <Stat label="Day streak" value={String(data.streakDays)} />
                <Stat label="Skills developing" value={String(skills.length)} />
                <Stat label="Certificates" value={String(certificates.length)} />
              </div>

              {skills.length > 0 && (
                <div className="mt-6">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Skills developing
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skills.map(([skill, count]) => (
                      <span
                        key={skill}
                        className="rounded-full border border-[color:var(--gold)]/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[color:var(--gold)]"
                      >
                        {skill} · {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.activeProjects.length > 0 && (
                <div className="mt-6">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Learning connects to what you're building
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    {data.activeProjects.map((p) => (
                      <Link
                        key={p.id}
                        to="/creation"
                        className="rounded-full border border-border px-3 py-1 text-xs transition hover:border-[color:var(--gold)]"
                      >
                        {p.title} · {p.status}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Colleges */}
            <div className="mt-12 flex flex-wrap justify-center gap-2">
              {["all", ...COLLEGES].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCollege(c)}
                  className={`rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] transition ${
                    college === c
                      ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                      : "border-border text-muted-foreground hover:border-[color:var(--gold)]"
                  }`}
                >
                  {c === "all" ? "All colleges" : c}
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-5">
              {paths.map((path) => (
                <PathCard
                  key={path.id}
                  path={path}
                  progress={progressByPath[path.id]}
                  recommended={recommended?.id === path.id && !progressByPath[path.id]}
                  open={openPath === path.id}
                  onToggleOpen={() => setOpenPath(openPath === path.id ? null : path.id)}
                  onChange={invalidate}
                />
              ))}
            </div>

            <Timeline events={data.timeline} />
          </>
        )}

        <div className="mt-16 text-center">
          <Link
            to="/builder-hall"
            className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition hover:text-[color:var(--gold)]"
          >
            ← Back to Builder Hall
          </Link>
        </div>

        <PageFeedback pageTitle="Academy District" />
      </div>
    </SiteShell>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-5 text-center backdrop-blur">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div
        className={`mt-2 font-display text-[color:var(--gold)] ${small ? "text-base leading-snug" : "text-2xl"}`}
      >
        {value}
      </div>
    </div>
  );
}

function StartButton({
  path,
  onDone,
  label = "Start this path",
}: {
  path: BuilderPath;
  onDone: () => void;
  label?: string;
}) {
  const begin = useServerFn(startPath);
  const start = useMutation({
    mutationFn: () => begin({ data: { path_id: path.id, path_name: path.name } }),
    onSuccess: () => {
      toast.success(`Welcome to the ${path.name}. Let's build.`);
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <button type="button" disabled={start.isPending} onClick={() => start.mutate()} className={goldButton}>
      {start.isPending ? "Opening…" : label}
    </button>
  );
}

function PathCard({
  path,
  progress,
  recommended,
  open,
  onToggleOpen,
  onChange,
}: {
  path: BuilderPath;
  progress?: PathProgress;
  recommended: boolean;
  open: boolean;
  onToggleOpen: () => void;
  onChange: () => void;
}) {
  const reflect = useServerFn(saveReflection);
  const makePrimary = useServerFn(setPrimaryPath);

  const [reflection, setReflection] = useState(progress?.reflection ?? "");
  const done = progress?.completed_lessons ?? [];
  const pct = Math.round((done.length / path.lessons.length) * 100);

  const saveNote = useMutation({
    mutationFn: () => reflect({ data: { path_id: path.id, reflection } }),
    onSuccess: () => {
      toast.success("Saved. That stays with you.");
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const focus = useMutation({
    mutationFn: () => makePrimary({ data: { path_id: path.id } }),
    onSuccess: () => {
      toast.success(`${path.name} is your focus now.`);
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <article
      className={`rounded-2xl border bg-background/60 p-6 backdrop-blur ${
        progress?.is_primary || recommended ? "border-[color:var(--gold)]/60" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {path.college} · {path.lessons.length} lessons · ~{pathMinutes(path)} min
            {progress?.is_primary && (
              <span className="ml-2 text-[color:var(--gold)]">· Current path</span>
            )}
            {recommended && <span className="ml-2 text-[color:var(--gold)]">· Frassy recommends</span>}
          </div>
          <h2 className="mt-1 font-display text-2xl">{path.name}</h2>
          <p className="mt-1 text-sm text-[color:var(--gold)]">{path.identity}</p>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{path.summary}</p>
          <p className="mt-2 max-w-2xl text-sm">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)]">
              You end with ·{" "}
            </span>
            {path.outcome}
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl text-[color:var(--gold)]">
            {progress ? `${pct}%` : "—"}
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {progress?.completed_at ? "Complete" : progress ? "In progress" : "Not started"}
          </div>
        </div>
      </div>

      {progress && (
        <div className="mt-4 h-px w-full bg-border">
          <div className="h-px bg-[color:var(--gold)] transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!progress ? (
          <StartButton path={path} onDone={onChange} />
        ) : (
          <button type="button" onClick={onToggleOpen} className={ghostButton}>
            {open ? "Close lessons" : "Open lessons"}
          </button>
        )}
        {progress && !progress.is_primary && !progress.completed_at && (
          <button
            type="button"
            disabled={focus.isPending}
            onClick={() => focus.mutate()}
            className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-[color:var(--gold)]"
          >
            Make this my focus
          </button>
        )}
        {!progress && (
          <button
            type="button"
            onClick={onToggleOpen}
            className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-[color:var(--gold)]"
          >
            {open ? "Hide preview" : "Preview lessons"}
          </button>
        )}
      </div>

      {open && (
        <div className="mt-6 grid gap-3">
          {path.lessons.map((lesson, i) => (
            <LessonRow
              key={lesson.id}
              path={path}
              lesson={lesson}
              index={i}
              checked={done.includes(lesson.id)}
              enabled={Boolean(progress)}
              onChange={onChange}
            />
          ))}

          {progress && (
            <div className="mt-2">
              <label className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)]">
                What this path taught you
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
                placeholder="Write it down while it's fresh — Frassy remembers this for next time."
                className="mt-2 w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
              />
              <button
                type="button"
                disabled={saveNote.isPending}
                onClick={() => saveNote.mutate()}
                className="mt-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-[color:var(--gold)]"
              >
                {saveNote.isPending ? "Saving…" : "Save reflection"}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function LessonRow({
  path,
  lesson,
  index,
  checked,
  enabled,
  onChange,
}: {
  path: BuilderPath;
  lesson: Lesson;
  index: number;
  checked: boolean;
  enabled: boolean;
  onChange: () => void;
}) {
  const toggle = useServerFn(toggleLesson);
  const file = useServerFn(recordArtifact);
  const [showFile, setShowFile] = useState(false);
  const [body, setBody] = useState("");

  const tick = useMutation({
    mutationFn: () =>
      toggle({
        data: {
          path_id: path.id,
          path_name: path.name,
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          skill: lesson.skill,
          produces: lesson.produces,
          total_lessons: path.lessons.length,
        },
      }),
    onSuccess: (res) => {
      if (res.justCompleted) toast.success(`Certificate earned — ${path.name}. That's real.`);
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const save = useMutation({
    mutationFn: () =>
      file({
        data: {
          path_id: path.id,
          lesson_id: lesson.id,
          title: `${lesson.title} — ${path.name}`,
          body,
          skill: lesson.skill,
          collection: "Academy",
        },
      }),
    onSuccess: () => {
      toast.success("Filed in your Vault.");
      setBody("");
      setShowFile(false);
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border border-border/70 bg-background/40 p-4">
      <div className="flex items-start gap-4">
        <button
          type="button"
          disabled={!enabled || tick.isPending}
          onClick={() => tick.mutate()}
          aria-label={checked ? "Mark lesson as not done" : "Mark lesson as done"}
          className={`mt-0.5 h-5 w-5 shrink-0 rounded-sm border transition ${
            checked
              ? "border-[color:var(--gold)] bg-[color:var(--gold)]"
              : "border-border hover:border-[color:var(--gold)]"
          } disabled:opacity-40`}
        />
        <div className="min-w-0 flex-1">
          <div className={`text-sm ${checked ? "text-muted-foreground line-through" : ""}`}>
            {index + 1}. {lesson.title}
            <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {lesson.minutes} min · {lesson.skill}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{lesson.task}</p>
          <p className="mt-2 border-l border-[color:var(--gold)]/50 pl-3 text-sm italic text-muted-foreground">
            Frassy: “{lesson.mentor}”
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.2em]">
            <span className="text-[color:var(--gold)]">Produces: {lesson.produces}</span>
            {lesson.district && (
              <Link
                to={DISTRICT_ROUTES[lesson.district]}
                className="text-muted-foreground underline-offset-4 transition hover:text-[color:var(--gold)] hover:underline"
              >
                Open {DISTRICT_LABELS[lesson.district]} →
              </Link>
            )}
            {enabled && (
              <button
                type="button"
                onClick={() => setShowFile(!showFile)}
                className="text-muted-foreground transition hover:text-[color:var(--gold)]"
              >
                {showFile ? "Cancel" : "File the work"}
              </button>
            )}
          </div>

          {showFile && (
            <div className="mt-3">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="Paste or write what you produced. It goes into your Vault and your timeline."
                className="w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
              />
              <button
                type="button"
                disabled={save.isPending}
                onClick={() => save.mutate()}
                className="mt-2 text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)]"
              >
                {save.isPending ? "Filing…" : "Save to Builder Vault"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Timeline({ events }: { events: LearningEvent[] }) {
  if (events.length === 0) return null;
  return (
    <section className="mt-16">
      <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
        Builder Timeline
      </div>
      <h2 className="mt-2 font-display text-2xl">Everything you've become, in order.</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This becomes part of your Builder Passport.
      </p>
      <ol className="mt-6 border-l border-border pl-6">
        {events.map((e) => (
          <li key={e.id} className="relative pb-6">
            <span
              className={`absolute -left-[1.6rem] mt-1.5 h-2 w-2 rounded-full ${
                e.kind === "certificate" ? "bg-[color:var(--gold)]" : "bg-border"
              }`}
            />
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              {new Date(e.created_at).toLocaleDateString()} · {e.kind.replace("_", " ")}
            </div>
            <div className="mt-1 text-sm">{e.title}</div>
            {e.detail && <div className="text-sm text-muted-foreground">{e.detail}</div>}
            {e.skills?.length > 0 && (
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[color:var(--gold)]">
                {e.skills.join(" · ")}
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
