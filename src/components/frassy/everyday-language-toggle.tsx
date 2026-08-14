// FRASS-0544 — Technical Version / Guided Walkthrough.
// FRASS-0545 — Adaptive Learning Levels: the same answer at four depths.
//
// Nobody has to admit they didn't follow.

import { useState } from "react";
import { hasTechnicalLanguage, splitPlainEnglish } from "@/lib/frassy/everyday-language";
import { LearningLevelPicker } from "@/components/frassy/learning-level-picker";
import { useLearningLevel } from "@/hooks/use-learning-level";
import { levelMeta, recommendLevel, type LearningLevel } from "@/lib/frassy/learning-levels";

export function PlainEnglishMessage({
  content,
  onRequestLevel,
}: {
  content: string;
  /** Ask Frassy to re-explain this answer at another depth. */
  onRequestLevel?: (level: LearningLevel) => void;
}) {
  const { technical, plain } = splitPlainEnglish(content);
  const isTechnical = hasTechnicalLanguage(content);
  const offer = plain !== null || isTechnical;
  const [mode, setMode] = useState<"technical" | "plain">("technical");
  const { level, setTemporary } = useLearningLevel();
  const [dismissed, setDismissed] = useState(false);

  const suggestion = recommendLevel(content, level, isTechnical);
  const shown = mode === "plain" && plain ? plain : mode === "plain" ? content : technical;

  const askAt = (next: LearningLevel) => {
    setTemporary(next);
    onRequestLevel?.(next);
  };

  return (
    <div>
      <p className="whitespace-pre-wrap">{offer ? shown : content}</p>

      {offer && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setMode("technical")}
            aria-pressed={mode === "technical"}
            className={`rounded-sm border px-2 py-1 text-[10px] uppercase tracking-[0.18em] transition ${
              mode === "technical"
                ? "border-[color:var(--gold)]/60 text-[color:var(--gold)]"
                : "border-white/15 text-white/50 hover:text-white/80"
            }`}
          >
            Technical version
          </button>
          <button
            type="button"
            onClick={() => setMode("plain")}
            aria-pressed={mode === "plain"}
            className={`rounded-sm border px-2 py-1 text-[10px] uppercase tracking-[0.18em] transition ${
              mode === "plain"
                ? "border-emerald-400/60 text-emerald-300"
                : "border-white/15 text-white/50 hover:text-white/80"
            }`}
          >
            Guided walkthrough
          </button>
        </div>
      )}

      {offer && mode === "plain" && !plain && (
        <p className="mt-1.5 text-[10px] text-white/40">
          Ask Frassy “explain that in practical terms” for the everyday version.
        </p>
      )}

      {onRequestLevel && (
        <div className="mt-2 border-t border-white/10 pt-2">
          <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/35">
            Explain this at
          </p>
          <LearningLevelPicker value={level} onChange={askAt} />
        </div>
      )}

      {onRequestLevel && suggestion && !dismissed && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-sm border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] text-white/60">
          <span>
            {suggestion.reason} Switch to {levelMeta(suggestion.level).label}?
          </span>
          <button
            type="button"
            onClick={() => askAt(suggestion.level)}
            className="rounded-sm border border-[color:var(--gold)]/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold)]"
          >
            Yes please
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-[10px] uppercase tracking-[0.18em] text-white/35 hover:text-white/60"
          >
            No thanks
          </button>
        </div>
      )}
    </div>
  );
}
