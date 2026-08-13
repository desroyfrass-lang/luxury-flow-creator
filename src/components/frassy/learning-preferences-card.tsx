// FRASS-0545 — Settings → Learning Preferences.
//
// One default for every explanation in Frass. Changeable instantly, anywhere.

import { LearningLevelPicker } from "@/components/frassy/learning-level-picker";
import { useLearningLevel } from "@/hooks/use-learning-level";
import { levelMeta } from "@/lib/frassy/learning-levels";

export function LearningPreferencesCard() {
  const { level, hydrated, setDefault } = useLearningLevel();
  if (!hydrated) return null;

  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-4">
      <h2 className="text-xs uppercase tracking-[0.24em] text-[color:var(--gold)]">
        Learning preferences
      </h2>
      <p className="mt-2 text-sm text-white/70">
        Choose how deeply Frassy explains things. The information never changes — only the depth
        of the explanation does. You can switch for a single answer at any time.
      </p>

      <div className="mt-3">
        <LearningLevelPicker value={level} onChange={setDefault} size="md" showPurpose />
      </div>

      <p className="mt-3 text-[11px] text-white/40">
        Right now Frassy answers you like this: “{levelMeta(level).memberVoice}”
      </p>
    </section>
  );
}
