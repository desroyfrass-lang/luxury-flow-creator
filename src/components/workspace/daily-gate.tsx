// Daily Gate — one Daily across the entire ecosystem.
//
// The Daily is now a real destination (/daily) built from the member's real
// records, not a modal built from persona sample data. Anything in the product
// that used to pop the Daily open now simply takes the member to the one Daily.

import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export const OPEN_DAILY_EVENT = "frass:open-daily";

export function openTheDaily() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_DAILY_EVENT));
}

export function DailyGate() {
  const navigate = useNavigate();
  useEffect(() => {
    const go = () => {
      void navigate({ to: "/daily" });
    };
    window.addEventListener(OPEN_DAILY_EVENT, go);
    return () => window.removeEventListener(OPEN_DAILY_EVENT, go);
  }, [navigate]);
  return null;
}
