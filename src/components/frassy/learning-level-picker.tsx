// FRASS-0545 — the four-level depth control. Same answer, chosen depth.

import { LEARNING_LEVELS, type LearningLevel } from "@/lib/frassy/learning-levels";

export function LearningLevelPicker({
  value,
  onChange,
  size = "sm",
  showPurpose = false,
}: {
  value: LearningLevel;
  onChange: (level: LearningLevel) => void;
  size?: "sm" | "md";
  showPurpose?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {LEARNING_LEVELS.map((l) => {
        const active = l.id === value;
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onChange(l.id)}
            aria-pressed={active}
            title={l.memberVoice}
            className={`rounded-sm border text-left transition ${
              size === "md" ? "px-3 py-2 text-xs" : "px-2 py-1 text-[10px]"
            } uppercase tracking-[0.16em] ${
              active
                ? "border-[color:var(--gold)]/60 text-[color:var(--gold)]"
                : "border-white/15 text-white/50 hover:text-white/80"
            }`}
          >
            <span className="mr-1">{l.dot}</span>
            {l.label}
            {showPurpose && (
              <span className="mt-1 block text-[10px] normal-case tracking-normal text-white/40">
                {l.purpose}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
