import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Gift, X } from "lucide-react";

const KEY = "frass-rewards-ribbon-dismissed";

export function RewardsRibbon() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY) !== "1") setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div className="relative z-40 bg-gradient-to-r from-[color:var(--gold,#c9a24a)] via-amber-400 to-[color:var(--gold,#c9a24a)] text-[color:var(--ink,#0a0a0a)]">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] md:text-xs">
        <Gift className="h-4 w-4 shrink-0" />
        <span className="truncate">
          Unlock <b>40% OFF</b> your first order · 4 quick steps
        </span>
        <Link
          to="/rewards"
          className="ml-auto shrink-0 rounded-full bg-black px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-white hover:bg-black/80"
        >
          Unlock now
        </Link>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            localStorage.setItem(KEY, "1");
            setShow(false);
          }}
          className="rounded-full p-1 hover:bg-black/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
