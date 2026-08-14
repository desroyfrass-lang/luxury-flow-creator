// SPEC-BLUEPRINT-001-FINAL §5 — the Extended Builder Rhythm feed.
// The Daily always runs urgent → decisions → growth → celebration → 🌸 ending
// → 🚪 Ready to Build. The day never starts or ends badly.

import { ArrowRight } from "lucide-react";
import type { DailyStep } from "@/lib/workspace/daily-os";
import { BAND_BY_ID, beautifulEnding, rhythmGroups } from "@/lib/builder-os/builder-rhythm";
import { DAILY_WORKSHOP_RULE } from "@/lib/builder-os/glossary";

export function BuilderRhythmFeed({
  steps,
  name,
  onOpenStep,
  onNavigate,
}: {
  steps: DailyStep[];
  name?: string;
  onOpenStep?: (step: DailyStep) => void;
  onNavigate?: (to: string) => void;
}) {
  const groups = rhythmGroups(steps);

  return (
    <div className="space-y-5">
      {groups.map((g) => {
        const band = BAND_BY_ID[g.band];
        return (
          <div key={g.band}>
            <div className="text-sm">
              {band.emoji} {band.label}
            </div>
            <p className="ws-meta">{band.everyday}</p>
            <ul className="mt-2 space-y-1">
              {g.steps.map((s) => (
                <li key={s.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex-1 text-left text-sm"
                    onClick={() => onOpenStep?.(s)}
                  >
                    {s.label}
                  </button>
                  <span className="ws-meta">{s.minutes} min</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div className="rounded-lg border border-border/60 p-3">
        <div className="text-sm">🌸 {BAND_BY_ID.ending.label}</div>
        <p className="ws-meta">{beautifulEnding(steps, name)}</p>
      </div>

      <div className="rounded-lg border border-border/60 p-3">
        <div className="text-sm">🚪 {BAND_BY_ID.ready.label}</div>
        <p className="ws-meta">{DAILY_WORKSHOP_RULE}</p>
        <button type="button" className="daily-link mt-2" onClick={() => onNavigate?.("/room")}>
          Go to the Workshop <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
