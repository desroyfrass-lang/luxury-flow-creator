// The Kids World Passport — a family setting, not a security boundary.
//
// It lives in the browser so a parent can prepare a child's passport without an
// account. It governs Kids World only; shopping is never restricted.

import { useCallback, useEffect, useState } from "react";

const KEY = "frass-kids-world-passport";

export interface KidsPassport {
  /** Age world slug: "0-3" | "3-6" | "6-12" | "12-plus" */
  age: string;
  /** Safe Exploration Mode — lock the child to their age world. */
  locked: boolean;
  /** Optional PIN required before settings change. Soft lock, lightly obscured. */
  pin?: string;
  issuedAt: string;
  childName?: string;
}

function read(): KidsPassport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as KidsPassport) : null;
  } catch {
    return null;
  }
}

function write(p: KidsPassport | null) {
  if (typeof window === "undefined") return;
  if (p) window.localStorage.setItem(KEY, JSON.stringify(p));
  else window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("frass-passport"));
}

export const obscurePin = (pin: string) =>
  typeof window === "undefined" ? pin : window.btoa(`frass:${pin}`);

export function useKidsPassport() {
  const [passport, setPassport] = useState<KidsPassport | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setPassport(read());
    sync();
    setReady(true);
    window.addEventListener("frass-passport", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("frass-passport", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const issue = useCallback(
    (next: Omit<KidsPassport, "issuedAt"> & { issuedAt?: string }) => {
      write({ issuedAt: new Date().toISOString(), ...next });
    },
    [],
  );

  const update = useCallback((patch: Partial<KidsPassport>) => {
    const current = read();
    if (!current) return;
    write({ ...current, ...patch });
  }, []);

  const revoke = useCallback(() => write(null), []);

  const canVisit = useCallback(
    (ageSlug: string) => !passport?.locked || passport.age === ageSlug,
    [passport],
  );

  const checkPin = useCallback(
    (pin: string) => !passport?.pin || passport.pin === obscurePin(pin),
    [passport],
  );

  return { passport, ready, issue, update, revoke, canVisit, checkPin };
}
