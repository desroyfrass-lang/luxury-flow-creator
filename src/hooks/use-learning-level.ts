// FRASS-0545 — the member's active learning level, shared across every surface.

import { useEffect, useState } from "react";
import {
  DEFAULT_LEARNING_LEVEL,
  loadLearningLevel,
  saveLearningLevel,
  type LearningLevel,
} from "@/lib/frassy/learning-levels";

export function useLearningLevel() {
  const [level, setLevelState] = useState<LearningLevel>(DEFAULT_LEARNING_LEVEL);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLevelState(loadLearningLevel());
    setHydrated(true);
    const onChange = (e: Event) => {
      const next = (e as CustomEvent<LearningLevel>).detail;
      if (next) setLevelState(next);
    };
    window.addEventListener("frassy:learning-level", onChange);
    return () => window.removeEventListener("frassy:learning-level", onChange);
  }, []);

  /** Change for this conversation only (not remembered). */
  const setTemporary = (next: LearningLevel) => setLevelState(next);

  /** Change and remember as the member's default. */
  const setDefault = (next: LearningLevel) => {
    setLevelState(next);
    saveLearningLevel(next);
  };

  return { level, hydrated, setTemporary, setDefault };
}
