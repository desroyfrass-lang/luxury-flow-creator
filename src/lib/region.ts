import { useEffect, useState } from "react";

export type Region = {
  code: string;
  name: string;
  flag: string;
  currency: string;
};

/**
 * The Primary Operating Markets (FRASS-0305 / FRASS-0306) — always pinned in the
 * corner of the bar. Canada, the United Kingdom and the United States are the
 * three places Frass runs a business from.
 */
export const PINNED_REGIONS: Region[] = [
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD" },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP" },
];

/** Every other market a Builder can choose to shop from. */
export const OTHER_REGIONS: Region[] = [
  { code: "JM", name: "Jamaica", flag: "🇯🇲", currency: "JMD" },
  { code: "TT", name: "Trinidad & Tobago", flag: "🇹🇹", currency: "TTD" },
  { code: "BB", name: "Barbados", flag: "🇧🇧", currency: "BBD" },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR" },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", currency: "NGN" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", currency: "GHS" },
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD" },
];


export const ALL_REGIONS: Region[] = [...PINNED_REGIONS, ...OTHER_REGIONS];

export const DEFAULT_REGION = PINNED_REGIONS[0]!;

const STORAGE_KEY = "frass.region";

export function findRegion(code: string | null | undefined): Region {
  return ALL_REGIONS.find((r) => r.code === code) ?? DEFAULT_REGION;
}

/** Best-effort guess from the browser locale / timezone — never blocks render. */
function guessRegion(): Region {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz.includes("Toronto") || tz.includes("Vancouver") || tz.includes("Edmonton") || tz.includes("Winnipeg") || tz.includes("Halifax")) {
      return findRegion("CA");
    }
    const locale = navigator.language ?? "";
    const code = locale.split("-")[1]?.toUpperCase();
    return findRegion(code);
  } catch {
    return DEFAULT_REGION;
  }
}

const listeners = new Set<(r: Region) => void>();

export function setStoredRegion(region: Region) {
  try {
    localStorage.setItem(STORAGE_KEY, region.code);
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn(region));
}

/** Shopping region — persisted, shared across every component that reads it. */
export function useRegion() {
  const [region, setRegionState] = useState<Region>(DEFAULT_REGION);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setRegionState(saved ? findRegion(saved) : guessRegion());

    const fn = (r: Region) => setRegionState(r);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  return {
    region,
    setRegion: (r: Region) => {
      setRegionState(r);
      setStoredRegion(r);
    },
  };
}
