// Frassy memory — local-only, user-controlled preference memory.
// Never sent to a server without the user visiting the store.
// User can clear granularly via Settings → "What Frassy remembers".

import { useEffect, useState } from "react";

export type WishlistItem = {
  title: string;
  href: string;
  price?: string;
  image?: string;
  addedAt: string;
};

export type FrassyMemory = {
  firstName: string | null;
  lastVisitAt: string | null;
  visits: number;
  recentCategories: string[]; // last 8, most-recent first
  recentProducts: { title: string; href: string; seenAt: string }[]; // last 8
  wishlist: WishlistItem[];
  likes: string[];
  dislikes: string[];
  preferredSize: string | null;
  preferredColors: string[];
  preferredBrands: string[];
  budgetRange: string | null; // e.g. "$50-150"
  lastCartTitles: string[];
};

const EMPTY: FrassyMemory = {
  firstName: null,
  lastVisitAt: null,
  visits: 0,
  recentCategories: [],
  recentProducts: [],
  wishlist: [],
  likes: [],
  dislikes: [],
  preferredSize: null,
  preferredColors: [],
  preferredBrands: [],
  budgetRange: null,
  lastCartTitles: [],
};

const KEY = "frassy:memory:v2";
const LEGACY_KEY = "frassy:memory:v1";

function load(): FrassyMemory {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw =
      window.localStorage.getItem(KEY) ?? window.localStorage.getItem(LEGACY_KEY);
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
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setMemory(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = (patch: Partial<FrassyMemory>) => {
    setMemory((prev) => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  };

  // --- Granular resets (Spec 032) ---
  const resetLearnedPreferences = () => {
    setMemory((prev) => {
      const next: FrassyMemory = {
        ...prev,
        likes: [],
        dislikes: [],
        preferredSize: null,
        preferredColors: [],
        preferredBrands: [],
        budgetRange: null,
      };
      save(next);
      return next;
    });
  };
  const clearRecentlyViewed = () => {
    setMemory((prev) => {
      const next: FrassyMemory = { ...prev, recentCategories: [], recentProducts: [] };
      save(next);
      return next;
    });
  };
  const clearWishlist = () => {
    setMemory((prev) => {
      const next: FrassyMemory = { ...prev, wishlist: [] };
      save(next);
      return next;
    });
  };
  const clearAll = () => {
    save(EMPTY);
    setMemory(EMPTY);
  };

  return {
    memory,
    update,
    hydrated,
    resetLearnedPreferences,
    clearRecentlyViewed,
    clearWishlist,
    clearAll,
  };
}

// Passive helpers.
export function rememberCategory(slug: string) {
  const m = load();
  const next = [slug, ...m.recentCategories.filter((s) => s !== slug)].slice(0, 8);
  save({ ...m, recentCategories: next });
}

export function rememberProduct(title: string, href: string) {
  const m = load();
  const seen = { title, href, seenAt: new Date().toISOString() };
  const next = [seen, ...m.recentProducts.filter((p) => p.href !== href)].slice(0, 8);
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

// Wishlist helpers (local-only).
export function toggleWishlist(item: Omit<WishlistItem, "addedAt">): boolean {
  const m = load();
  const exists = m.wishlist.some((w) => w.href === item.href);
  const next: WishlistItem[] = exists
    ? m.wishlist.filter((w) => w.href !== item.href)
    : [{ ...item, addedAt: new Date().toISOString() }, ...m.wishlist].slice(0, 40);
  save({ ...m, wishlist: next });
  return !exists;
}

export function isWishlisted(href: string): boolean {
  return load().wishlist.some((w) => w.href === href);
}

// Compact context blob for the chat API. Only first name is remotely PII.
export function memoryContext(m: FrassyMemory): string {
  const parts: string[] = [];
  if (m.firstName) parts.push(`Name: ${m.firstName}`);
  if (m.visits) parts.push(`Visits: ${m.visits}`);
  if (m.preferredSize) parts.push(`Size: ${m.preferredSize}`);
  if (m.preferredColors.length) parts.push(`Colors: ${m.preferredColors.join(", ")}`);
  if (m.preferredBrands.length) parts.push(`Brands: ${m.preferredBrands.join(", ")}`);
  if (m.budgetRange) parts.push(`Budget: ${m.budgetRange}`);
  if (m.recentCategories.length) parts.push(`Recent categories: ${m.recentCategories.join(", ")}`);
  if (m.recentProducts.length)
    parts.push(`Recently viewed: ${m.recentProducts.slice(0, 5).map((p) => p.title).join(", ")}`);
  if (m.wishlist.length)
    parts.push(`Wishlist: ${m.wishlist.slice(0, 5).map((w) => w.title).join(", ")}`);
  if (m.likes.length) parts.push(`Likes: ${m.likes.join(", ")}`);
  if (m.dislikes.length) parts.push(`Dislikes: ${m.dislikes.join(", ")}`);
  if (m.lastCartTitles.length) parts.push(`Last cart: ${m.lastCartTitles.join(", ")}`);
  return parts.join(" • ");
}
