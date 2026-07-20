// Frassy memory — local-only, user-controlled preference memory.
// Never sent to a server without the user visiting the store.
// The user can clear this any time via Settings → "What Frassy remembers".

import { useEffect, useState } from "react";

export type FrassyMemory = {
  firstName: string | null;
  lastVisitAt: string | null;
  visits: number;
  recentCategories: string[]; // last 8, most-recent first
  recentProducts: { title: string; href: string; seenAt: string }[]; // last 6
  likes: string[]; // tags: "neutral colors", "oversized hoodies", etc.
  dislikes: string[];
  lastCartTitles: string[]; // titles of last cart items (for "want to continue?")
};

const EMPTY: FrassyMemory = {
  firstName: null,
  lastVisitAt: null,
  visits: 0,
  recentCategories: [],
  recentProducts: [],
  likes: [],
  dislikes: [],
  lastCartTitles: [],
};

const KEY = "frassy:memory:v1";

function load(): FrassyMemory {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<FrassyMemory>) };
  } catch {
    return EMPTY;
  }
}

function save(mem: FrassyMemory) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(mem));
  } catch {
    /* noop */
  }
}

export function useFrassyMemory() {
  const [memory, setMemory] = useState<FrassyMemory>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMemory(load());
    setHydrated(true);
  }, []);

  const update = (patch: Partial<FrassyMemory>) => {
    setMemory((prev) => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  };

  const clear = () => {
    save(EMPTY);
    setMemory(EMPTY);
  };

  return { memory, update, clear, hydrated };
}

// Small helpers used by the app to record signals passively.
export function rememberCategory(slug: string) {
  const m = load();
  const next = [slug, ...m.recentCategories.filter((s) => s !== slug)].slice(0, 8);
  save({ ...m, recentCategories: next });
}

export function rememberProduct(title: string, href: string) {
  const m = load();
  const seen = { title, href, seenAt: new Date().toISOString() };
  const next = [seen, ...m.recentProducts.filter((p) => p.href !== href)].slice(0, 6);
  save({ ...m, recentProducts: next });
}

export function rememberCartSnapshot(titles: string[]) {
  const m = load();
  save({ ...m, lastCartTitles: titles.slice(0, 6) });
}

export function bumpVisit(firstName?: string | null) {
  const m = load();
  save({
    ...m,
    visits: m.visits + 1,
    lastVisitAt: new Date().toISOString(),
    firstName: firstName ?? m.firstName,
  });
}

// Build a compact context blob for the chat API. Never includes raw PII beyond
// first name; everything else is anonymous browsing preferences.
export function memoryContext(m: FrassyMemory): string {
  const parts: string[] = [];
  if (m.firstName) parts.push(`Name: ${m.firstName}`);
  if (m.visits) parts.push(`Visits: ${m.visits}`);
  if (m.recentCategories.length) parts.push(`Recent categories: ${m.recentCategories.join(", ")}`);
  if (m.recentProducts.length)
    parts.push(`Recently viewed: ${m.recentProducts.map((p) => p.title).join(", ")}`);
  if (m.likes.length) parts.push(`Likes: ${m.likes.join(", ")}`);
  if (m.dislikes.length) parts.push(`Dislikes: ${m.dislikes.join(", ")}`);
  if (m.lastCartTitles.length) parts.push(`Last cart: ${m.lastCartTitles.join(", ")}`);
  return parts.join(" • ");
}
