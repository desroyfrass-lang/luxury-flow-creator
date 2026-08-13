// FRASS-0553 — where the page chrome ends.
//
// The Frass Trail chip and the Frassy Conversation Dock both park under the
// site header, stacked in that order. Headers here grow and shrink (banners,
// secondary nav rows, scroll states), so the offset is measured continuously
// rather than hard-coded — the dock can never end up behind the header or on
// top of a heading.

import { useEffect, useState } from "react";

const GAP = 8;
const FLOOR = 84;

/**
 * Returns the y position just below the lowest matching piece of top chrome.
 * @param selectors elements to clear, in any order
 */
export function useChromeOffset(selectors: string[], floor = FLOOR): number {
  const [top, setTop] = useState(floor);
  const key = selectors.join("|");

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    let last = floor;

    const measure = () => {
      let lowest = floor - GAP;
      for (const selector of key.split("|")) {
        const el = document.querySelector(selector);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.height > 0 && rect.top < 240) lowest = Math.max(lowest, rect.bottom);
      }
      const next = Math.round(lowest + GAP);
      if (next !== last) {
        last = next;
        setTop(next);
      }
    };

    const tick = () => {
      measure();
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [key, floor]);

  return top;
}
