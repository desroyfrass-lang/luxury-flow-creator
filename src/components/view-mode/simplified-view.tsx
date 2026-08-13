// FRASS-0517 — Simplified View.
//
// One screen, nothing else: greeting, Frassy, the conversation, voice, typing,
// and the one thing worth doing next with Approve / Next. No sidebars, no
// widgets, no dashboard panels. Members work by talking to Frassy — she does
// the navigating (FRASS-0513) while the conversation keeps flowing.

import { useEffect, useState, type ReactNode } from "react";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { FrassyChat } from "@/components/frassy-chat";
import { ViewModeToggle } from "@/components/view-mode/view-mode-toggle";
import { greetingFor, useViewMode } from "@/lib/view-mode/view-mode";
import { supabase } from "@/integrations/supabase/client";

/** The single current task or recommendation shown beneath the conversation. */
export type SimplifiedTask = {
  title: string;
  detail?: string;
  approveLabel?: string;
  onApprove?: () => void;
  nextLabel?: string;
  onNext?: () => void;
};

function useFirstName() {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const meta = data.user?.user_metadata as Record<string, unknown> | undefined;
      const full =
        (meta?.["display_name"] as string | undefined) ??
        (meta?.["full_name"] as string | undefined) ??
        null;
      if (!cancelled && full) setName(full.split(" ")[0] ?? full);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return name;
}

export function SimplifiedView({
  place,
  task,
}: {
  /** Where the member is — Frassy keeps the context of the same workspace. */
  place: string;
  task?: SimplifiedTask;
}) {
  const name = useFirstName();

  return (
    <div className="min-h-screen bg-background px-4 pb-10 pt-20 sm:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-white/40">
              <Sparkles className="h-3 w-3" /> {place}
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl">
              {greetingFor(name)}
            </h1>
            <p className="mt-1 text-sm text-white/55">
              Just tell me what you'd like to do — I'll take you there.
            </p>
          </div>
          <ViewModeToggle className="shrink-0" />
        </div>

        <div className="overflow-hidden rounded-lg border border-white/10 bg-black/30">
          <FrassyChat embedded />
        </div>

        {task && (
          <section className="rounded-lg border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/5 p-4">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]/80">
              Right now
            </div>
            <h2 className="mt-2 text-base font-medium text-white">{task.title}</h2>
            {task.detail && <p className="mt-1 text-sm text-white/60">{task.detail}</p>}
            {(task.onApprove || task.onNext) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {task.onApprove && (
                  <button
                    type="button"
                    onClick={task.onApprove}
                    className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-5 py-2 text-[11px] uppercase tracking-[0.28em] text-black"
                  >
                    <Check className="h-3.5 w-3.5" /> {task.approveLabel ?? "Approve"}
                  </button>
                )}
                {task.onNext && (
                  <button
                    type="button"
                    onClick={task.onNext}
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2 text-[11px] uppercase tracking-[0.28em] text-white/80"
                  >
                    {task.nextLabel ?? "Next"} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

/**
 * Wrap any workspace with this. Standard View renders the workspace exactly as
 * it is; Simplified View replaces it with the calm conversation — same data,
 * same workflows, same capability, different presentation.
 */
export function ViewModeFrame({
  place,
  task,
  children,
}: {
  place: string;
  task?: SimplifiedTask;
  children: ReactNode;
}) {
  const { simplified, ready } = useViewMode();
  if (ready && simplified) return <SimplifiedView place={place} task={task} />;
  return <>{children}</>;
}
