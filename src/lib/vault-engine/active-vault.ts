// FRASS-0610 — Which Vault am I standing in?
// Stored locally only as a convenience for "take me back where I was".
// It never grants access: the database decides what you can see.

const KEY = "frass.activeVault";

export function getActiveVaultId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setActiveVaultId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(KEY, id);
    else window.localStorage.removeItem(KEY);
  } catch {
    /* private browsing — the Vault still works, it just won't remember */
  }
}
