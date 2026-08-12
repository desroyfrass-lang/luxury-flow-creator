// ─────────────────────────────────────────────────────────────────────────────
// FRASS-5P000 — the Daily Customization provider.
// One Daily. One engine. The member decides the arrangement.
//
// Preferences load instantly from this device, then sync from the account so
// the same organisation follows the member to phone, tablet and desktop.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  defaultPrefs,
  layoutClasses,
  resolveArrangement,
  type Arrangement,
  type DailyPrefs,
  type SectionId,
} from "@/lib/daily/customization";
import { customizeFromSpeech } from "@/lib/daily/conversational";
import { getDailyLayout, saveDailyLayout } from "@/lib/daily/customization.functions";

const KEY = "frass.daily.layout.v1";

type Ctx = {
  prefs: DailyPrefs;
  arrangement: Arrangement;
  classes: string;
  update: (next: DailyPrefs) => void;
  /** Returns Frassy's reply when the sentence was a layout request, else null. */
  speak: (said: string) => string | null;
  toggleCollapsed: (id: SectionId) => void;
  reset: () => void;
};

const DailyCustomizationContext = createContext<Ctx | null>(null);

function readLocal(): DailyPrefs | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...defaultPrefs(), ...(JSON.parse(raw) as DailyPrefs) } : null;
  } catch {
    return null;
  }
}

export function DailyCustomizationProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<DailyPrefs>(() => defaultPrefs());
  const loadFn = useServerFn(getDailyLayout);
  const saveFn = useServerFn(saveDailyLayout);
  const dirty = useRef(false);

  // Device first (instant), then the account (so it follows you everywhere).
  useEffect(() => {
    const local = readLocal();
    if (local) setPrefs(local);
    let cancelled = false;
    void loadFn()
      .then((remote) => {
        if (!cancelled && remote && !dirty.current) setPrefs({ ...defaultPrefs(), ...remote });
      })
      .catch(() => {
        /* signed out or offline — the device copy is enough */
      });
    return () => {
      cancelled = true;
    };
  }, [loadFn]);

  const update = useCallback(
    (next: DailyPrefs) => {
      dirty.current = true;
      setPrefs(next);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* private browsing — the account copy still saves */
      }
      void saveFn({ data: { prefs: next } }).catch(() => {
        /* saved on this device; will sync next time she's signed in */
      });
    },
    [saveFn],
  );

  const value = useMemo<Ctx>(() => {
    return {
      prefs,
      arrangement: resolveArrangement(prefs),
      classes: layoutClasses(prefs),
      update,
      speak: (said: string) => {
        const result = customizeFromSpeech(said, prefs);
        if (!result) return null;
        update(result.prefs);
        return result.say;
      },
      toggleCollapsed: (id: SectionId) =>
        update({
          ...prefs,
          collapsed: prefs.collapsed.includes(id)
            ? prefs.collapsed.filter((x) => x !== id)
            : [...prefs.collapsed, id],
        }),
      reset: () => update({ ...defaultPrefs(), name: prefs.name }),
    };
  }, [prefs, update]);

  return <DailyCustomizationContext.Provider value={value}>{children}</DailyCustomizationContext.Provider>;
}

/** Safe everywhere — falls back to Frass's recommended arrangement. */
export function useDailyCustomization(): Ctx {
  const ctx = useContext(DailyCustomizationContext);
  const fallbackPrefs = useMemo(() => defaultPrefs(), []);
  const fallback = useMemo<Ctx>(
    () => ({
      prefs: fallbackPrefs,
      arrangement: resolveArrangement(fallbackPrefs),
      classes: layoutClasses(fallbackPrefs),
      update: () => {},
      speak: () => null,
      toggleCollapsed: () => {},
      reset: () => {},
    }),
    [fallbackPrefs],
  );
  return ctx ?? fallback;
}
