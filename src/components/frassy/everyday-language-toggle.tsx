// FRASS-0544 — Technical Version / Guided Walkthrough.
// FRASS-0545 — Adaptive Learning Levels: the same answer at four depths.
//
// Nobody has to admit they didn't follow.

import { useState } from "react";
import { Ellipsis, Volume2 } from "lucide-react";
import { hasTechnicalLanguage, splitPlainEnglish } from "@/lib/frassy/everyday-language";
import { LearningLevelPicker } from "@/components/frassy/learning-level-picker";
import { useLearningLevel } from "@/hooks/use-learning-level";
import {
  LEARNING_LEVELS,
  levelMeta,
  recommendLevel,
  type LearningLevel,
} from "@/lib/frassy/learning-levels";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function PlainEnglishMessage({
  content,
  onRequestLevel,
  presentation = "default",
  onHear,
  hearDisabled = false,
  hearUnavailableReason = "Response playback is unavailable",
}: {
  content: string;
  /** Ask Frassy to re-explain this answer at another depth. */
  onRequestLevel?: (level: LearningLevel) => void;
  presentation?: "default" | "response-menu";
  onHear?: () => void;
  hearDisabled?: boolean;
  hearUnavailableReason?: string;
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

  const selectMode = (next: string) => {
    if (next !== "technical" && next !== "plain") return;
    setMode(next);
    if (next === "plain" && !plain) askAt("new");
  };

  const selectLevel = (next: string) => {
    if (!LEARNING_LEVELS.some((item) => item.id === next)) return;
    askAt(next as LearningLevel);
  };

  if (presentation === "response-menu") {
    return (
      <div className="min-w-0">
        <p className="whitespace-pre-wrap break-words">{offer ? shown : content}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Response options"
              title="Response options"
              className="mt-1.5 min-h-9 min-w-9 rounded-full text-[color:var(--ws-soft)] hover:bg-[color:var(--ws-accent-bg)] hover:text-[color:var(--ws-ink)]"
            >
              <Ellipsis aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="z-[80] w-[min(19rem,calc(100vw-2rem))] border-[color:var(--ws-line)] bg-[color:var(--ws-panel)] text-[color:var(--ws-ink)]"
          >
            <DropdownMenuLabel className="text-xs text-[color:var(--ws-soft)]">
              Response options
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup value={mode} onValueChange={selectMode}>
              <DropdownMenuRadioItem value="technical" className="min-h-11">
                Technical version
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="plain" className="min-h-11">
                Guided walkthrough
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator className="bg-[color:var(--ws-line)]" />
            <DropdownMenuLabel className="text-xs text-[color:var(--ws-soft)]">
              Explain this at
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup value={level} onValueChange={selectLevel}>
              {LEARNING_LEVELS.map((item) => (
                <DropdownMenuRadioItem key={item.id} value={item.id} className="min-h-11">
                  <span aria-hidden="true">{item.dot}</span>
                  {item.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator className="bg-[color:var(--ws-line)]" />
            <DropdownMenuItem
              disabled={!onHear || hearDisabled}
              onSelect={() => onHear?.()}
              className="min-h-11"
              title={
                !onHear || hearDisabled ? hearUnavailableReason : "Hear Frassy read this response"
              }
            >
              <Volume2 aria-hidden="true" />
              <span className="min-w-0 flex-1">Hear Frassy</span>
              {(!onHear || hearDisabled) && (
                <span className="text-[10px] text-[color:var(--ws-soft)]">Unavailable</span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

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
          Ask Frassy “break that down for me” for the guided version.
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
