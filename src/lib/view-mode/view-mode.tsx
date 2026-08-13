// FRASS-0517 — Platform-wide View Preference.
//
// Constitutional rule: every major workspace optionally supports Standard View
// and Simplified View. Both reach the exact same data, workflows and
// capabilities — only the presentation changes. Simplified View is a
// reduced-distraction mode, never a reduced-feature mode.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useServerFn } from "@tanstack/react-start";
import { getViewMode, setViewMode, type ViewMode } from "./view-mode.functions";
import { supabase } from "@/integrations/supabase/client";

export type { ViewMode };

const STORAGE_KEY = "frass.view-mode";

type Ctx = {
  mode: ViewMode;
  simplified: boolean;
  setMode: (mode: ViewMode) => void;
  toggle: () => void;
  /** True once the stored preference has been read, so nothing flickers. */
  ready: boolean;
};

const ViewModeContext = createContext<Ctx>({
  mode: "standard",
  simplified: false,
  setMode: () => {},
  toggle: () => {},
  ready: false,
});

function readLocal(): ViewMode | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "simplified" || v === "standard" ? v : null;
}

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>("standard");
  const [ready, setReady] = useState(false);
  const load = useServerFn(getViewMode);
  const save = useServerFn(setViewMode);

  // Local first (instant, works signed out), then the account preference so
  // the choice follows the member to every device.
  useEffect(() => {
    const local = readLocal();
    if (local) setModeState(local);
    setReady(true);
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session || cancelled) return;
      try {
        const remote = await load();
        if (!cancelled && remote?.mode && remote.mode !== local) {
          setModeState(remote.mode);
          window.localStorage.setItem(STORAGE_KEY, remote.mode);
        }
      } catch {
        /* the local preference is enough */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const setMode = useCallback(
    (next: ViewMode) => {
      setModeState(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next);
        window.dispatchEvent(new CustomEvent("frass-view-mode", { detail: next }));
      }
      void (async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) return;
        try {
          await save({ data: { mode: next } });
        } catch {
          /* preference stays local if it can't be saved */
        }
      })();
    },
    [save],
  );

  const value = useMemo<Ctx>(
    () => ({
      mode,
      simplified: mode === "simplified",
      setMode,
      toggle: () => setMode(mode === "simplified" ? "standard" : "simplified"),
      ready,
    }),
    [mode, setMode, ready],
  );

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

export function useViewMode() {
  return useContext(ViewModeContext);
}

/** A calm, time-aware greeting used at the top of Simplified View. */
export function greetingFor(name?: string | null) {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return name ? `${part}, ${name}` : part;
}
