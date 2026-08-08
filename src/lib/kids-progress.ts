// Kids World progress — celebration, never scoring.
//
// Progress lives on the device beside the passport. Nothing is ranked, timed
// or compared. We remember what a child started, what they finished, what they
// saved, and the badges they collected, so the world can welcome them back.

import { useCallback, useEffect, useState } from "react";

const KEY = "frass.kids.progress.v1";

export interface KidsProgress {
  /** slug → ISO date of first completion */
  completed: Record<string, string>;
  /** slug → ISO date last opened */
  started: Record<string, string>;
  /** saved for later */
  saved: string[];
  /** badge names earned */
  badges: { name: string; emoji: string; slug: string; at: string }[];
  /** skills touched → times */
  skills: Record<string, number>;
  lastActivity: string | null;
}

const EMPTY: KidsProgress = {
  completed: {},
  started: {},
  saved: [],
  badges: [],
  skills: {},
  lastActivity: null,
};

function read(): KidsProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as KidsProgress) };
  } catch {
    return EMPTY;
  }
}

function write(next: KidsProgress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("frass-kids-progress"));
  } catch {
    /* storage unavailable — progress is a nicety, never a blocker */
  }
}

export function useKidsProgress() {
  const [progress, setProgress] = useState<KidsProgress>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(read());
    setReady(true);
    const sync = () => setProgress(read());
    window.addEventListener("frass-kids-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("frass-kids-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const start = useCallback((slug: string) => {
    const cur = read();
    write({ ...cur, started: { ...cur.started, [slug]: new Date().toISOString() }, lastActivity: slug });
  }, []);

  const complete = useCallback(
    (slug: string, opts: { badge?: { name?: string; emoji?: string }; skills?: string[] } = {}) => {
      const cur = read();
      const at = new Date().toISOString();
      const skills = { ...cur.skills };
      (opts.skills ?? []).forEach((s) => {
        skills[s] = (skills[s] ?? 0) + 1;
      });
      const badges = [...cur.badges];
      if (opts.badge?.name && !badges.some((b) => b.slug === slug)) {
        badges.push({ name: opts.badge.name, emoji: opts.badge.emoji ?? "⭐", slug, at });
      }
      write({
        ...cur,
        completed: { ...cur.completed, [slug]: cur.completed[slug] ?? at },
        skills,
        badges,
        lastActivity: slug,
      });
    },
    [],
  );

  const toggleSaved = useCallback((slug: string) => {
    const cur = read();
    const saved = cur.saved.includes(slug)
      ? cur.saved.filter((s) => s !== slug)
      : [...cur.saved, slug];
    write({ ...cur, saved });
  }, []);

  const clear = useCallback(() => write(EMPTY), []);

  return {
    progress,
    ready,
    start,
    complete,
    toggleSaved,
    clear,
    isComplete: (slug: string) => Boolean(progress.completed[slug]),
    isSaved: (slug: string) => progress.saved.includes(slug),
  };
}

/** Gentle milestones — celebrated, never required. */
export function milestones(progress: KidsProgress) {
  const done = Object.keys(progress.completed).length;
  const list = [
    { at: 1, label: "First adventure" },
    { at: 3, label: "Three explorations" },
    { at: 5, label: "Curious explorer" },
    { at: 10, label: "Ten discoveries" },
    { at: 20, label: "Village regular" },
  ];
  return list.map((m) => ({ ...m, reached: done >= m.at }));
}
