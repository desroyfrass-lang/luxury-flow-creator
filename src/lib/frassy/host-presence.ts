// ─────────────────────────────────────────────────────────────────────────────
// FRASSY — Step 2. Strict one-Frassy presence priority.
//
// One woman, multiple interfaces — never several copies of her on one screen.
// While the cinematic entrance is on stage she holds the floor: the corner
// companion, the workspace avatar and the conversation dock all stand down
// until she finishes or is dismissed. Control then returns to the normal
// surface rules.
// ─────────────────────────────────────────────────────────────────────────────

let entranceActive = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/** Called by the cinematic entrance as she takes and leaves the stage. */
export function setEntranceActive(active: boolean) {
  if (entranceActive === active) return;
  entranceActive = active;
  emit();
}

export function isEntranceActive() {
  return entranceActive;
}

/** SSR renders with the stage empty — the entrance is a client-only moment. */
export function isEntranceActiveServer() {
  return false;
}

export function subscribeEntrance(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
