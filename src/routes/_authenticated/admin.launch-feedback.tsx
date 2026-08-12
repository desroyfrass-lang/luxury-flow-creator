// FRASS-0412 — Founder Launch Feedback Center.
// Voice, screen and written feedback from the launch program, transcribed and
// summarised by Frassy, with themes, status tracking and a program kill switch.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare, Power } from "lucide-react";
import { toast } from "sonner";
import { SecurityAlertsPanel } from "@/components/finance/security-alerts-panel";
import { PlatformHealthPanel } from "@/components/finance/platform-health-panel";
import { ObservationWindowPanel } from "@/components/finance/observation-window-panel";

import { PlatformProtectionSwitch } from "@/components/founder/platform-protection-switch";

import {
  categoryLabel,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
} from "@/lib/launch-feedback";
import {
  getFeedbackProgramStatus,
  listAllVoiceFeedback,
  setFeedbackProgramEnabled,
  updateVoiceFeedback,
} from "@/lib/launch-feedback.functions";

export const Route = createFileRoute("/_authenticated/admin/launch-feedback")({
  component: LaunchFeedbackCenter,
});

function LaunchFeedbackCenter() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAllVoiceFeedback);
  const statusFn = useServerFn(getFeedbackProgramStatus);
  const updateFn = useServerFn(updateVoiceFeedback);
  const toggleFn = useServerFn(setFeedbackProgramEnabled);

  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const { data: items, isLoading, error } = useQuery({
    queryKey: ["admin", "launch-feedback"],
    queryFn: () => listFn(),
  });
  const { data: program } = useQuery({
    queryKey: ["launch-feedback-status"],
    queryFn: () => statusFn(),
  });

  const filtered = useMemo(
    () =>
      (items ?? []).filter(
        (i) =>
          (category === "all" || i.category === category) &&
          (status === "all" || i.status === status),
      ),
    [items, category, status],
  );

  const themeCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of items ?? []) for (const t of i.themes ?? []) map.set(t, (map.get(t) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [items]);

  const patch = async (id: string, next: { status?: string; founderNote?: string }) => {
    try {
      await updateFn({ data: { id, ...next } });
      await qc.invalidateQueries({ queryKey: ["admin", "launch-feedback"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update that.");
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
            Owner console · Launch program
          </div>
          <h2 className="mt-2 font-display text-4xl">Launch Feedback Center</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Voice notes, screenshots and screen recordings sent during launch. Frassy transcribes
            each one, writes a plain-English summary and tags the themes.{" "}
            <Link to="/admin/feedback" className="underline">
              Page feedback lives here
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            const next = !(program?.enabled ?? true);
            try {
              await toggleFn({ data: { enabled: next } });
              await qc.invalidateQueries({ queryKey: ["launch-feedback-status"] });
              toast.success(next ? "Program is open." : "Program is closed.");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not change that.");
            }
          }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] hover:border-[color:var(--gold)]"
        >
          <Power className="h-4 w-4" />
          {program?.enabled ? "Program open — close it" : "Program closed — open it"}
        </button>
      </div>

      {/* FRASS-0474 — blocked financial attempts sit beside launch feedback. */}
      <div className="mb-8 space-y-6">
        <PlatformHealthPanel />
        {/* FRASS-0506 — the latest release stays under observation until it proves stable. */}
        <ObservationWindowPanel />

        <SecurityAlertsPanel />
        {/* FRASS-0476 — the emergency control lives with the intelligence it protects. */}
        <PlatformProtectionSwitch />
      </div>




      {themeCounts.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {themeCounts.map(([theme, count]) => (
            <span
              key={theme}
              className="rounded-full border border-[color:var(--gold)]/30 px-3 py-1 text-xs text-white/70"
            >
              {theme} · {count}
            </span>
          ))}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-sm border border-white/15 bg-black/50 px-3 py-2 text-sm"
        >
          <option value="all">All categories</option>
          {FEEDBACK_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-sm border border-white/15 bg-black/50 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {FEEDBACK_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 py-12 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading submissions…</span>
        </div>
      )}

      {error && (
        <div className="rounded-sm border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          Could not load feedback: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="rounded-sm border border-dashed border-border bg-background/60 p-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-4 font-display text-2xl">Nothing here yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Submissions appear the moment someone sends a voice note from The Daily, chat or
            FV Studios.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-sm border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/50">
              <span className="text-[color:var(--gold)]">{categoryLabel(item.category)}</span>
              <span>· {item.source}</span>
              {item.sentiment && <span>· {item.sentiment}</span>}
              {item.duration_seconds ? <span>· {item.duration_seconds}s</span> : null}
              <span>· {new Date(item.created_at).toLocaleString()}</span>
            </div>

            {item.summary && <p className="mt-3 text-sm text-white/85">{item.summary}</p>}
            {item.transcript && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs uppercase tracking-[0.2em] text-white/50">
                  Full transcript
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">{item.transcript}</p>
              </details>
            )}

            {(item.themes ?? []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.themes.map((t) => (
                  <span key={t} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/65">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {(item.attachments ?? []).length > 0 && (
              <p className="mt-3 text-xs text-white/50">
                {item.attachments.length} attachment{item.attachments.length > 1 ? "s" : ""}:{" "}
                {item.attachments.map((a) => a.name).join(", ")}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {FEEDBACK_STATUSES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => patch(item.id, { status: s.id })}
                  className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] transition ${
                    item.status === s.id
                      ? "bg-[color:var(--gold)] text-black"
                      : "border border-white/15 text-white/60 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <textarea
              defaultValue={item.founder_note ?? ""}
              placeholder="Founder note…"
              onBlur={(e) => {
                if (e.target.value !== (item.founder_note ?? "")) {
                  void patch(item.id, { founderNote: e.target.value });
                }
              }}
              rows={2}
              className="mt-3 w-full rounded-sm border border-white/10 bg-black/40 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
