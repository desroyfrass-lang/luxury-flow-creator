// SPEC-BLUEPRINT-001-FINAL §4 — the mandatory Vault classification control.
// One tag per Vault. It decides Daily recommendations, the Workshop default and
// Project Fund allocation. Future and Archived never schedule work.

import { useState } from "react";
import {
  PRIORITY_META,
  VAULT_PRIORITIES,
  loadPriorities,
  priorityOf,
  setPriority,
  type VaultPriority,
} from "@/lib/builder-os/vault-priority";

export function VaultPriorityTag({
  vaultKey,
  onChange,
}: {
  vaultKey: string;
  onChange?: (p: VaultPriority) => void;
}) {
  const [map, setMap] = useState(() => loadPriorities());
  const current = priorityOf(map, vaultKey);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {VAULT_PRIORITIES.map((p) => {
        const meta = PRIORITY_META[p];
        const on = p === current;
        return (
          <button
            key={p}
            type="button"
            className={`ws-chip ${on ? "daily-chip-on" : ""}`}
            aria-pressed={on}
            title={meta.everyday}
            onClick={() => {
              setMap(setPriority(vaultKey, p));
              onChange?.(p);
            }}
          >
            {meta.emoji} {meta.label}
          </button>
        );
      })}
      <span className="ws-meta w-full">{PRIORITY_META[current].everyday}</span>
    </div>
  );
}
