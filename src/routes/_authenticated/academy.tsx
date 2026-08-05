import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { BUILDER_PATHS, COLLEGES, pathMinutes, type BuilderPath } from "@/lib/academy";
import {
  listPathProgress,
  startPath,
  toggleLesson,
  saveReflection,
  type PathProgress,
} from "@/lib/academy.functions";

export const Route = createFileRoute("/_authenticated/academy")({
  head: () => ({
    meta: [
      { title: "Academy District — Frass Operating System" },
      {
        name: "description",
        content:
          "Builder Paths that teach you by building — real tasks, real outcomes, tracked as you go.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AcademyPage,
});

const goldButton =
  "lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)] disabled:opacity-60";

function AcademyPage() {
  const load = useServerFn(listPathProgress);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["academy"], queryFn: () => load() });
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [college, setCollege] = useState<string>("all");

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["academy"] });
  };

  const progressByPath = useMemo(() => {
    const map: Record<string, PathProgress> = {};
    for (const p of data ?? []) map[p.path_id] = p;
    return map;
  }, [data]);

  const totals = useMemo(() => {
    const rows = data ?? [];
    const done = rows.filter((r) => r.completed_at).length;
    const lessons = rows.reduce((s, r) => s + (r.completed_lessons?.length ?? 0), 0);
    return { started: rows.length, done, lessons };
  }, [data]);

  const paths = BUILDER_PATHS.filter((p) => college === "all" || p.college === college);

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="text-center">
          <div className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            Academy District
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            You learn it by building it.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            No lectures. Every Builder Path is a short list of real tasks that leave you with
            something finished. Check them off as you go.
          </p>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <Stat label="Paths started" value={String(totals.started)} />
          <Stat label="Paths finished" value={String(totals.done)} />
          <Stat label="Tasks completed" value={String(totals.lessons)} />
        </section>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
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

        {isLoading && (
          <p className="mt-10 text-center text-sm text-muted-foreground">Opening the Academy…</p>
        )}

        <div className="mt-8 grid gap-5">
          {paths.map((path) => (
            <PathCard
              key={path.id}
              path={path}
              progress={progressByPath[path.id]}
              open={openPath === path.id}
              onToggleOpen={() => setOpenPath(openPath === path.id ? null : path.id)}
              onChange={invalidate}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/welcome-hall"
            className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition hover:text-[color:var(--gold)]"
          >
            ← Back to Welcome Hall
          </Link>
        </div>

        <PageFeedback pageTitle="Academy District" />
      </div>
    </SiteShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-5 text-center backdrop-blur">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl text-[color:var(--gold)]">{value}</div>
    </div>
  );
}

function PathCard({
  path,
  progress,
  open,
  onToggleOpen,
  onChange,
}: {
  path: BuilderPath;
  progress?: PathProgress;
  open: boolean;
  onToggleOpen: () => void;
  onChange: () => void;
}) {
  const begin = useServerFn(startPath);
  const toggle = useServerFn(toggleLesson);
  const reflect = useServerFn(saveReflection);

  const [reflection, setReflection] = useState(progress?.reflection ?? "");
  const done = progress?.completed_lessons ?? [];
  const pct = Math.round((done.length / path.lessons.length) * 100);

  const start = useMutation({
    mutationFn: () => begin({ data: { path_id: path.id } }),
    onSuccess: () => {
      toast.success(`Started: ${path.name}`);
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const tick = useMutation({
    mutationFn: (lessonId: string) =>
      toggle({
        data: { path_id: path.id, lesson_id: lessonId, total_lessons: path.lessons.length },
      }),
    onSuccess: (res) => {
      if (res.completed_at) toast.success(`Path complete: ${path.name}`);
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveNote = useMutation({
    mutationFn: () => reflect({ data: { path_id: path.id, reflection } }),
    onSuccess: () => {
      toast.success("Notes saved.");
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <article className="rounded-2xl border border-border bg-background/60 p-6 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {path.college} · {path.lessons.length} tasks · ~{pathMinutes(path)} min
          </div>
          <h2 className="mt-1 font-display text-2xl">{path.name}</h2>
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
          <div
            className="h-px bg-[color:var(--gold)] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {!progress ? (
          <button
            type="button"
            disabled={start.isPending}
            onClick={() => {
              start.mutate();
              if (!open) onToggleOpen();
            }}
            className={goldButton}
          >
            {start.isPending ? "Starting…" : "Start this path"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleOpen}
            className="lux-press rounded-sm border border-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)]"
          >
            {open ? "Hide tasks" : "Open tasks"}
          </button>
        )}
        {!progress && (
          <button
            type="button"
            onClick={onToggleOpen}
            className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-[color:var(--gold)]"
          >
            {open ? "Hide preview" : "Preview tasks"}
          </button>
        )}
      </div>

      {open && (
        <div className="mt-6 grid gap-3">
          {path.lessons.map((lesson, i) => {
            const checked = done.includes(lesson.id);
            return (
              <div
                key={lesson.id}
                className="flex items-start gap-4 rounded-xl border border-border/70 bg-background/40 p-4"
              >
                <button
                  type="button"
                  disabled={!progress || tick.isPending}
                  onClick={() => tick.mutate(lesson.id)}
                  aria-label={checked ? "Mark task as not done" : "Mark task as done"}
                  className={`mt-0.5 h-5 w-5 shrink-0 rounded-sm border transition ${
                    checked
                      ? "border-[color:var(--gold)] bg-[color:var(--gold)]"
                      : "border-border hover:border-[color:var(--gold)]"
                  } disabled:opacity-40`}
                />
                <div className="min-w-0">
                  <div
                    className={`text-sm ${checked ? "text-muted-foreground line-through" : ""}`}
                  >
                    {i + 1}. {lesson.title}
                    <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {lesson.minutes} min
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{lesson.task}</p>
                </div>
              </div>
            );
          })}

          {progress && (
            <div className="mt-2">
              <label className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)]">
                What you learned
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
                placeholder="Write it down while it's fresh — this stays with you."
                className="mt-2 w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
              />
              <button
                type="button"
                disabled={saveNote.isPending}
                onClick={() => saveNote.mutate()}
                className="mt-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-[color:var(--gold)]"
              >
                {saveNote.isPending ? "Saving…" : "Save notes"}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
