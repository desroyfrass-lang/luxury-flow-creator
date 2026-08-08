import { useCallback, useEffect, useState } from "react";
import { WEDDING_CHECKLIST } from "@/lib/bridal";

export type VaultTask = {
  id: string;
  task: string;
  category: string;
  done: boolean;
  due?: string;
  owner?: string;
  budget?: number;
  vendor?: string;
  notes?: string;
};

export type SourcingCase = {
  id: string;
  designer: string;
  boutique: string;
  reference: string;
  note: string;
  stage: number;
  created: string;
};

export type BridalVault = {
  coupleA: string;
  coupleB: string;
  date: string;
  budget: number;
  tasks: VaultTask[];
  cases: SourcingCase[];
  saved: number;
  round: number;
};

const KEY = "frass-bridal-vault-v1";

function seed(): BridalVault {
  return {
    coupleA: "",
    coupleB: "",
    date: "",
    budget: 0,
    tasks: WEDDING_CHECKLIST.map((t) => ({ ...t, done: false })),
    cases: [],
    saved: 0,
    round: 0,
  };
}

export function useBridalVault() {
  const [vault, setVault] = useState<BridalVault>(seed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setVault({ ...seed(), ...(JSON.parse(raw) as Partial<BridalVault>) });
    } catch {
      /* first visit */
    }
    setReady(true);
  }, []);

  const save = useCallback((next: BridalVault) => {
    setVault(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const update = useCallback(
    (patch: Partial<BridalVault>) => save({ ...vault, ...patch }),
    [vault, save],
  );

  const toggleTask = useCallback(
    (id: string) =>
      save({
        ...vault,
        tasks: vault.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      }),
    [vault, save],
  );

  const patchTask = useCallback(
    (id: string, patch: Partial<VaultTask>) =>
      save({
        ...vault,
        tasks: vault.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      }),
    [vault, save],
  );

  const addCase = useCallback(
    (c: Omit<SourcingCase, "id" | "stage" | "created">) =>
      save({
        ...vault,
        cases: [
          { ...c, id: `case-${Date.now()}`, stage: 0, created: new Date().toISOString() },
          ...vault.cases,
        ],
      }),
    [vault, save],
  );

  const advanceCase = useCallback(
    (id: string) =>
      save({
        ...vault,
        cases: vault.cases.map((c) =>
          c.id === id ? { ...c, stage: Math.min(c.stage + 1, 5) } : c,
        ),
      }),
    [vault, save],
  );

  return { vault, ready, update, toggleTask, patchTask, addCase, advanceCase };
}
